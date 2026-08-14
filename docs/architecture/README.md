# معماری بک‌اند و دیتابیس — نمای کلی

سند مرجع کامل: [`docs/oscar/new-approach/docs-oscar-new-approach.md`](../oscar/new-approach/docs-oscar-new-approach.md).
این‌جا فقط نمای بصری/خلاصه است.

## ۱. لایه‌ها (Ports & Adapters)

هر صفحه از طریق یک route در `/api/v1/*` به یک **port** (اینترفیس) در
`packages/domain` می‌رسد، نه مستقیم به OSCAR/FHIR/دیتابیس. کدام **adapter**
پشتِ آن port واقعاً اجرا می‌شود را فقط یک env var (`DATA_SOURCE`) تعیین می‌کند —
بقیه‌ی کد اصلاً نمی‌داند داده از کجا می‌آید.

```mermaid
flowchart LR
    UI["صفحات فرانت (apps/web)"] --> API["/api/v1/* routes"]
    API --> REPO["repositories\napps/web/src/lib/repositories.ts\n(composition root)"]

    REPO -->|"DATA_SOURCE=mock"| MOCK[("JSON در حافظه")]
    REPO -->|"DATA_SOURCE=fhir"| FHIR[("HAPI FHIR sandbox")]
    REPO -->|"DATA_SOURCE=oscar"| OSCAR_A["Oscar adapters"]

    OSCAR_A -->|"OAuth1 signed"| OSCAR[("OSCAR EMR 19\nسرور کلینیک اسپانسر")]
    OSCAR_A --> PG[("Postgres\n(packages/db)")]

    REPO --> FAC["FacilityRepository"] --> PG
    REPO --> DOC["DoctorDirectoryRepository"] --> PG
```

**نکته‌ی کلیدی:** Facilities و دایرکتوری پزشکان (پروفایل، نه availability)
همیشه از Postgres خودمان خوانده می‌شوند — مستقل از `DATA_SOURCE` — چون
پلتفرمی‌اند، نه داده‌ی یک کلینیک خاص.

## ۲. دیتابیس (Postgres — `packages/db`)

```mermaid
erDiagram
    Patient ||--o{ PatientClinicIdentity : "لینک به هر کلینیک"
    Doctor ||--o{ Review : "نظرات"

    Patient {
        string id PK "UUID پلتفرمی"
        string firstName
        string lastName
        string email UK
        string phone
    }
    PatientClinicIdentity {
        string patientId FK
        string clinicId
        string externalPatientId "demographicNo در OSCAR"
        string healthNumber "HIN — فقط برای re-verify"
    }
    ClinicCredential {
        string clinicId UK
        string emrType "oscar | fhir"
        string baseUrl
        string consumerKeyEnc "رمزنگاری‌شده AES-256-GCM"
        string accessTokenEnc "رمزنگاری‌شده AES-256-GCM"
    }
    Facility {
        string id PK
        json data "کل شِیپ MapFacility"
    }
    Doctor {
        string id PK "UUID پلتفرمی"
        string clinicId
        string externalProviderId "providerNo در OSCAR"
        string clinicName "join با Facility — فعلاً خالی"
    }
    Review {
        string doctorId FK
        string source "patient | clinic | ai"
        int rating
    }
```

- **PHI (سوابق بالینی واقعی) هرگز این‌جا ذخیره نمی‌شود** — نسخه، آزمایش،
  آلرژی، نوبت، همیشه زنده از OSCAR/FHIR خوانده می‌شوند، هیچ‌وقت cache/persist
  نمی‌شوند. فقط لینک هویتی (`PatientClinicIdentity`) این‌جاست، نه خودِ داده.
- `User` (در `auth.prisma`) فعلاً مستقل و بی‌سیم است؛ session/OTP هنوز کاملاً
  **در حافظه‌ی پروسه** نگه‌داری می‌شود (`phone-auth-service.ts`)، نه در
  Postgres — یک شکاف شناخته‌شده، نه یک تصمیم نهایی.

## ۳. ثبت‌نام + لینک‌شدن به کلینیک (Registration flow)

بیمار در لحظه‌ی ثبت‌نام **هیچ تماسی با OSCAR نمی‌گیرد** — فقط یک `Patient`
پلتفرمی ساخته می‌شود. لینک‌شدن به کلینیک، تنبل (lazy) و فقط در اولین
نیاز واقعی (مثلاً اولین نوبت‌گیری) اتفاق می‌افتد:

```mermaid
sequenceDiagram
    participant U as بیمار
    participant App as apps/web
    participant DB as Postgres
    participant OSCAR

    U->>App: ثبت‌نام با OTP تلفن
    App->>DB: ساخت Patient (بدون تماس با هیچ EMR)
    Note over U,App: بیمار الان می‌تواند در اپ بگردد،<br/>ولی هنوز به هیچ کلینیکی لینک نیست

    U->>App: اولین نوبت‌گیری → وارد کردن HIN + تاریخ تولد
    App->>OSCAR: POST /demographics/matchDemographic {hin, dob}
    OSCAR-->>App: demographicNo (در صورت match)
    App->>DB: ساخت PatientClinicIdentity {patientId, clinicId, externalPatientId}
    App->>OSCAR: (تماس‌های بعدی سوابق/نوبت با همین externalPatientId)
```

## ۴. سه حالت `DATA_SOURCE`

| مقدار | داده از کجا | برای چی |
|---|---|---|
| `mock` | JSON هاردکد در `packages/domain` | توسعه‌ی فرانت بدون وابستگی به سرور |
| `fhir` | سندباکس HAPI FHIR محلی | تست/دموی قدیمی، هنوز کار می‌کند |
| `oscar` | سرور واقعی OSCAR EMR 19 (کلینیک اسپانسر) + Postgres خودمان | مسیر واقعی پروداکشن |

جزئیات endpoint‌به‌endpoint حالت `oscar` (کدام تأیید شده، کدام هنوز نه):
[`docs/oscar/OSCAR_ENDPOINTS_IN_USE.md`](../oscar/OSCAR_ENDPOINTS_IN_USE.md).
لیست کامل شکاف‌ها/تصمیم‌های معوق: [`deferred-items.md`](../oscar/new-approach/deferred-items.md).
