# موارد معوق و کارهای بعدی

این سند هر چیزی رو که در طول پیاده‌سازی مهاجرت OSCAR کشف شد ولی عمداً به بعد
موکول شد جمع می‌کند — تا در ادامه‌ی کار گم نشوند. هر مورد شامل «چی هست»،
«چرا الان انجام نشد» و «کِی/چطور باید حلش کرد» است.

---

## ۱. `ClinicCredential` به `Facility` وصل شد — با داده‌ی جای‌گذار (placeholder)

**حل شد (۲۰۲۶-۰۸-۲۰):** فیلد `clinicId` به مدل `Facility` اضافه شد
(migration `20260820000000_facility_clinic_id`). یک ردیف جدید،
`fac-sponsor-clinic`، به `clinicId: 'sponsor-clinic'` وصل شده و
`scripts/sync-doctors.ts` حالا `Doctor.clinicName` را از همین join پر
می‌کند؛ `apps/web/src/lib/doctors/repository.ts` هم `clinicAddress`/
`workingHours`/`languages` را برای Physician Info از همین ردیف می‌خواند.

**نکته‌ی مهم:** چون هنوز اطلاعات واقعی کلینیک اسپانسر (آدرس، ساعات کاری،
زبان‌ها) در دست نبود، طبق تصمیم صریح کاربر این ردیف با **داده‌ی seed/mock**
(همون شِیپ `fac-gp-001` قدیمی) پر شده — یعنی آدرس/ساعات‌کاری‌ای که الان در
Physician Info دیده می‌شه واقعی نیست. هر وقت اطلاعات واقعی کلینیک رسید،
فقط کافیه ردیف `fac-sponsor-clinic` در `facilities-seed-data.json` آپدیت و
دوباره seed بشه — کد نیازی به تغییر نداره.

## ۲. UI به rating واقعی وصل شد

**حل شد (۲۰۲۶-۰۸-۲۰):** `RECOMMENDED_META` (در `home-recommended-physicians.tsx`)
و `DEFAULT_PHYSICIAN_EXTRAS` (در `physician-info` feature — کلاً حذف شد)
جایگزین شدن با `Doctor.averageRating`/`reviewCount`/`reviews` واقعی. چون
هنوز هیچ نظری ثبت نشده، همه‌جا صادقانه «Not yet rated» / «No reviews yet»
نشون داده می‌شه، نه صفر یا داده‌ی فیک. مسیر نوشتنِ نظر (submission) هنوز
وجود نداره — این یک تصمیم محصولی جدا برای بعد است.

## ۳. باگ سرور `POST /schedule/{demographicNo}/appointmentHistory`

این endpoint همیشه ۵۰۰ می‌گیره — چه با بدنه‌ی خالی، چه با/بدون نوبت واقعی
برای آن بیمار. تست شد که مستقل از داده بودنه (باگ واقعی سمت سرور OSCAR،
نه چیزی که با تغییر request حل بشه).

**وضعیت:** منتظر بررسی سمت کلینیک/سرور OSCAR. کد سمت ما (`findAll({patientId})`
در `OscarAppointmentRepository`) همین الان هم درست پیاده شده و به‌محض حل
باگ سرور، بدون تغییر کد کار خواهد کرد.

## ۴. `OscarAppointmentRepository.findById` پیاده نشده

`GET /schedule/getAppointment` هیچ نمونه‌ی پارامتر/پاسخ مستندی نداره.
`findDetailById` (قدم ۷) روی همین متد ساخته شده، پس با حل این یکی، اون هم
خودکار درست می‌شه. `updateStatus` (لغو نوبت) هم فعلاً به‌جای رکورد کامل،
یک نسخه‌ی جزئی برمی‌گردونه چون نمی‌تونه دوباره fetch کنه.

**راه‌حل بعدی:** نمونه‌ی واقعی request/response این endpoint رو از Postman
یا تست زنده بگیریم.

