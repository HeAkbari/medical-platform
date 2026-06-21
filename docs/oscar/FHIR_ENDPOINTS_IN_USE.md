# FHIR Endpoints In Use

این سند دقیقاً نشان می‌دهد اپ **همین الان** به کدام متد/endpointهای FHIR وصل است و
از کجا داده می‌گیرد. مبنا: کد فعلی (نه فرض). فاز ۱ = HAPI FHIR R4 محلی.

## اتصال

| مورد | مقدار |
|------|-------|
| سرور | HAPI FHIR R4 |
| Base URL | `http://localhost:8080/fhir` (از `FHIR_BASE_URL`) |
| فعال‌سازی | `DATA_SOURCE=fhir` در `apps/web/.env.local` |
| Client | `FhirClient` در `packages/domain/src/adapters/fhir/fhir-client.ts` |
| Auth | اختیاری Bearer (`FHIR_TOKEN`) — برای فاز ۲ (OSCAR) آماده، فعلاً خالی |
| فرمت | `application/fhir+json` |

`FhirClient` چهار عملیات REST دارد که همه‌ی موارد زیر از همین‌ها استفاده می‌کنند:

| متد client | HTTP | معادل FHIR |
|------------|------|------------|
| `search<T>(type, query)` | `GET /{type}?{params}` | search interaction |
| `read<T>(type, id)` | `GET /{type}/{id}` | read interaction |
| `create<T>(type, body)` | `POST /{type}` | create interaction |
| `update<T>(type, id, body)` | `PUT /{type}/{id}` | update interaction |

---

## ۱) منابع بالینی هسته (لایه‌ی domain — ports/adapters)

مسیر: `packages/domain/src/adapters/fhir/fhir-repositories.ts`
از طریق `appointmentService` / `patientService` / `doctorService` و routeهای `/api/v1/*`.

| Resource | عملیات FHIR | پارامتر/شرح | استفاده در اپ |
|----------|-------------|-------------|----------------|
| **Patient** | `GET /Patient` | همه‌ی بیماران | لیست بیماران (staff)، فرم رزرو |
| **Patient** | `GET /Patient/{id}` | read تکی | پروفایل، `findById` (auth) |
| **Patient** | `GET /Patient?phone={digits}` | جستجوی شماره (login) | `findByPhone` در phone-auth |
| **Patient** | `POST /Patient` | ساخت بیمار | ثبت‌نام (registration) |
| **Practitioner** | `GET /Practitioner` | همه‌ی پزشکان | لیست پزشکان |
| **Practitioner** | `GET /Practitioner/{id}` | read تکی | resolve نام/تخصص پزشک |
| **Appointment** | `GET /Appointment?patient=&practitioner=&date=` | فیلتر نوبت‌ها | صفحه‌ی Appointments |
| **Appointment** | `GET /Appointment/{id}` | read تکی | (در دسترس از طریق service) |
| **Appointment** | `POST /Appointment` | ساخت نوبت | رزرو نوبت |
| **Appointment** | `PUT /Appointment/{id}` | لغو (read سپس PUT با `status=cancelled`) | دکمه‌ی Cancel |

---

## ۲) نقشه / کلینیک‌ها (Facilities)

مسیر: `apps/web/src/features/map/data/*`

| Resource | عملیات FHIR | پارامتر | استفاده |
|----------|-------------|---------|---------|
| **Location** | `GET /Location?status=active` | کلینیک‌های فعال | marker‌های نقشه (`/api/v1/facilities`) |
| **Location** | `GET /Location/{id}` | read تکی | جزئیات کلینیک |
| **HealthcareService** | `GET /HealthcareService?location=Location/{id}&_include=HealthcareService:organization` | سرویس‌ها + سازمان | drawer جزئیات کلینیک |
| **PractitionerRole** | `GET /PractitionerRole?location=Location/{id}&_include=PractitionerRole:practitioner` | نقش‌ها + پزشک | drawer جزئیات کلینیک |

> `_include` = join سمت سرور: منبع مرتبط در همان Bundle برمی‌گردد (بدون درخواست جدا).

---

## ۳) سوابق سلامت (Health Records)

مسیر: `apps/web/src/features/health-records/data/*`

### Test results
| Resource | عملیات FHIR | پارامتر | استفاده |
|----------|-------------|---------|---------|
| **Observation** | `GET /Observation?patient=Patient/{id}` | لیست نتایج | صفحه‌ی Test results |
| **Observation** | `GET /Observation/{id}` | read تکی | drawer جزئیات |
| **DiagnosticReport** | `GET /DiagnosticReport?result=Observation/{id}` | گزارش + نتیجه‌گیری | drawer جزئیات |

### Prescriptions
| Resource | عملیات FHIR | پارامتر | استفاده |
|----------|-------------|---------|---------|
| **MedicationRequest** | `GET /MedicationRequest?patient=Patient/{id}` | لیست نسخه‌ها | صفحه‌ی Prescriptions |
| **MedicationRequest** | `GET /MedicationRequest/{id}` | read تکی | drawer جزئیات |
| **MedicationDispense** | `GET /MedicationDispense?prescription=MedicationRequest/{id}` | تاریخچه‌ی پیچیدن | drawer جزئیات |
| **Practitioner** | `GET /Practitioner/{id}` | نام پزشک تجویزکننده | drawer جزئیات |

