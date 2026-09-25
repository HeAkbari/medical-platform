# معماری هویت بیمار و اتصال به کلینیک‌های OSCAR

## تصمیم کلی

رویکرد پیشنهادی برای MVP:

1.  **ثبت‌نام/لاگین با OTP تلفن** مستقل از OSCAR و بدون نیاز به HIN انجام
    شود.
2.  **تکمیل HIN و اتصال به کلینیک** یک عملیات جدا و فقط هنگام اولین نیاز
    به سرویس‌های مرتبط با کلینیک/اطلاعات پزشکی باشد.
3.  پس از Match موفق، ارتباط بیمار پلتفرم با بیمار OSCAR ذخیره شود.
4.  اطلاعات بالینی و پزشکی همچنان به‌صورت زنده از OSCAR خوانده شود.

جریان کلی:

``` text
OTP Registration
      ↓
Platform Patient (UUID)
      ↓
در زمان نیاز
Patient Matching (HIN + DOB)
      ↓
Clinic Link
      ↓
Live Clinical Data from OSCAR
```

------------------------------------------------------------------------

## 1. شناسه Patient از ابتدا UUID باشد

با جداشدن ثبت‌نام از OSCAR، دیگر نمی‌توان:

``` text
Patient.id = demographicNo
```

را مبنا قرار داد؛ چون هنگام ثبت‌نام هنوز `demographicNo` نداریم.

بنابراین:

``` text
Patient.id = UUID
```

باید شناسه اصلی و سراسری بیمار در پلتفرم باشد.

------------------------------------------------------------------------

## 2. demographicNo روی Patient ذخیره نشود

حتی برای MVP بهتر است `demographicNo` مستقیماً روی `Patient` قرار نگیرد؛
چون یک بیمار می‌تواند در چند کلینیک OSCAR داشته باشد و در هرکدام
`demographicNo` متفاوتی داشته باشد.

مدل پیشنهادی:

``` text
Patient
-------
id (UUID)

PatientClinicIdentity
---------------------
patientId
clinicId
externalPatientId
linkedAt
```

برای OSCAR:

``` text
externalPatientId = demographicNo
```

مثال:

``` text
Patient P1
 ├── Clinic A → demographicNo = 2
 ├── Clinic B → demographicNo = 847
 └── Clinic C → demographicNo = 91
```

Constraintهای پیشنهادی:

``` text
UNIQUE(patientId, clinicId)
UNIQUE(clinicId, externalPatientId)
```

------------------------------------------------------------------------

## 3. linkToClinic داخل PatientRepository قرار نگیرد

`PatientRepository` بهتر است فقط مسئول Persistence بیمار باشد:

``` ts
interface PatientRepository {
  create(...);
  findById(...);
  update(...);
}
```

عملیات Link کردن بیمار به کلینیک شامل Business Logic، ارتباط با OSCAR و
ذخیره Mapping است؛ بنابراین بهتر است به‌صورت یک Use Case مستقل طراحی شود:

``` text
LinkPatientToClinicUseCase
```

و برای Patient Matching یک Port جدا داشته باشیم:

``` ts
interface ClinicPatientMatcher {
  matchPatient(input: {
    clinicId: string;
    healthNumber: string;
    dateOfBirth: string;
  }): Promise<PatientMatchResult>;
}
```

پیاده‌سازی OSCAR:

``` text
OscarClinicPatientMatcher
        ↓
POST /demographics/matchDemographic
```

------------------------------------------------------------------------

## 4. فرآیند Link شدن بیمار به کلینیک

برای OSCAR، Matching با `HIN + DOB` انجام می‌شود:

``` json
{
  "hin": "9876543217",
  "dob": "1815-01-11"
}
```

نمونه پاسخ موفق:

``` json
{
  "code": "A",
  "demographicNo": 2
}
```

جریان پیشنهادی:

``` text
LinkPatientToClinicUseCase
        ↓
آیا لینک قبلاً وجود دارد؟
        │
        ├── Yes → همان لینک برگردانده شود
        │
        └── No
             ↓
       ClinicPatientMatcher
             ↓
       OSCAR matchDemographic
             ↓
          Match?
        ┌────┴────┐
       Yes        No
        ↓          ↓
Save Patient     Return
ClinicIdentity   appropriate result
```

پس از Match موفق:

``` text
patientId + clinicId → demographicNo
```