## ۵. محدودیت سیستمی OSCAR: هیچ lookup تک‌آیتمی مستقل از بیمار نداره

`prescriptions`، `immunizations`، `allergies`/`conditions`، `test results`
(و `appointments`) در OSCAR همه با `demographicNo` اسکوپ می‌شن — هیچ
endpointی برای «این یک رکورد رو فقط با id خودش بده» بدون دونستن بیمار وجود
نداره. به همین خاطر `findById` همه‌ی این سرویس‌ها برای OSCAR فعلاً خطای
صریح می‌ده (نه crash، نه حدس).

**راه‌حل واقعی:** باید `patientId` به query param صفحات جزئیات
(`/api/v1/prescriptions/[id]`, `/api/v1/vaccinations/[id]`,
`/api/v1/health-records/[id]`, `/api/v1/test-results/[id]`,
`/api/v1/appointments/[id]`) اضافه بشه تا backend بتونه lookup رو درست
scope کنه. این یک تغییر API contract هست (هرچند additive — فقط یک query
param اختیاری جدید)، پس باید با هماهنگی فرانت انجام بشه.

## ۶. Condition (Problem List) — endpoint پیدا شد ولی شکل آیتم پرشده تأیید نشده

برخلاف فرض اولیه‌ی سند، `GET /dxRegisty/getDiseaseRegistry?demographicNo=`
زنده کار می‌کنه (حالت خالی `[]` تست شد). `HealthConditionRepository` برای
OSCAR الان هم آلرژی هم condition رو از این دو منبع برمی‌گردونه — ولی
فیلدهای آیتمِ **پرشده**‌ی `dxRegisty` هرگز دیده نشده، پس `OscarDiseaseRegistryItem`
(در `oscar-types.ts`) با فیلدهای احتیاطی/حدسی نوشته شده. باید با یک نمونه‌ی
واقعی (یک بیمار با تشخیص ثبت‌شده) تأیید و در صورت لازم اصلاح بشه.

## ۷. نتایج آزمایش — endpoint پیدا شد ولی شکل آیتم پرشده تأیید نشده

`GET /labs/hl7LabsByDemographicNo` زنده کار می‌کنه (پاسخ خالی
`{"messages":[]}` تست شد — نکته: کلید wrapper اسمش `messages`ه، نه
`content` مثل بقیه‌ی endpointهای صفحه‌بندی‌شده‌ی OSCAR). `OscarTestResultRepository`
پیاده شده، ولی چون فیلدهای آیتمِ پرشده هرگز دیده نشده، `values` همیشه خالی
برمی‌گرده (به‌جای حدس‌زدن ساختار). `POST /measurements/{demographicNo}`
(که قرار بود مکمل این باشه) کنار گذاشته شد چون بدنه‌ش هیچ‌وقت مشخص نشد.

**راه‌حل بعدی:** یک نمونه‌ی پاسخ پرشده‌ی `hl7LabsByDemographicNo` لازم است
تا `OscarHl7LabMessage` و `oscarHl7LabMessageToLabResult` تکمیل بشن.

## ۸. اسناد (Documents) — تأیید شد که در دسترس نیست

`GET /demographics/{dataId}?includes[]=documents` امتحان شد و غیرقابل‌اعتماد
بود (۴۰۱ گرفت، حتی بعد از تلاش‌های مختلف encode). طبق تصمیم صریح، دیگه
امتحان نمی‌شه. `OscarDocumentRepository` همیشه یک خطای صریح «در دسترس
نیست» می‌ده (نه لیست خالی گمراه‌کننده).

**نکته‌ی مهم امنیتی/عملیاتی:** دقیقاً بعد از همین تست، احراز هویت OAuth1
به‌طور کامل (حتی برای Postman خودِ صاحب پروژه) قطع شد و نیاز به گرفتن
accessToken جدید بود. رابطه‌ی علّی قطعی نیست، ولی به‌عنوان یک هشدار ثبت
می‌شه: هر تغییر غیرمعمول در query string (مثل `[]`) رو با احتیاط بیشتری
امتحان کنیم، ترجیحاً از طریق Postman خودِ صاحب پروژه، نه مستقیم از کد.

