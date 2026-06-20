# OSCAR EMR — گزینه‌های نصب و تست

## زمینه
هدف: تست API های OSCAR قبل از خرید OSCAR Pro از WELL Health.  
محیط: Docker نصب شده، 12 CPU، 15GB RAM.

نکته مهم: نسخه open-source با OSCAR Pro تفاوت دارد:
- **FHIR version**: open-source از DSTU2 (همان R2) استفاده می‌کند، OSCAR Pro احتمالاً R4 (هنوز با WELL تأیید نشده)
- **Authentication**: مدل متفاوت (OSCAR Pro از apps.health onboarding استفاده می‌کند)

---

## استراتژی خرید (۳ فازی)
چون نسخه sandbox هم هزینه دارد، تیم نمی‌خواهد قبل از یک تست اولیه پولی پرداخت کند. بنابراین خرید به‌صورت پلکانی انجام می‌شود تا ریسک هر مرحله قبل از پرداخت بعدی کاهش پیدا کند:

| فاز | کار | هزینه | چه چیزی تست می‌شود |
|-----|-----|-------|---------------------|
| **۱ — الان** | تست happy-path با HAPI FHIR (گزینه C) | رایگان | آمادگی سمت ما: آیا کد integration می‌تواند با یک FHIR R4 endpoint حرف بزند و resource ها را parse کند |
| **۲ — بعد** | خرید sandbox OSCAR | کم | API و رفتار واقعی OSCAR (auth، schema، endpoint های واقعی) |
| **۳ — نهایی** | خرید نسخه اصلی OSCAR Pro | اصلی | محیط production |

> **توجه:** اعتبارسنجی واقعی API های OSCAR در فاز ۲ (sandbox) انجام می‌شود، نه در فاز ۱. هدف فاز ۱ صرفاً اطمینان از آماده‌بودن سمت ماست، نه شبیه‌سازی خود OSCAR.

---

## گزینه A — Build کامل OSCAR از Source

**زمان**: 1-2 ساعت  
**مناسب برای**: دیدن UI و workflow پزشکی واقعی OSCAR

### مراحل
1. نصب Java 8 + Maven روی سیستم
2. Clone از Bitbucket رسمی: `https://bitbucket.org/oscaremr/oscar`
3. Build با Maven: `mvn install`
4. Deploy WAR file داخل `scoophealth/oscar-latest-docker`
5. اضافه کردن database dump (Oscar15ON.sql)
6. اجرا با `docker-compose up`

**دسترسی**: http://localhost:8091/oscar_mcmaster (oscar/oscar)

### پیش‌نیازها
- Java 8 JDK
- Maven 3.x
- فایل Oscar15ON.sql (database dump رسمی)

---

## گزینه B — OSCAR Demo Instance Online

**زمان**: فوری  
**مناسب برای**: تست سریع UI بدون نصب

- چند sandbox online وجود دارد که بدون نصب قابل دسترسی‌اند
- محدودیت: کنترل کامل روی داده و API ندارید

---

## گزینه C — HAPI FHIR Server ✅ (انتخاب‌شده برای فاز ۱)

**زمان**: ~30 دقیقه  
**نقش**: تست happy-path رایگان برای فاز ۱ — اطمینان از آمادگی سمت ما قبل از خرید sandbox

> این گزینه **معادل OSCAR Pro نیست**. HAPI یک سرور مرجع FHIR است و auth، schema و رفتار اختصاصی OSCAR را شبیه‌سازی نمی‌کند. اینجا فقط بررسی می‌کنیم که کد integration خودمان با یک FHIR R4 endpoint درست کار می‌کند. تست واقعی OSCAR در فاز ۲ (sandbox) انجام می‌شود.

### چرا این گزینه برای فاز ۱؟
- **رایگان** است — هیچ پرداختی قبل از تست اولیه لازم نیست
- از **FHIR R4** پشتیبانی می‌کند (همان نسخه‌ای که OSCAR Pro احتمالاً استفاده می‌کند)
- UI مدیریتی دارد
- کاملاً Docker-based — نیاز به نصب Java یا Maven ندارد
- می‌توان منطق خواندن/parse کردن patient، appointment، medication و سایر resource های FHIR را تمرین و تست کرد
- مستندات کامل و community بزرگ دارد

### راه‌اندازی
فایل compose داخل repo قرار دارد: [docs/oscar/docker-compose.yml](oscar/docker-compose.yml)
```bash
cd docs/oscar
docker compose up -d
```
سرور یک اپ Spring Boot است و ~۶۰-۹۰ ثانیه طول می‌کشد تا کامل بالا بیاید. آماده‌بودن با این endpoint چک می‌شود: `GET http://localhost:8080/fhir/metadata` (باید HTTP 200 بدهد).

**دسترسی**: http://localhost:8080/ (UI) و http://localhost:8080/fhir (FHIR base)

### نتیجه تست فاز ۱ (تأییدشده ✅)
- نسخه FHIR سرور: **4.0.1 (R4)** — مطابق هدف
- `POST /fhir/Patient` → **HTTP 201 Created** با id در هدر Location
- `GET /fhir/Patient/{id}` → **HTTP 200**
- `GET /fhir/Patient?family=...` → Bundle معتبر، داده persist می‌شود

یعنی منطق integration سمت ما می‌تواند با یک FHIR R4 endpoint صحبت کند. مرحله بعد: فاز ۲ (خرید sandbox OSCAR و تست API واقعی).

### Endpoints کاربردی برای تست
| Resource | Endpoint |
|----------|----------|
| Patient | `GET /fhir/Patient` |
| Appointment | `GET /fhir/Appointment` |
| MedicationRequest | `GET /fhir/MedicationRequest` |
| Observation | `GET /fhir/Observation` |
| Practitioner | `GET /fhir/Practitioner` |

---

## مقایسه سریع

| معیار | گزینه A (OSCAR کامل) | گزینه C (HAPI FHIR) |
|-------|----------------------|---------------------|
| زمان راه‌اندازی | 1-2 ساعت | 30 دقیقه |
| هزینه | رایگان | رایگان |
| FHIR version | DSTU2 (قدیمی) | R4 (احتمالاً مثل Pro) |
| UI پزشکی | ✅ دارد | ❌ ندارد |
| تست syntax خود FHIR | محدود | ✅ کامل |
| تست API واقعی OSCAR | ❌ خیر (DSTU2 و قدیمی) | ❌ خیر (سرور مرجع، نه OSCAR) |
| مناسب برای فاز ۱ (happy-path رایگان) | ضعیف (سنگین) | ✅ بهترین |

> هیچ‌کدام از A و C جایگزین تست واقعی OSCAR نیستند؛ آن تست در فاز ۲ (sandbox) انجام می‌شود.
