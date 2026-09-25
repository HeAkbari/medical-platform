# Patient Identity در معماری چندکلینیکی

## اصل طراحی

بیمار می‌تواند در چند کلینیک و چند OSCAR پروفایل داشته باشد.

-   **HIN (Health Insurance Number):** متعلق به خود بیمار است و در حالت
    معمول بین کلینیک‌ها یکسان است.
-   **demographicNo:** شناسه محلی بیمار در هر OSCAR است و بین کلینیک‌ها
    متفاوت خواهد بود.
-   **patientId:** شناسه سراسری و مستقل بیمار در پلتفرم ما؛ بهتر است
    UUID باشد.

## مدل پیشنهادی

``` text
Patient
- id (UUID)              ← شناسه اصلی پلتفرم
- healthNumber (HIN)
- healthNumberProvince

PatientClinicIdentity
- patientId
- clinicId
- externalPatientId      ← در OSCAR همان demographicNo
```

مثال:

``` text
Patient: 7ca4...
HIN: 9876543217

Clinic A → demographicNo = 2
Clinic B → demographicNo = 587
```

## قاعده اصلی

**HIN نباید Primary Key یا شناسه عمومی بیمار در پلتفرم باشد.**

از `patientId` برای هویت سراسری بیمار استفاده می‌کنیم و برای ارتباط با هر
کلینیک، نگاشت زیر را نگه می‌داریم:

``` text
patientId + clinicId → demographicNo
```

HIN بیشتر برای **تطبیق/شناسایی بیمار (Patient Matching)** و امور بیمه‌ای
استفاده می‌شود. برای تطبیق مطمئن‌تر بهتر است همراه اطلاعاتی مثل تاریخ تولد
و نام خانوادگی بررسی شود.

## نتیجه

``` text
patientId      = هویت بیمار در پلتفرم
demographicNo  = هویت بیمار در یک OSCAR مشخص
HIN            = شماره بیمه/Health Number برای Matching و Verification
```