### Vaccinations
| Resource | عملیات FHIR | پارامتر | استفاده |
|----------|-------------|---------|---------|
| **Immunization** | `GET /Immunization?patient=Patient/{id}` | لیست واکسن‌ها | صفحه‌ی Vaccinations |
| **Immunization** | `GET /Immunization/{id}` | read تکی | drawer جزئیات |

### Health conditions
| Resource | عملیات FHIR | پارامتر | استفاده |
|----------|-------------|---------|---------|
| **Condition** | `GET /Condition?patient=Patient/{id}` | بیماری‌ها | صفحه‌ی Health conditions |
| **Condition** | `GET /Condition/{id}` | read تکی | drawer جزئیات |
| **AllergyIntolerance** | `GET /AllergyIntolerance?patient=Patient/{id}` | آلرژی‌ها | صفحه‌ی Health conditions |
| **AllergyIntolerance** | `GET /AllergyIntolerance/{id}` | read تکی | drawer جزئیات |

### Documents
| Resource | عملیات FHIR | پارامتر | استفاده |
|----------|-------------|---------|---------|
| **DocumentReference** | `GET /DocumentReference?patient=Patient/{id}` | لیست اسناد | صفحه‌ی Documents |
| **DocumentReference** | `GET /DocumentReference/{id}` | read تکی | drawer جزئیات |

> دانلود فایل واقعی (`attachment.url` → `Binary`) هنوز پیاده نشده — فقط متادیتا.

---

## ۴) جزئیات نوبت (Appointment detail)

مسیر: `apps/web/src/features/appointments/data/appointment-detail-source.ts`

| Resource | عملیات FHIR | شرح |
|----------|-------------|-----|
| **Appointment** | `GET /Appointment/{id}` | نوبت پایه |
| **Practitioner** | `GET /Practitioner/{id}` | تخصص + تماس پزشک |
| **Location** | `GET /Location/{id}` | آدرس + تلفن کلینیک |

---

## جمع‌بندی منابع FHIR در حال استفاده

**خواندن (read/search):** Patient · Practitioner · Appointment · Location ·
HealthcareService · PractitionerRole · Observation · DiagnosticReport ·
MedicationRequest · MedicationDispense · Immunization · Condition ·
AllergyIntolerance · DocumentReference — **۱۴ نوع منبع**

**نوشتن (create/update):** Patient (`POST`) · Appointment (`POST` + `PUT`)

**search paramها در استفاده:** `patient`، `practitioner`، `date`، `phone`،
`status`، `location`، `result`، `prescription`، `_include`

---

## نگاشت route داخلی → FHIR

| route اپ | عملیات FHIR پشت آن |
|----------|---------------------|
| `GET /api/v1/patients` | `GET /Patient` |
| `GET /api/v1/patients/{id}` | `GET /Patient/{id}` |
| `GET /api/v1/doctors` | `GET /Practitioner` |
| `GET /api/v1/appointments` | `GET /Appointment?...` |
| `POST /api/v1/appointments` | `POST /Appointment` |
| `GET /api/v1/appointments/{id}` | `GET /Appointment/{id}` + `Practitioner` + `Location` |
| `POST /api/v1/appointments/{id}/cancel` | `GET` + `PUT /Appointment/{id}` |
| `GET /api/v1/facilities` | `GET /Location?status=active` |
| `GET /api/v1/facilities/{id}` | `Location` + `HealthcareService` + `PractitionerRole` |
| `GET /api/v1/test-results` | `GET /Observation?...` |
| `GET /api/v1/test-results/{id}` | `Observation` + `DiagnosticReport` |
| `GET /api/v1/prescriptions` | `GET /MedicationRequest?...` |
| `GET /api/v1/prescriptions/{id}` | `MedicationRequest` + `MedicationDispense` + `Practitioner` |
| `GET /api/v1/vaccinations[/{id}]` | `GET /Immunization[...]` |
| `GET /api/v1/health-records` | `GET /Condition` + `GET /AllergyIntolerance` |
| `GET /api/v1/health-records/{id}?kind=` | `GET /Condition/{id}` یا `GET /AllergyIntolerance/{id}` |
| `GET /api/v1/documents[/{id}]` | `GET /DocumentReference[...]` |

---

## یادداشت برای فاز ۲ (OSCAR sandbox)
- فقط `FHIR_BASE_URL` و `FHIR_TOKEN` در `.env.local` عوض می‌شود؛ همین متدها باید کار کنند.
- تفاوت‌های احتمالی OSCAR: نیاز به Bearer token، paginationِ Bundle، و ممکن است
  بعضی search paramها یا `_include`ها متفاوت پشتیبانی شوند — همان‌جا تطبیق می‌دهیم.
- auth واقعی (OAuth2/SMART on FHIR) در این فاز اضافه می‌شود (فعلاً عمداً به تعویق افتاده).