## ۹. `OscarClient.create()`/`updateStatus()` برای نوبت هیچ‌وقت زنده تست نشده

بر اساس curl/مدلی که فرستادی نوشته شده، ولی به‌درخواست خودت هیچ‌وقت واقعاً
اجرا نشده روی سندباکس. هروقت آماده بودی برای تست واقعی (ساختن/لغو یک نوبت
واقعی)، باید با هم انجامش بدیم.

## ۱۰. اختلاف نام‌گذاری در اسناد

سند اصلی (`docs-oscar-new-approach.md`) بخش ۳ هنوز از نام `PatientClinicLink`
استفاده می‌کنه، ولی پیاده‌سازی واقعی (طبق `patient-clinic-linking-architecture.md`)
از `PatientClinicIdentity` استفاده کرده. کد درسته؛ فقط سند اصلی هنوز
هم‌گام نشده — کاندید قدم ۱۱ (پاک‌سازی/مستندسازی نهایی).

## ۱۱. یک quirk محیطی (نه باگ کد)

روی این ماشین ویندوزی، بعد از هر build موفق Next.js، Nx یک خطای
"A required privilege is not held by the client (os error 1314)" در مرحله‌ی
cache می‌ده که باعث می‌شه `bun run build:web` با exit code 1 تموم بشه —
با اینکه خودِ build واقعاً موفق بوده. این مربوط به مسیر واقعی دیپلوی
(Docker/Linux) نیست، فقط یک مزاحمت محلیه؛ لازم نیست حلش کنیم مگر خودت
بخوای.

## ۱۲. قالب زمان‌بندی پزشک (availability) — حل شد؛ راه‌حل واقعی از طریق SOAP پیدا شد

**به‌روزرسانی (۲۰۲۶-۰۹-۰۱): راه‌حل واقعی پیدا شد.** تحقیق زیر (روی
`ws/services` REST) نتیجه‌ی درستی بود — هیچ endpoint REST‌ای برای این وجود
نداره — ولی یک لایه‌ی **کاملاً جدا و سوم** (SOAP قدیمیِ OSCAR، نه REST) پیدا
شد که دقیقاً این داده رو می‌ده: `ScheduleService.getDayWorkSchedule` +
`getScheduleTemplateCodes`. جزئیات کامل (احرازهویت WS-Security، نمونه‌ی
پاسخ‌های واقعی، طراحیِ راه‌حل نهایی) توی سند جداگانه‌ی
[`oscar-soap-schedule-services.md`](./oscar-soap-schedule-services.md)
مستند شده. پیاده‌سازیِ واقعیِ این راه‌حل هنوز شروع نشده — این آیتم وقتی
واقعاً پیاده و تست شد به‌روزرسانی می‌شه.

<details>
<summary>تحقیق قبلی روی REST (برای مرجع تاریخی)</summary>

**نتیجه‌ی تحقیق (۲۰۲۶-۰۸-۲۴):** روی `ws/services` (لایه‌ای که باهاش کار
می‌کنیم)، هیچ endpoint‌ای برای «قالب کاری پزشک» (چه روزهایی/چه ساعت‌هایی کار
می‌کنه، با چه نوع نوبت‌دهی) پیدا نشد. همه‌ی کاندیدهای زیر تست شدن، و همه‌شون
از خودِ WADL خام (`docs/oscar_wadl_files/services_wadl.txt`) هم به‌عنوان
لیست کاملِ زیرمسیرهای `/schedule/*` دوباره تأیید شدن — یعنی چیزی فراتر از
این‌ها زیر `/schedule` اصلاً وجود نداره:

- `/schedule/fetchMonthly/{providerNo}/{year}/{month}` — فقط wrapper خالی.
- `/schedule/{providerNo}/day/{date}` — فقط نوبت‌های واقعاً رزروشده (نه template).
- `/schedule/searchConfig/*` — ۲۰۴، ویژگی نامرتبط.
- `/program/patientList` — ۵۰۰ (ماژول Program Management/bed-tracking، کاملاً
  نامرتبط با scheduling عادی — تشخیص داده شد که یه باگِ قابل‌رفع نیست).

یک مسیر REST دوم و کاملاً جدا هم پیدا شد (`ws/rs`، مثلاً
`/ws/rs/schedule/day/{date}`) که خودِ رابط کاربری OSCAR برای AJAX داخلی‌ش
استفاده می‌کنه (کشف‌شده از `GET /persona/patientLists`) — ولی با امضای
OAuth1 ما ۴۰۱ گرفت (احتمالاً session-cookie می‌خواد، نه OAuth1). حتی اگه با
کوکی کار کنه، ساختنِ بک‌اند تولیدی روش پایه‌ی معماری‌مون (OAuth1 بدون نیاز
به session زنده) رو نقض می‌کنه و غیررسمی/مستندنشده‌ست.

**تصمیم صاحب پروژه (۲۰۲۶-۰۸-۲۵):** یک راه‌حل جایگزین (قالب هفتگیِ ثابتِ
پلتفرمی + ترکیب با نوبت‌های واقعی OSCAR) پیاده و تست شد، ولی بعداً **به‌طور
کامل برگردانده شد** — چون طبق توضیح صاحب پروژه، زمان‌بندی واقعی پزشکان در
این کلینیک ممکنه روز به روز و پزشک به پزشک فرق کنه (مدت نوبت ۱۵ دقیقه‌ست نه
۳۰، حداقل ۲ نوع نوبت‌دهی متفاوت داره، و پزشک ممکنه یک روز خاص مرخصی باشه) —
یعنی یک قالب هفتگیِ ثابت به‌قدر کافی دقیق نیست. صاحب پروژه معتقده این
اطلاعات باید از خودِ سرویس‌های `schedule` OSCAR (همون‌هایی که بالا لیست شد)
قابل‌استخراج باشه، و می‌خواد قبل از قبول‌کردنِ راه‌حل جایگزین، دوباره روی
همین سرویس‌ها (و رفعِ ۵۰۰‌هایی که می‌دن) کار بشه.

**وضعیت فعلی:** صفحه‌ی Booking دوباره به حالت mock (قبل از این تحقیق)
برگشت — فقط دکمه‌ی Confirm به مکانیزم واقعی ثبت نوبت وصل مونده (آیتم ۶-الف
قدیمی، دست‌نخورده). تقویم/تایم‌اسلات mock‌ان تا راه‌حل نهایی مشخص بشه.

</details>

## ۱۳. ثبت واقعی نوبت شکست می‌خوره — هیچ بیماری به کلینیک لینک نشده

**کشف‌شده (۲۰۲۶-۰۹-۰۴):** در تست end-to-end واقعیِ ثبت نوبت، یک curl خام
همون درخواستی که فرانت می‌زد رو تکرار کرد و خطای زیر رو گرفت، در حالی که
خودِ اپ به‌اشتباه صفحه‌ی «Appointment booked» رو نشون داده بود:

```
{"message":"Patient is not linked to this clinic — call linkToClinic first.","code":"INTERNAL_ERROR"}
```

بررسی مستقیم دیتابیس نشون داد جدول `patient_clinic_identity` کاملاً
خالیه — یعنی *هیچ* بیماری تا الان به کلینیک لینک نشده، چون هیچ‌جای فرانت
`POST /api/v1/patients/link-clinic` رو صدا نمی‌زنه. تک نقطه‌ی throw:
`OscarAppointmentRepository.create` در
`packages/domain/src/adapters/oscar/oscar-repositories.ts:234`.

