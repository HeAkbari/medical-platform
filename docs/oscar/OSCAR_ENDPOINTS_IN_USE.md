# OSCAR Endpoints In Use

این سند دقیقاً نشان می‌دهد اپ در حالت `DATA_SOURCE=oscar` به کدام
endpointهای REST سرور واقعی **OSCAR EMR 19** (کلینیک اسپانسر) وصل است.
مبنا: کد فعلی (نه فرض یا WADL خام). معادلِ این سند برای FHIR:
[`FHIR_ENDPOINTS_IN_USE.md`](./FHIR_ENDPOINTS_IN_USE.md). طرحِ کاملِ تصمیم‌ها و
دلایل معماری در [`new-approach/docs-oscar-new-approach.md`](./new-approach/docs-oscar-new-approach.md)
است؛ این‌جا فقط «چه چیزی همین الان سیم‌کشی شده» ثبت می‌شود.

هر ردیف یکی از سه وضعیت را دارد:

- ✅ **تأییدشده زنده** — پاسخ واقعی (حتی خالی) از سندباکس کلینیک اسپانسر دیده شده.
- 🟡 **پیاده‌شده، تست زنده نشده** — کد بر اساس WADL/Postman collection نوشته شده ولی
  هنوز هیچ‌وقت با یک درخواست واقعی اجرا نشده (طبق قاعده‌ی «من دیگر خودم درخواست
  زنده به OSCAR نمی‌زنم» — [`deferred-items.md`](./new-approach/deferred-items.md)).
- ❌ **تأییدشده که در دسترس نیست** — امتحان شد و غیرقابل‌اعتماد بود؛ کد صراحتاً
  خطا می‌دهد، نه حدس/لیست خالیِ گمراه‌کننده.

## اتصال

| مورد | مقدار |
|------|-------|
| سرور | OSCAR EMR 19 — سرور واقعی کلینیک اسپانسر |
| Base URL | `{baseUrl}/ws/services` (از `ClinicCredential.baseUrl`، نه env var) |
| فعال‌سازی | `DATA_SOURCE=oscar` |
| Client | `OscarClient` در `packages/domain/src/adapters/oscar/oscar-client.ts` |
| Auth | OAuth 1.0a سه‌مرحله‌ای، امضای HMAC-SHA1 به‌ازای هر درخواست (کتابخانه‌ی `oauth-1.0a`)، بدون session/cookie |
| اعتبارنامه‌ها | جدول رمزنگاری‌شده‌ی `ClinicCredential` (AES-256-GCM، کلید در `CREDENTIALS_ENCRYPTION_KEY`) — نگاه کن به `packages/domain/src/adapters/platform/clinic-credentials.ts` |
| فرمت | `application/json` (پیش‌فرض)؛ فقط `providerService/providers` استثنائاً `application/xml` است |
| صفحه‌بندی | `offset`/`limit` روی query — نه `Bundle`+`entry[]` مثل FHIR |
| HTTP | `node:https` مستقیم (نه `fetch`) با `https.Agent({rejectUnauthorized:false})` وقتی `allowSelfSignedCert` است — نگاه کن به کامنت‌های `oscar-client.ts` درباره‌ی چرا |

`OscarClient` سه عملیات دارد: `get(path, {query?, format?})`،
`post(path, body?, opts?)`، `put(path, body?, opts?)`.

---

## ۱) بیمار (Patient)

هویت بیمار در حالت OSCAR کاملاً **پلتفرمی** است (نگاه کن به
`patient-clinic-linking-architecture.md`) — ثبت‌نام هیچ‌وقت با OSCAR تماس
نمی‌گیرد. `PrismaPatientRepository` (در `packages/domain/src/adapters/platform/`)
مستقیماً روی Postgres خودمان کار می‌کند، نه روی OSCAR.

اتصال واقعی به OSCAR فقط در لحظه‌ی **لینک‌شدن به کلینیک** اتفاق می‌افتد:

| مسیر | متد | وضعیت | استفاده |
|------|-----|-------|---------|
| `/demographics/matchDemographic` | `POST` (`{hin, dob}`) | ✅ تأییدشده زنده | `OscarClinicPatientMatcher.matchPatient` — تشخیص پرونده‌ی موجود بر اساس Healthcare Number + تاریخ تولد؛ کد `A`=match، `F`=not found |

مسیر اپ: `POST /api/v1/patients/link-clinic` → `LinkPatientToClinicUseCase`
→ `OscarClinicPatientMatcher` → `PrismaPatientClinicIdentityStore` (ذخیره‌ی
`{patientId, clinicId, externalPatientId}` در جدول `PatientClinicIdentity`،
هیچ PHI‌ای ذخیره نمی‌شود).

> `demographics/quickSearch`/`demographics/search`/`POST /demographics` که در
> سند طراحی اصلی پیش‌بینی شده بودند، در پیاده‌سازی نهایی استفاده نشدند —
> `matchDemographic` به‌تنهایی برای find-or-adopt کافی بود (بخش ۳ سند اصلی).

---

## ۲) پزشک (Doctor / Practitioner)

مسیر: `packages/domain/src/adapters/oscar/oscar-repositories.ts` → `OscarDoctorRepository`

| مسیر | متد | وضعیت | استفاده |
|------|-----|-------|---------|
| `/providerService/providers` | `GET` (فقط XML، `Accept: application/xml`) | ✅ تأییدشده زنده | لیست کامل پزشکان — فقط توسط `scripts/sync-doctors.ts` (job دوره‌ای) صدا زده می‌شود، نه در مسیر خواندنِ زنده‌ی کاربر |
| `/providerService/provider/{id}` | `GET` | ✅ تأییدشده زنده (۲۰۰ با بدنه‌ی خالی برای id نامعتبر) | `findDetailById` نوبت (resolve نام/تخصص پزشک) |

**مسیر خواندن (Find Physician، Physician Info، rating) هیچ‌وقت مستقیم OSCAR
را صدا نمی‌زند** — فقط از جدول `Doctor` در Postgres خودمان می‌خواند
(`PrismaDoctorDirectoryRepository` در `apps/web/src/lib/doctors/repository.ts`)،
که با `scripts/sync-doctors.ts` پر می‌شود. طبق بخش ۵ سند اصلی.

---

## ۳) نوبت (Appointment)

مسیر: `OscarAppointmentRepository`