ذخیره می‌شود و در درخواست‌های بعدی نیازی به اجرای مجدد Matching نیست.

------------------------------------------------------------------------

## 5. عملیات باید Idempotent باشد

اگر بیمار قبلاً به کلینیک متصل شده باشد، درخواست مجدد نباید دوباره
`matchDemographic` را فراخوانی کند.

ابتدا باید Mapping موجود بررسی شود:

``` text
(patientId, clinicId)
```

و در صورت وجود، همان `externalPatientId` برگردانده شود.

------------------------------------------------------------------------

## 6. نتیجه Matching فقط not_found نباشد

بهتر است خطاهای مختلف از هم تفکیک شوند:

``` ts
type PatientMatchResult =
  | {
      status: 'matched';
      externalPatientId: string;
    }
  | {
      status: 'not_found';
    }
  | {
      status: 'invalid_data';
    }
  | {
      status: 'unavailable';
    };
```

مثلاً:

``` text
not_found
```

با:

``` text
OSCAR unavailable
```

یک وضعیت نیست.

------------------------------------------------------------------------

## 7. بیمار بدون HIN

برای MVP لازم نیست Matching جایگزین پیچیده‌ای ایجاد شود.

جریان پیشنهادی:

``` text
No HIN
  ↓
Automatic Linking Unavailable
  ↓
Contact Clinic
```

در فازهای بعدی می‌توان روش‌های جایگزین Matching را بررسی کرد.

------------------------------------------------------------------------

## 8. HIN یک داده حساس است

HIN نباید:

-   در Log ثبت شود.
-   داخل URL قرار بگیرد.
-   در Exception Message نمایش داده شود.
-   وارد Analytics شود.
-   بدون نیاز در Telemetry یا Tracing ذخیره شود.

اگر HIN در دیتابیس پلتفرم نگهداری می‌شود، دسترسی به آن باید محدود و حفاظت
از آن متناسب با حساسیت داده انجام شود.

------------------------------------------------------------------------

## 9. Platform Profile از Clinic Identity جدا باشد

اطلاعات پلتفرم:

``` text
Platform Profile
----------------
mobile
displayName
avatar
preferences
...
```

از اطلاعات مربوط به کلینیک جدا باشد:

``` text
Clinic Identity
---------------
clinicId
externalPatientId
healthNumber
verifiedAt
...
```

مثلاً ممکن است:

``` text
Platform mobile = شماره تأییدشده با OTP
OSCAR phone      = شماره قدیمی پرونده بیمار
```

در این حالت اطلاعات OSCAR نباید بدون قاعده اطلاعات تأییدشده پلتفرم را
Overwrite کند.

------------------------------------------------------------------------

## معماری نهایی پیشنهادی

``` text
                OTP
                 ↓
             Patient
             id: UUID
                 │
                 │ First Clinical Action
                 ▼
      LinkPatientToClinicUseCase
                 │
       ┌─────────┴──────────┐
       ▼                    ▼
PatientClinicIdentity   ClinicPatientMatcher
      Repository              │
                              ▼
                     OscarPatientMatcher
                              │
                              ▼
                    matchDemographic
```

بعد از ایجاد Link:

``` text
Patient App
    ↓
Platform API
    ↓
patientId + clinicId
    ↓
PatientClinicIdentity
    ↓
demographicNo
    ↓
OSCAR API
```

------------------------------------------------------------------------

## جمع‌بندی

تصمیم نهایی پیشنهادی:

``` text
patientId      = شناسه سراسری بیمار در پلتفرم (UUID)

demographicNo  = شناسه بیمار در OSCAR یک کلینیک مشخص

HIN + DOB      = اطلاعات مورد استفاده برای Patient Matching

PatientClinicIdentity
               = Mapping بین Patient پلتفرم و Patient کلینیک
```

ثبت‌نام OTP باید مستقل از OSCAR باقی بماند و HIN به‌صورت Lazy فقط هنگام
اولین نیاز به اتصال بیمار به کلینیک دریافت شود.

دو تصمیم معماری مهم از همین MVP:

1.  `Patient.id` از ابتدا UUID باشد و `demographicNo` روی Patient قرار
    نگیرد.
2.  اتصال بیمار به کلینیک به‌صورت `LinkPatientToClinicUseCase` و یک Port
    مستقل برای Patient Matching پیاده‌سازی شود، نه به‌عنوان متدی در
    `PatientRepository`.