بک‌اند این قابلیت (`LinkPatientToClinicUseCase` + `OscarClinicPatientMatcher`،
طبق [`patient-clinic-linking-architecture.md`](./patient-clinic-linking-architecture.md))
از قبل کامل و آماده‌ست — فقط هیچ صدازننده‌ای نداره.

**در همین بررسی یک باگ جدا هم پیدا و رفع شد:** `MedicalApiClient`
(`apps/web/src/lib/api-client/medical-api-client.ts`) وضعیت HTTP پاسخ رو
چک نمی‌کرد (`fetch` روی status خطا throw نمی‌کنه)، برای همین خطای واقعیِ
بالا به‌عنوان موفقیت تفسیر می‌شد. با اضافه‌کردن متد `parseJson` (که روی
`!response.ok` throw می‌کنه) به همین فایل حل شد — این بخش انجام شده،
نیازی به کار بیشتر نداره.

**تصمیم صاحب پروژه برای بخش لینک‌شدن به کلینیک (هنوز پیاده نشده):**
- بدون مودال؛ یک فیلد HIN قابل‌ویرایش مستقیم به صفحه‌ی پروفایل اضافه بشه
  (اولین فیلد قابل‌ویرایش در کل اپ — تا الان پروفایل کاملاً read-only
  بوده).
- وقتی کاربر می‌خواد نوبت ثبت کنه و HIN رو در پروفایل تکمیل نکرده، خطای
  مناسب («اول باید در پروفایل تکمیلش کنی») نشون داده بشه.
- اگه HIN وارد شده ولی توی اون کلینیک با هیچ بیماری match نشد (پاسخ
  `not_found` از OSCAR)، خطای مناسب دیگه‌ای هم نشون داده بشه.

پلن کامل و جزئیات فایل‌به‌فایل (schema/migration جدید برای
`Patient.healthNumber`، اضافه‌کردن قابلیت آپدیت پروفایل که تا الان اصلاً
وجود نداشت، فیلد قابل‌ویرایش در `profile-hub-page.tsx`، و گیت‌کردن
`handleConfirm` در `physician-booking-page.tsx` روی نتیجه‌ی
`linkPatientToClinic`) در
`C:\Users\Matrix\.claude\plans\swift-moseying-willow.md` نوشته شده —
هنوز پیاده‌سازی نشده، منتظر ادامه‌ی کاره.

## ۱۴. `POST /demographics` (ایجاد بیمار جدید) — endpoint واقعیه، ولی توکن فعلی مجوز نداره

**کشف‌شده (۲۰۲۶-۰۹-۲۱):** طبق WADL (`docs/oscar_wadl_files/services.xml`)
منبع `/demographics` سه متد داره: `GET` (لیست)، `PUT` (ویرایش)، و `POST`
(ایجاد). این سرویس قبلاً «خارج از scope، هیچ‌وقت پیاده نشد» ثبت شده بود
(بخش «هیچ‌وقت پیاده نشد» در `OSCAR_ENDPOINTS_IN_USE.md`) چون فقط
`matchDemographic` (تشخیص بیمار موجود، نه ایجاد) در scope بود.

تست دستی زنده (curl خام + امضای OAuth1 معتبر از Postman، اجراشده توسط
صاحب پروژه) این نتایج رو داد:

- درخواست از OAuth1 عبور کرد (یعنی auth معتبر بود، ۴۰۱ نگرفتیم).
- درخواست به مسیر سروری واقعی رسید:
  `DemographicService.createDemographicData` →
  `DemographicManager.createDemographic` — یعنی این متد POST واقعاً روی
  این نصب OSCAR وجود داره و به کد ایجاد بیمار وصله (فرضیه‌ی «هیچ‌وقت پیاده
  نشد چون endpoint واقعی نیست» رد شد).