| مسیر | متد | وضعیت | استفاده |
|------|-----|-------|---------|
| `/schedule/{demographicNo}/appointmentHistory` | `POST` | 🟡 پیاده‌شده — **باگ سرور شناخته‌شده: همیشه ۵۰۰** (نگاه کن به `deferred-items.md` #۳) | `findAll({patientId})` |
| `/schedule/fetchProviderAppts/{providerNo}/{sDate}/{eDate}` | `GET` (صفحه‌بندی‌شده) | 🟡 پیاده‌شده، تست زنده نشده | `findAll({doctorId})` بدون تاریخ مشخص (بازه‌ی ۹۰ روز) |
| `/schedule/{providerNo}/day/{date}` | `GET` | 🟡 پیاده‌شده، تست زنده نشده | `findAll({doctorId, date})` |
| `/schedule/getAppointment` | `GET` | ❌ پیاده نشده — شکل پارامتر/پاسخ هیچ‌وقت مستند نشده | `findById` (و به‌تبع آن `findDetailById`) فعلاً throw می‌کنند |
| `/schedule/add` | `POST` | 🟡 پیاده‌شده (بدنه از نمونه‌ی Postman صاحب پروژه)، هیچ‌وقت زنده اجرا نشده | `create` (رزرو نوبت) |
| `/schedule/appointment/{id}/updateStatus` | `POST` (`{status: 'c'|'t'}`) | 🟡 پیاده‌شده، هیچ‌وقت زنده اجرا نشده | `updateStatus` (لغو نوبت) |

نکات: `doctorId` ورودی همیشه Doctor.id پلتفرمی است — قبل از هر تماس OSCAR با
`DoctorExternalIdResolver` به `providerNo` واقعی resolve می‌شود.
`patientId` هم قبل از تماس با `PatientClinicIdentityStore` به `demographicNo`
resolve می‌شود؛ اگر بیمار هنوز به این کلینیک لینک نباشد، `findAll` لیست خالی
برمی‌گرداند (نه خطا).

---

## ۴) آلرژی + شرایط سلامت (Allergy / Condition)

مسیر: `OscarHealthConditionRepository`

| مسیر | متد | وضعیت | استفاده |
|------|-----|-------|---------|
| `/allergies/active?demographicNo=` | `GET` | ✅ تأییدشده زنده | بخش آلرژیِ `findAll` |
| `/dxRegisty/getDiseaseRegistry?demographicNo=` | `GET` | ✅ تأییدشده زنده (پاسخ خالی `[]` دیده شده)؛ **شکل آیتمِ پرشده هنوز تأیید نشده** (`deferred-items.md` #۶) | بخش Problem List/Condition‌ِ `findAll` |

هر دو منبع در یک لیست ادغام و بر اساس تاریخ مرتب می‌شوند. `findById` روی هر
دو نوع throw می‌کند — OSCAR هیچ lookup تک‌آیتمیِ مستقل از بیمار ندارد
(`deferred-items.md` #۵).

---

## ۵) نسخه/دارو (Prescription)

مسیر: `OscarPrescriptionRepository`

| مسیر | متد | وضعیت | استفاده |
|------|-----|-------|---------|
| `/rx/drugs/current/{demographicNo}` | `GET` (صفحه‌بندی‌شده) | 🟡 پیاده‌شده، تست زنده نشده | نسخه‌های جاری |
| `/rx/drugs/archived/{demographicNo}` | `GET` (صفحه‌بندی‌شده) | 🟡 پیاده‌شده، تست زنده نشده | نسخه‌های آرشیوشده |

هر دو نتیجه ادغام و بر اساس `authoredOn` مرتب می‌شوند. `findById` throw
می‌کند (همان محدودیت سیستمی).

---

## ۶) واکسیناسیون (Immunization)

مسیر: `OscarImmunizationRepository`

| مسیر | متد | وضعیت | استفاده |
|------|-----|-------|---------|
| `/preventions/immunizations/{demographicNo}` | `GET` | 🟡 پیاده‌شده، تست زنده نشده | `findAll` |

`findById` throw می‌کند (همان محدودیت سیستمی).

---

## ۷) نتایج آزمایش (Test Results)

مسیر: `OscarTestResultRepository`

| مسیر | متد | وضعیت | استفاده |
|------|-----|-------|---------|
| `/labs/hl7LabsByDemographicNo?demographicNo=&offset=&limit=` | `GET` | ✅ تأییدشده زنده (پاسخ خالی `{"messages":[]}` دیده شده — کلید wrapper `messages` است، نه `content`)؛ **شکل آیتمِ پرشده هنوز تأیید نشده** (`deferred-items.md` #۷) | `findAll` |

`POST /measurements/{demographicNo}` که در طرح اولیه به‌عنوان مکملِ این
endpoint پیش‌بینی شده بود، **کنار گذاشته شد** — بدنه‌ی درخواستش هیچ‌وقت مستند
نشد. `findById` throw می‌کند.

---

## ۸) اسناد (Documents)

مسیر: `OscarDocumentRepository`

| مسیر | متد | وضعیت | استفاده |
|------|-----|-------|---------|
| `/demographics/{dataId}?includes[]=documents` | `GET` | ❌ تأییدشده که در دسترس نیست — ۴۰۱ غیرقابل‌اعتماد، حتی بعد از چند روش encode | — |

`findAll`/`findById` هر دو صراحتاً خطای «در دسترس نیست» می‌دهند — نه لیست
خالیِ گمراه‌کننده. جزئیات حادثه‌ی auth مرتبط در `deferred-items.md` #۸.

---

## ۹) نقشه / کلینیک‌ها (Facilities)

**عمداً نگاشت نشده به OSCAR** — طبق تصمیم #۲ سند اصلی، داده‌ی facilities
پلتفرمی است و مستقیماً از جدول `Facility` در Postgres خودمان خوانده می‌شود
(`PrismaFacilityRepository` در `apps/web/src/lib/facilities/repository.ts`)،
مستقل از `DATA_SOURCE`. OSCAR اصلاً مفهوم چند-کلینیکی/Location ندارد.

---

## جمع‌بندی endpointهای OSCAR در حال استفاده

**خواندن:** `providerService/providers` (XML) · `providerService/provider/{id}` ·
`schedule/{demographicNo}/appointmentHistory` · `schedule/fetchProviderAppts/...` ·
`schedule/{providerNo}/day/{date}` · `allergies/active` ·
`dxRegisty/getDiseaseRegistry` · `rx/drugs/current/{demographicNo}` ·
`rx/drugs/archived/{demographicNo}` · `preventions/immunizations/{demographicNo}` ·
`labs/hl7LabsByDemographicNo` — **۱۱ endpoint**

**نوشتن:** `demographics/matchDemographic` (`POST`، فقط match نه create) ·
`schedule/add` (`POST`) · `schedule/appointment/{id}/updateStatus` (`POST`)

**تأییدشده که در دسترس نیست:** `demographics/{dataId}?includes[]=documents`،
`schedule/getAppointment`

**هیچ‌وقت پیاده نشد (خارج از محدوده طبق سند اصلی):** `demographics/quickSearch`،
`demographics/search`، `POST /demographics`، `measurements/{demographicNo}`،
`notes/*`، `schedule/deleteAppointment`، `rx/prescribe`/`rx/new`/`rx/favorites`،
و هر endpoint مربوط به billing/eforms/tickler/consults/surveillance/jobs.

---

## نگاشت route داخلی → OSCAR

| route اپ | عملیات OSCAR پشت آن |
|----------|---------------------|
| `GET /api/v1/doctors` | جدول `Doctor` (Postgres) — پر شده توسط `providerService/providers` در job دوره‌ای |
| `GET /api/v1/doctors/{id}` | جدول `Doctor` (Postgres) |
| `POST /api/v1/patients/link-clinic` | `POST /demographics/matchDemographic` |
| `GET/POST /api/v1/appointments` | `schedule/{demographicNo}/appointmentHistory` \| `schedule/fetchProviderAppts/...` \| `schedule/{providerNo}/day/{date}` \| `POST /schedule/add` |
| `POST /api/v1/appointments/{id}/cancel` | `POST /schedule/appointment/{id}/updateStatus` |
| `GET /api/v1/appointments/{id}` | ❌ مسدود — `schedule/getAppointment` پیاده نشده |
| `GET /api/v1/facilities[/{id}]` | جدول `Facility` (Postgres) — بدون تماس OSCAR |
| `GET /api/v1/health-records[/{id}]` | `allergies/active` + `dxRegisty/getDiseaseRegistry` |
| `GET /api/v1/prescriptions` | `rx/drugs/current/{demographicNo}` + `rx/drugs/archived/{demographicNo}` |
| `GET /api/v1/vaccinations` | `preventions/immunizations/{demographicNo}` |
| `GET /api/v1/test-results` | `labs/hl7LabsByDemographicNo` |
| `GET /api/v1/documents[/{id}]` | ❌ مسدود — بدون endpoint تأییدشده |

---

## یادداشت‌های مهم برای ادامه‌ی کار

- هر ردیف 🟡 («پیاده‌شده، تست زنده نشده») باید طبق قاعده‌ی الزامی این پروژه
  فقط از طریق درخواست دقیق (مسیر + متد + پارامتر) از صاحب پروژه در Postman
  تست شود — نه با یک تماس زنده‌ی مستقیم از این طرف.
- فهرست کامل شکاف‌ها/تصمیم‌های معوق (نه فقط endpointها) در
  [`new-approach/deferred-items.md`](./new-approach/deferred-items.md) نگه‌داری می‌شود.