- خروجی نهایی HTTP 500 با پیام:
  `java.lang.RuntimeException: missing required security object (_demographic)`
  از `DemographicManager.checkPrivilege` (`DemographicManager.java:1062`).
  یعنی provider/token فعلی مجوز (privilege) روی «security object»‌ی به نام
  `_demographic` رو نداره — این یک خطای authorization سمت OSCAR است، نه
  باگ در فرمت request یا بدنه‌ی JSON.

**تأییدشده (۲۰۲۶-۰۹-۲۱، ادامه‌ی همون روز):** با
`GET /persona/hasRight?objectName=_demographic&privilege=w` (نمونه در
`docs/oscar/new-approach/OSCAR-EMR-19-Full.postman_collection.json:12721`)
پاسخ زیر گرفته شد:
```json
{"success": false, "message": null}
```
یعنی provider/token فعلی قطعاً مجوز `w` (write) روی security object
`_demographic` رو نداره — این تأییدِ مستقلِ همون چیزیه که خطای ۵۰۰ قبلی
نشون داده بود، نه یه حدس.

**تلاش موازی برای رفع از راه UI شکست خورد:** لاگین مستقیم به پنل ادمین
OSCAR با همین provider، به‌جای داشبورد، یک `org.apache.jasper.JasperException:
java.lang.NullPointerException` داد (بدون جزئیات بیشتر). این خودش می‌تونه
نشونه‌ی دیگه‌ای باشه که این حساب یه حساب integration/API-only ناقص‌ه که
هیچ‌وقت برای لاگین مستقیم به UI تنظیم نشده (بدون Facility/Program پیش‌فرض
یا تنظیمات مشابه) — هنوز ریشه‌یابی نشده، اولویت پایین چون راه REST
(`persona/hasRight`) جواب لازم رو بدون نیاز به لاگین UI داد.

**قدم بعدی (هنوز انجام نشده، مسدود روی دسترسی ادمین):** باید یک ادمین
OSCAR (نه لزوماً همین provider) وارد Administration → Manage Users بشه و
مجوز `w` روی `Demographic` رو برای provider مرتبط با این credential فعال
کنه. از طریق API قابل انجام نیست — دادن مجوز خودش نیاز به یه مجوز
ادمین‌ترِ دیگه داره که این توکن نداره. تا اون موقع، ایجاد بیمار از طریق
REST برای این credential عملاً مسدوده — این محدودیت مجوز است، نه نبود
endpoint.

**provider مرتبط با این credential شناسایی شد:** username `oscardoc` —
صاحب پروژه با هماهنگی کلینیک و همین username/رمزی که کلینیک در اختیارش
گذاشته بود وارد OSCAR شده و همین OAuth consumer key/token رو از پنل ساخته.
درخواست فعال‌سازی مجوز باید دقیقاً برای provider `oscardoc` فرستاده بشه.

**حدسِ «`r` هم false است» — ابتدا ثبت شد، بعد رد شد؛ `persona/hasRight`
از طریق REST/OAuth1 اصلاً قابل‌اعتماد نیست:**
`GET /persona/hasRight?objectName=_demographic&privilege=r` همون پاسخ
`{"success": false, "message": null}` رو داد؛ اولش برداشت شد که یعنی
`oscardoc` حتی خواندن هم نداره. ولی برای اطمینان، همین چک روی ماژول
Schedule/Appointment هم تکرار شد (`objectName` با ۴ حدسِ مختلف:
`_appointment`، `_schedule`، `appointment`، `schedule` — همه با
`privilege=r`) و **همه‌شون هم `false` دادن** — در حالی که
`schedule/fetchProviderAppts/...` (یه عملیات خواندنِ واقعی روی همون
ماژول) با همین credential به‌صورت زنده کار می‌کنه و داده‌ی واقعی برمی‌گردونه.

این تناقض مستقیم (hasRight می‌گه false، عملیات واقعی موفقه) نشون می‌ده
**خودِ `persona/hasRight` از مسیر REST/OAuth1 قابل‌اعتماد نیست** — به‌جای
این‌که نتیجه‌ی واقعیِ مجوز رو بده، همیشه `false` برمی‌گردونه (فرضیه‌ی
محتمل: این endpoint به `LoggedInInfo`/HttpSession کاربرِ لاگین‌شده در وب
وابسته‌ست، که در فراخوانی REST/OAuth1 اصلاً وجود نداره — با همون
`NullPointerException` موقع لاگین وب `oscardoc` هم هم‌خونی داره، نشونه‌ی
یه مشکل کلی‌تر در لایه‌ی session/identity همین provider). **نتیجه: هر دو
نتیجه‌ی `hasRight` (چه برای `_demographic` چه برای `_appointment`) باید
نادیده گرفته بشن — نه تأیید و نه رد چیزی.**

**تنها مدرکِ واقعی و قابل‌اعتماد همچنان همون خطای ۵۰۰ اولیه‌ست:**
`missing required security object (_demographic)` از یک عملیات واقعیِ
create — این هنوز پابرجاست و نشون می‌ده حداقل مجوز `w` (نوشتن) روی
`Demographic` برای `oscardoc` وجود نداره. درباره‌ی مجوز **خواندن** روی
Demographic، هنوز مدرک مستقیم/قابل‌اعتمادی نداریم (نه تأیید شده نه رد
شده) — برای این باید یه تست عملکردیِ واقعی زد (مثلاً `GET /demographics`
یا `GET /demographics/basic/{dataId}`)، نه به `hasRight` تکیه کرد.

**نتیجه‌ی نهایی برای درخواست به کلینیک:** فقط همون چیزی که با مدرک واقعی
تأیید شده رو بخواییم — مجوز **نوشتن (`w`)** روی `Demographic` برای
`oscardoc`. درباره‌ی خواندن ادعایی نکنیم مگر با یه تست عملکردیِ جدا
تأییدش کنیم.

**به‌روزرسانی نهایی (۲۰۲۶-۰۹-۲۱): خواندن هم با یه تست عملکردیِ واقعی
(نه `hasRight`) تأیید شد که واقعاً مسدوده.** `GET /demographics?offset=0&limit=20`
دقیقاً همون خطای ۵۰۰ `missing required security object (_demographic)`
رو داد، این‌بار از یه مسیر کد کاملاً متفاوت نسبت به create:
```
DemographicManager.checkPrivilege (DemographicManager.java:1062)
  ← DemographicManager.getActiveDemographics (DemographicManager.java:589)
  ← DemographicService.getAllDemographics (DemographicService.java:220)
```
یعنی این دیگه یه شکِ برخاسته از `hasRight` غیرقابل‌اعتماد نیست — دو
عملیات واقعیِ کاملاً مستقل (`createDemographic` و `getActiveDemographics`)
هر دو به همون `checkPrivilege(_demographic)` می‌خورن و رد می‌شن. **نتیجه‌ی
قطعی: `oscardoc` روی ماژول Demographic نه فقط نوشتن، بلکه خواندن هم
ندارد.** درخواست به کلینیک باید هر دو (`r` و `w`) رو بخواد، نه فقط `w`.

**حل شد (۲۰۲۶-۰۹-۲۵):** به‌جای اصلاح مجوزهای `oscardoc`، کلینیک یک
**provider/credential جدید با دسترسی کامل‌تر** ایجاد کرد؛ صاحب پروژه با
همین provider جدید یک OAuth consumer key/token تازه ساخت. سرویس‌هایی که
قبلاً به همین دلیل (کمبود مجوز `_demographic`) شکست می‌خوردن — از جمله
ایجاد و **حذف** بیمار — با credential جدید کار می‌کنن. مستندسازی
سرویس‌به‌سرویسِ کامل (REST + SOAP، با نمونه‌ی واقعیِ request/response) از
اینجا به بعد در
[`oscar-verified-service-catalog.md`](./oscar-verified-service-catalog.md)
ادامه پیدا می‌کنه، نه در این فایل.
