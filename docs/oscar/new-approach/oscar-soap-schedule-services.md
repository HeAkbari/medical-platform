# سرویس‌های SOAP قدیمیِ OSCAR — قالب زمان‌بندی واقعی پزشک

این سند نتیجه‌ی یک تحقیق کامل (۲۰۲۶-۰۸-۲۴ تا ۲۰۲۶-۰۹-۰۱) برای پیدا کردن راهی
واقعی برای گرفتن **قالب زمان‌بندی روزانه‌ی هر پزشک** (چه ساعتی کار می‌کنه،
با چه نوع نوبت‌دهی، آیا مرخصیه) از OSCAR است — چیزی که هیچ‌وقت از طریق
REST API اصلی (`ws/services`، مستندشده در
[`OSCAR_ENDPOINTS_IN_USE.md`](../OSCAR_ENDPOINTS_IN_USE.md)) پیدا نشد.

## زمینه: چرا این تحقیق لازم شد

قدم ۶-ب سند اصلی (اسلات‌های واقعی نوبت‌دهی) با یک راه‌حل جایگزین
(قالب هفتگیِ ثابتِ پلتفرمی) پیاده شد، ولی صاحب پروژه توضیح داد که در عمل:

- زمان‌بندی هر پزشک می‌تونه **روز به روز** فرق کنه (نه یک الگوی ثابت هفتگی).
- هر پزشک حداقل **۲ نوع نوبت‌دهی متفاوت** داره (نه یک نوع ساده).
- پزشک ممکنه یک روز خاص **مرخصی** باشه.

پس راه‌حل جایگزین (که کاملاً برگردانده شد — نگاه کن به
[`deferred-items.md`](./deferred-items.md) آیتم ۱۲) کافی نبود، و باید این
اطلاعات واقعاً **زنده از OSCAR** خونده می‌شد.

## کشف: سه سطح API کاملاً جدا در این نصب OSCAR

| سطح | Base URL | نوع | وضعیت |
|---|---|---|---|
| REST رسمی (مستندشده) | `.../oscar/ws/services` | JSON، OAuth1 | ✅ همون چیزی که برای بقیه‌ی migration استفاده کردیم |
| REST داخلیِ UI | `.../oscar/ws/rs` | JSON، ظاهراً session-cookie | ❌ کنار گذاشته شد — غیررسمی، ناسازگار با معماری OAuth1 بدون-session |
| **SOAP قدیمی** | `.../oscar/ws/{LoginService,ScheduleService,BookingService,...}` | XML/SOAP، WS-Security | ✅ **راه‌حل واقعی قالب زمان‌بندی، همین‌جا پیدا شد** |

## کشف بزرگ‌تر (۲۰۲۶-۰۹-۰۴): کاتالوگ کامل سرویس‌های SOAP این نصب

با گرفتن `https://<host>:8443/oscar/ws/?wsdl` (صفحه‌ی لیست‌کننده‌ی CXF)،
مشخص شد این نصب OSCAR بازم خیلی بیشتر از سه سرویسی که تا الان کشف کرده
بودیم (`LoginService`, `ScheduleService`, `BookingService`) سرویس SOAP
داره. لیست کامل (۱۴ سرویس SOAP + همون ۳ سرویس REST قبلی):

| سرویس | Endpoint | عملیات‌های کلیدی (فقط مرتبط‌ترین‌ها) |
|---|---|---|
| `LoginWs` | `LoginService` | `login`, `login2` — قبلاً کامل مستند شده |
| `ScheduleWs` | `ScheduleService` | `getDayWorkSchedule`, `getScheduleTemplateCodes` (verified) + **خیلی بیشتر، تازه کشف شد**: `getAppointmentsForProvider(2)`, `getAppointmentsForPatient(2)`, `getAppointmentsForDateRangeAndProvider(2)`, `getAppointment(2)`, `addAppointment`, `updateAppointment`, `getAppointmentTypes`, `getAppointmentsUpdatedAfterDate`, `getAppointmentArchivesUpdatedAfterDate`, `getAllDemographicIdByProgramProvider`, و یک عملیات عجیب به اسم `testTimeZone_1492_05_12_18_26_32` (احتمالاً برای دیباگ‌کردن دقیقاً همون ابهام timezone که ما داریم) |
| `BookingWs` | `BookingService` | `bookAppointment`, `getAppointmentTypesByProvider`, `getExternalAppointmentTypes`, `findAppointment` — قبلاً مستند شده |
| `DemographicWs` | `DemographicService` | `getDemographic`, `getDemographic2`, `searchDemographicByName`, `searchDemographicsByAttributes`, `getActiveDemographicsAfter(2)`, `getConsentedDemographicIdsAfter`, ... — **هیچ عملیات match-by-HIN+DOB مشابه REST `matchDemographic` دیده نمی‌شه** |
| `ProviderWs` | `ProviderService` | `getProviders`, `getProviders2`, `getLoggedInProviderTransfer`, `getProviderProperties` |
| `FacilityWs` | `FacilityService` | `getAllFacilities`, `getDefaultFacility`, `getDefaultFacilities` |
| `DocumentWs` | `DocumentService` | `getDocument`, `getDocumentsByDemographicIdAfter`, `getDocumentsUpdateAfterDate`, `getDocumentsByProgramProviderDemographicDate` — **کاندید حل آیتم ۸ در deferred-items.md (Documents از REST تأیید شده در دسترس نیست)** |
| `PrescriptionWs` | `PrescriptionService` | `getPrescription`, `getPrescriptionsByDemographicIdAfter`, `getPrescriptionUpdatedAfterDate` |
| `AllergyWs` | `AllergyService` | `getAllergy`, `getAllergiesByDemographicIdAfter`, `getAllergiesUpdatedAfterDate` |
| `MeasurementWs` | `MeasurementService` | `getMeasurement`, `getMeasurementsByDemographicIdAfter`, `addMeasurement` |
| `PreventionWs` | `PreventionService` | `getPrevention`, `getPreventionsByDemographicIdAfter` |
| `SystemInfoWs` | `SystemInfoService` | `getServerTime`, **`getServerTimeGmtOffset`** (کاندید حل قطعیِ ابهام timezone!)، `isAlive`, `helloWorld`, `getMaxListReturnSize` |
| `ProgramWs` | `ProgramService` | `getAllPrograms`, `getAllProgramProviders` — احتمالاً بی‌ربط (همون ماژول Program Management/bed-tracking که در REST هم بی‌ربط تشخیص داده شده بود) |
| `LabUploadWs` | `LabUploadService` | فقط عملیات‌های `upload*` (نوشتنِ نتایج آزمایش از آزمایشگاه‌های خارجی) — بی‌ربط به نیاز ما (خوندنِ داده برای بیمار) |

هر ۳ سرویس REST قبلی (`ws/oauth`, `ws/rs`, `ws/services`) هم توی همون صفحه
دوباره تأیید شدن — چیز جدیدی نیستن.

**نکته‌ی مهم برای تصمیم «کلاً بریم سراغ SOAP»:** این کشف دو جهت متفاوت داره:
- **در جهت SOAP:** `ScheduleWs` بازم خیلی کامل‌تر از چیزیه که فکر می‌کردیم
  (شامل `addAppointment`/`updateAppointment`/`getAppointment` — یعنی
  می‌تونیم کل چرخه‌ی نوبت‌دهی، هم خوندن هم نوشتن، رو با SOAP انجام بدیم و
  از REST `/schedule/*` کلاً بی‌نیاز بشیم)؛ `DocumentWs` می‌تونه آیتم ۸ی
  deferred-items رو حل کنه.
- **در جهت نگه‌داشتنِ REST:** هیچ عملیات SOAP معادل `matchDemographic`
  (تطبیق بیمار با HIN+DOB، پایه‌ی کل معماری `LinkPatientToClinicUseCase`)
  دیده نشد. یعنی حتی اگه همه‌چیز دیگه رو SOAP کنیم، این یکی احتمالاً باید
  همچنان REST بمونه — مگه اینکه `searchDemographicsByAttributes` بشه
  جایگزینش کرد (نیاز به تست زنده داره، معنی/فرمت دقیق attributes نامعلومه).

هیچ‌کدوم از عملیات‌های تازه‌کشف‌شده‌ی بالا (به‌جز همون دوتای قبلی) هنوز زنده
تست نشدن. فایل کالکشن Postman برای Login/Schedule(۲تای verified)/Booking:
[`OSCAR-SOAP-Services.postman_collection.json`](./OSCAR-SOAP-Services.postman_collection.json)
+ [`OSCAR-SOAP-Services.postman_environment.json`](./OSCAR-SOAP-Services.postman_environment.json).

فایل‌های WADL/WSDL خام (که مستقیم از سرور کلینیک اسپانسر گرفته شدن، نه
حدس زده شدن) این‌جا نگه‌داری می‌شن:

```
docs/oscar_wadl_files/
├── services_wadl.txt      ← ws/services (REST رسمی)
├── rs_wadl.txt             ← ws/rs (REST داخلی، کنار گذاشته شد)
├── oauth_wadl.txt          ← ws/oauth (همون OAuth1 سه‌مرحله‌ای)
├── LoginService.xml        ← WSDL سرویس SOAP لاگین
└── BookingService.xml      ← WSDL سرویس SOAP بوکینگ
```

> `ScheduleService.xml` جداگانه ذخیره نشده، ولی محتوای کاملش (کشف‌شده از
> `https://<host>:8443/oscar/ws/ScheduleService?wsdl`) در بخش «عملیات‌های
> ScheduleService» پایین همین سند نقل شده.

## احرازهویت SOAP — WS-Security UsernameToken

### مرحله‌ی صفر: ساخت یک اکانت اختصاصی integration

اکانت شخصی هیچ‌کس (حتی ادمین) نباید برای این استفاده بشه — دقیقاً طبق همون
اصلی که برای OAuth1 هم رعایت کردیم (بخش ۸ سند اصلی). یک Provider/Login جدید
در OSCAR (Administration → Add a Login User) با این تنظیمات ساخته شد:

| فیلد | مقدار | چرا |
|---|---|---|
| Time Cycling Pin (2FA) | **No** | برای یه سرویس خودکار قابل‌استفاده نیست |
| Pin(remote) Enable | **خاموش** | سرور ما نسبت به کلینیک «remote» حساب می‌شه؛ این تیک باعث رد شدن هر لاگین برنامه‌نویسی می‌شد، مهم نیست پسورد چی باشه |
| Pin(local) Enable | خاموش | بی‌ربط به ما |
| Force Password Reset | **No** | وگرنه بعد از اولین لاگین قفل می‌شه |
| Expiry Date | بدون تاریخ انقضا | تا یهو integration نخوابه |

**نکته‌ی امنیتی مهم:** بدون این تنظیمات، `login`/`login2` همیشه دقیقاً همون
خطای `Invalid Username/Password` رو می‌ده — مهم نیست پسورد درست باشه یا نه.
این چیزی نبود که مستند شده باشه؛ فقط با آزمون‌وخطا و بررسی مستقیم فرم ادمین
OSCAR کشف شد.

### مرحله‌ی یک: `LoginService.login` یا `login2`

```xml
POST https://<host>:8443/oscar/ws/LoginService
Content-Type: text/xml; charset=UTF-8

<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.oscarehr.org/">
  <soapenv:Header/>
  <soapenv:Body>
    <ws:login2>
      <arg0>USERNAME</arg0>
      <arg1>PASSWORD</arg1>
    </ws:login2>
  </soapenv:Body>
</soapenv:Envelope>
```

بدون هیچ هدر WS-Security‌ای — یوزر/پسورد مستقیم توی بدنه. پاسخ موفق:

```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ns2:loginResponse xmlns:ns2="http://ws.oscarehr.org/">
      <return>
        <securityId>134</securityId>
        <securityTokenKey>5429696329944</securityTokenKey>
      </return>
    </ns2:loginResponse>
  </soap:Body>
</soap:Envelope>
```

**تأیید شد:** این مقادیر **ثابت‌** هستن (هر بار که `login` رو صدا بزنی همون
عددها برمی‌گردن) — یعنی یه credential دائمیه، نه یه session موقت که نیاز به
تازه‌کردن مکرر داشته باشه. `securityId` (عدد) و `securityTokenKey` (رشته)
دقیقاً معادل `Username`/`Password` برای همه‌ی سرویس‌های SOAP دیگه‌ن.

`login2` (نسبت به `login` ساده) یه `provider` object هم برمی‌گردونه (نام،
تخصص، و...) — اختیاریه، فقط برای راحتی.

### مرحله‌ی دو: هدر WS-Security برای بقیه‌ی سرویس‌ها

```xml
<soapenv:Envelope
    xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
    xmlns:ws="http://ws.oscarehr.org/"
    xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
  <soapenv:Header>
    <wsse:Security>
      <wsse:UsernameToken>
        <wsse:Username>{securityId}</wsse:Username>
        <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">{securityTokenKey}</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
  </soapenv:Header>
  <soapenv:Body>
    <!-- ... عملیات ... -->
  </soapenv:Body>
</soapenv:Envelope>
```

هدر HTTP اضافه‌ی لازم: `SOAPAction: ""`.

**⚠️ اشتباه پرهزینه‌ای که کلی وقت گرفت — حتماً بخون:**
URL استاندارد OASIS برای `Password/@Type` این‌طوریه:

```
http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText
```

**نه** این (که اشتباهاً استفاده شده بود و باعث `FailedAuthentication` با
هر credential/فرمتی می‌شد، چون یه کلمه‌ی اضافه‌ی «wssecurity-» وسطش بود):

```
http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-username-token-profile-1.0#PasswordText   ❌ اشتباه
```

نکات دیگه‌ای که در تست‌های موفق **لازم نبودن** (برخلاف فرض اولیه):
- `xmlns:wsu` / `wsu:Created` / نیازی به `PasswordDigest` نبود — `PasswordText` ساده کافی بود.
- `soapenv:mustUnderstand="1"` روی `wsse:Security` لازم نبود.
- `Nonce` لازم نبود.

### علائم اشتباهی که قبل از پیدا کردنِ فرمت درست دیده شدیم (برای مرجع)

| هدر/فرمت اشتباه | خطا |
|---|---|
| بدون هیچ `wsse:Security` | `ns1:InvalidSecurity` — «An error was discovered processing the <wsse:Security> header» |
| `Username` = یوزرنیم متنی معمولی (نه securityId) | `Invalid Username/Password` (از خودِ `login2`، نه از سرویس‌های دیگه) |
| `securityId`/`securityTokenKey` با URL اشتباهِ بالا (چه PasswordText چه PasswordDigest محاسبه‌شده‌ی درست) | `ns1:FailedAuthentication` — «The security token could not be authenticated or authorized» |
| اکانت با `Pin(remote) Enable` روشن | همیشه `Invalid Username/Password` از `login2`، مهم نیست پسورد چی باشه |

## عملیات‌های `ScheduleService`

Endpoint: `https://<host>:8443/oscar/ws/ScheduleService`

### `getDayWorkSchedule(providerNo: string, date: dateTime) → dayWorkScheduleTransfer`

```xml
<ws:getDayWorkSchedule>
  <arg0>104</arg0>
  <arg1>2026-08-20T00:00:00</arg1>
</ws:getDayWorkSchedule>
```

پاسخ واقعی و کامل (پزشک `104`، تاریخ `2026-08-20`) — **تأییدشده زنده،
۲۰۲۶-۰۹-۰۱**:

```xml
<return>
  <holiday>false</holiday>
  <timeSlotDurationMin>15</timeSlotDurationMin>
  <timeSlots><date>2026-08-20T10:00:00Z</date><scheduleCode>67</scheduleCode></timeSlots>
  <timeSlots><date>2026-08-20T10:15:00Z</date><scheduleCode>67</scheduleCode></timeSlots>
  <!-- ... تا 13:45، همه scheduleCode=67 (16 اسلات) ... -->
  <timeSlots><date>2026-08-20T14:00:00Z</date><scheduleCode>80</scheduleCode></timeSlots>
  <!-- ... تا 15:45، همه scheduleCode=80 (8 اسلات) ... -->
</return>
```

این دقیقاً با الگوی رنگی‌ای که توی تقویم خودِ OSCAR (اسکرین‌شات صاحب پروژه)
دیده شده بود یکی است: `10:00–13:45` = کد `67` (خاکستری، «C»)، `14:00–15:45`
= کد `80` (آبی، «P»).

**فیلدهای کلیدی:**
- `holiday: boolean` — اگه `true` باشه، پزشک اون روز مرخصیه (هنوز حالت
  `true` واقعی تست نشده — کاندید تست بعدی).
- `timeSlotDurationMin: int` — مدت واقعی هر اسلات (اینجا ۱۵، نه فرضِ ۳۰
  قدیمی).
- `timeSlots[]: {date, scheduleCode}` — یک ردیف به‌ازای **هر** اسلات کل روز
  (نه فقط اسلات‌های رزروشده) — این همون «قالب» واقعیه.

### `getScheduleTemplateCodes() → scheduleTemplateCodeTransfer[]`

بدون پارامتر. لیست کامل تعریف کدها — **تأییدشده زنده، ۲۰۲۶-۰۹-۰۱** (۲۲
ردیف؛ فقط مرتبط‌ترین‌ها). **لیست کامل و به‌روز (۲۵ ردیف، ۲۰۲۶-۰۹-۲۵)** در
[`oscar-verified-service-catalog.md`](./oscar-verified-service-catalog.md#دیکشنری-کدهای-نوع-نوبتدهی--soap).

```xml
<return><bookinglimit>1</bookinglimit><code>67</code><color>green</color><confirm>Onc</confirm><description>On Call Clinic</description><duration>15</duration><id>23</id></return>
<return><bookinglimit>1</bookinglimit><code>80</code><color>#BFEFFF</color><confirm>No</confirm><description>Phone Appointment</description><duration>15</duration><id>24</id></return>
<return><bookinglimit>1</bookinglimit><code>67</code><color></color><confirm>No</confirm><description>Clinic Appointment </description><duration>15</duration><id>25</id></return>
```

**⚠️ نکته‌ی مهم:** فیلد `code` **یکتا نیست** — کد `67` هم به `id:23`
(«On Call Clinic») هم به `id:25` («Clinic Appointment») نگاشت می‌شه. یعنی
از روی `scheduleCode` توی `getDayWorkSchedule` به‌تنهایی نمی‌شه با قطعیت
گفت کدوم `id` مقصوده — فقط می‌شه گفت «یه نوع نوبت کلینیکی معمولی، ۱۵
دقیقه‌ای»، که برای تشخیص «این اسلات آزاد/بوکینگ‌پذیره یا نه» کافیه (هر دو
`id` معنای مشابهی دارن — یه نوبت حضوری قابل‌رزرو).

سایر کدها (Vacation، Meeting، Travel، Academic، Study Leave، Administrative
Work، ...) وقتی دیده بشن یعنی اون بازه‌ی زمانی برای بیمار **قابل‌رزرو
نیست** — کارِ داخلی/اداری/شخصیِ پزشکه، نه یه slot کلینیکی.

### سایر عملیات‌های `ScheduleService` (هنوز زنده تست نشدن)

از روی WSDL (`docs/oscar_wadl_files/services_wadl.txt`... در واقع این WSDL
جداست، نگاه کن به دامپ کامل schema که صاحب پروژه فرستاد)، این عملیات‌ها هم
هستن ولی هنوز امتحان نشدن: `getAppointmentsForProvider2`،
`getAppointmentsForDateRangeAndProvider2`، `addAppointment`،
`updateAppointment`، `getAppointmentTypes`. شکل داده‌شون (`appointmentTransfer`)
از REST هم غنی‌تره (فیلدهایی مثل `urgency`، `style`، `bookingSource`:
`OSCAR` | `MYOSCAR_SELF_BOOKING`).

## عملیات‌های `BookingService`

Endpoint: `https://<host>:8443/oscar/ws/BookingService`
WSDL کامل: `docs/oscar_wadl_files/BookingService.xml`

### `getAppointmentTypesByProvider(providerNo: string) → bookingType[]` — خطای سرور، اولویت پایین

**تست شد، ۲۰۲۶-۰۹-۰۱** — با `providerNo=104` و همون فرمت auth درست
(همون‌جوری که برای `getDayWorkSchedule` جواب داد)، این عملیات یه SOAP Fault
عمومی و بدون جزئیات می‌ده:

```xml
<soap:Fault>
  <faultcode>soap:Server</faultcode>
  <faultstring>Fault occurred while processing.</faultstring>
</soap:Fault>
```

چون auth عبور کرده (این فالت شبیه `InvalidSecurity`/`FailedAuthentication`
نیست)، این یه باگ/محدودیت داخلیِ خودِ این عملیاته، نه مشکل ما. **تصمیم:**
چون هرچی برای availability لازم داریم از `ScheduleService.getDayWorkSchedule`
+ `getScheduleTemplateCodes` به‌طور کامل در دسترسه، پیگیریِ این خطا
اولویت نداره — فعلاً کنار گذاشته شد، مسدودکننده نیست.

### `getExternalAppointmentTypes(arg0: int) → bookingType[]`

**تأییدشده زنده، ۲۰۲۶-۰۹-۰۱** — با `arg0=104`، پاسخ خالی برگشت
(`<ns2:getExternalAppointmentTypesResponse/>` بدون هیچ `<return>`ای) —
یعنی auth درست کار کرد (فالت نگرفتیم)، ولی برای این آرگومان خاص هیچ نوعی
پیدا نشد؛ معنی دقیق `arg0` (شاید `providerNo` به‌صورت int، شاید چیز دیگه)
هنوز کاملاً روشن نیست.

### بقیه‌ی عملیات‌ها (هنوز زنده تست نشدن، ولی شکل‌شون از WSDL معلومه)

- **`getAppointmentTypesByProvider(providerNo: string) → bookingType[] {id, name}`**
  — احتمالاً ساده‌ترین راه برای گرفتن «نوع‌های نوبت‌دهیِ این پزشک».
- **`findAppointment(arg0: int, arg1: string, arg2: dateTime) → appointmentResults`**
  — این مستقیماً «اسلات‌های آزاد» رو می‌ده
  (`appointmentOptions[]: {availableTime, cancelled, encString, providerName, timeDisplay}`)
  بدون نیاز به این‌که خودمون قالب رو با نوبت‌های رزروشده تفریق کنیم! معنی
  دقیق سه پارامتر هنوز تأیید نشده (احتمال: `arg0`=شناسه‌ی نوع نوبت،
  `arg1`=providerNo، `arg2`=تاریخِ شروعِ جست‌وجو) — نیاز به تست زنده‌ی
  بیشتر داره.
- **`bookAppointment(arg0: string, arg1: string) → appointmentConfirmationTransfer`**
  — رزرو مستقیم؛ احتمالاً `arg0`/`arg1` مرتبط با `encString`ی هست که از
  `findAppointment` می‌گیریم (یه توکنِ رمزنگاری‌شده‌ی مخصوصِ همون اسلات).

## جمع‌بندی: راه‌حل نهاییِ availability (طراحی، هنوز پیاده نشده)

با این کشف، دیگه نیازی به قالب ثابتِ پلتفرمی (که کاملاً برگردونده شده بود)
نیست. الگوی جدید:

1. برای هر روزی که بیمار توی تقویم Booking نگاه می‌کنه: `getDayWorkSchedule(providerNo, date)` رو زنده صدا بزن.
2. اگه `holiday: true`، اون روز رو کلاً غیرقابل‌انتخاب نشون بده.
3. `timeSlots[]` رو با `getScheduleTemplateCodes()` فیلتر کن — فقط کدهایی که واقعاً نوع نوبتِ بیمار-محورن (نه Vacation/Meeting/Travel/...) رو نگه دار.
4. با endpoint واقعیِ REST که از قبل داریم (`/schedule/{providerNo}/day/{date}` یا `fetchProviderAppts`) نوبت‌های واقعاً رزروشده رو بگیر و از لیست بالا کم کن.
5. نتیجه = اسلات‌های واقعاً آزاد.

(یا، اگه `findAppointment`/`BookingService` بعد از تست بیشتر ساده‌تر از آب دربیاد، شاید بشه مستقیم از همون استفاده کرد و قدم‌های ۳-۴ رو دور زد.)

## نتیجه‌ی تست `testTimeZone` (۲۰۲۶-۰۹-۰۵) — نتیجه‌گیری غیرمنتظره

با `arg0=true`، پاسخ واقعی:

```xml
<return>1492-06-12T18:26:32Z</return>
```

نام خودِ عملیات (`testTimeZone_1492_05_12_18_26_32`) یک timestamp ثابت رو
توی اسمش کد کرده: `1492-05-12 18:26:32`. نکته‌ی عجیب: ساعت/دقیقه/ثانیه
(`18:26:32`) و روز (`12`) دقیقاً با اسم عملیات یکی‌ان، ولی **ماه یکی
جلوتره** (اسم می‌گه `05`، پاسخ می‌گه `06`).

**این شبیه یه تبدیل timezone معمولی نیست** (تبدیل timezone فقط
ساعت/دقیقه رو جابه‌جا می‌کنه، نه کل ماه رو). فرضیه‌ی محتمل‌تر: این عملیات
توسط یه توسعه‌دهنده‌ی OSCAR برای دیباگ یه باگ قدیمی نوشته شده، و اسمش از
روی مقدار خام `Calendar.MONTH` جاوا گرفته شده — که در جاوا **صفر-پایه**
است (`Calendar.MAY=4`... در واقع دقیق‌تر: ژانویه=0). یعنی وقتی
توسعه‌دهنده مقدار `5` رو از `calendar.get(Calendar.MONTH)` خونده، فکر
کرده «ماه ۵» (می) هست، ولی چون جاوا صفر-پایه‌ست، `5` واقعاً **ژوئن**
بوده — دقیقاً همون چیزی که پاسخ SOAP (که به‌درستی یک‌پایه فرمت شده)
نشون می‌ده: `06`.

**نتیجه:** این تست، ابهامِ اصلیِ ما (آیا `Z` در داده‌های OSCAR واقعاً UTC
هست یا ساعت محلیِ کلینیک) رو **حل نکرد** — چون ساعت/دقیقه/ثانیه اصلاً
تغییر نکرد، فقط شماره‌ی ماه اصلاح شد. برای جواب واقعی، باید:
1. همین تست رو یک‌بار دیگه با `arg0=false` بزنیم و مقایسه کنیم (اگه باز
   هم فقط ماه فرق کنه و ساعت عوض نشه، یعنی این پارامتر اصلاً ربطی به
   GMT/local نداره).
2. `SystemInfoService.getServerTimeGmtOffset` رو بزنیم — این یکی مستقیم
   یه عدد افست برمی‌گردونه و برای سؤال واقعیِ ما مستقیم‌تره.

## نتیجه‌ی تست `getServerTime` (۲۰۲۶-۰۹-۰۵) — تأیید شد: این endpoint واقعاً UTC می‌ده

پاسخ: `2026-09-05T18:09:48.402Z`. هم‌زمان، صاحب پروژه ساعت محلی خودش
(ایران، UTC+3:30) رو گفت: `21:41 pm`. محاسبه: `18:09:48 + 3:30 =
21:39:48` — تطابق تقریباً کامل (اختلاف ~۱ دقیقه، طبیعیِ فاصله‌ی
تایپ‌کردن). **نتیجه: `SystemInfoService.getServerTime` واقعاً UTC
درست برمی‌گردونه، نه ساعت محلیِ اشتباه‌برچسب‌خورده.**

**نکته‌ی مهم:** این تأیید فقط مربوط به همین یک endpoint (سرویس ساعت
سیستم) است — چون `ScheduleService.getDayWorkSchedule` یک پیاده‌سازیِ
کاملاً جداست (و رفتار فعلیِ نمایش خام‌ساعت در صفحه‌ی Booking از قبل با
مقایسه‌ی مستقیم با اسکرین‌شات واقعیِ تقویم OSCAR و تست واقعیِ کاربر
تأیید شده)، این یافته **هیچ تغییری در کد فعلی لازم نمی‌کنه** — فقط این
سؤالِ جداگانه (آیا ساعتِ سیستمِ سرور خودش timezone-aware هست) رو جواب
می‌ده.

## موارد باز/نیازمند تست بیشتر

- [x] ~~`testTimeZone_1492_05_12_18_26_32`~~ — تست شد (بالا مستند شد)؛ نتیجه غیرمرتبط با ابهام UTC/local بود (به‌احتمال زیاد فقط یه باگ نام‌گذاریِ ماهِ صفر-پایه در جاوا).
- [x] ~~`getServerTime`~~ — تست شد (بالا مستند شد)؛ تأیید شد این endpoint واقعاً UTC درست می‌ده. `getServerTimeGmtOffset` دیگه لازم نیست تست بشه (سؤال با getServerTime جواب داده شد).
- [ ] `getDayWorkSchedule` برای یک روزِ واقعاً مرخصی (`holiday: true`) — رفتار دقیق `timeSlots` در این حالت چیه؟
- [x] ~~`getAppointmentTypesByProvider(providerNo)`~~ — تست شد، SOAP Fault عمومی می‌ده (بالا مستند شد)؛ **کنار گذاشته شد، مسدودکننده نیست** — چیزی که لازم داریم از `getScheduleTemplateCodes` در دسترسه.
- [x] ~~`findAppointment`/`bookAppointment`~~ — **تصمیم (۲۰۲۶-۰۹-۰۱):** لازم نیستن. `getDayWorkSchedule` + `getScheduleTemplateCodes` + `/schedule/{providerNo}/day/{date}` (REST، از قبل داریم) کاملاً کافیه؛ رزرو هم از همون `POST /schedule/add` (REST) انجام می‌شه. عمداً تست/پیاده نشدن — نه چون کار نمی‌کنن، چون لازم نبود.
- [ ] اعتبارسنجی این‌که اکانت integration که ساختیم دقیقاً همون تنظیمات ذکرشده در بالا رو داره (مستندسازی برای بازتولید در آینده/کلینیک‌های بعدی).

## وضعیت پیاده‌سازی (۲۰۲۶-۰۹-۰۱)

**کد کامل نوشته و build شده، در حال تست end-to-end با کاربر واقعی.**

فایل‌های اصلی:
- `packages/domain/src/adapters/oscar/oscar-soap-client.ts` — کلاینت عمومی SOAP (پیام WS-Security، parse با `fast-xml-parser`، تشخیص `SOAP Fault`).
- `packages/domain/src/adapters/oscar/oscar-schedule-service.ts` — `getDayWorkSchedule`، `getScheduleTemplateCodes`.
- `apps/web/src/lib/oscar/client.ts` — `getOscarSoapClient()` (lazy singleton، مثل `getOscarClient()`).
- `apps/web/src/lib/doctors/availability.ts` — منطق ترکیب SOAP (قالب) + REST (نوبت‌های رزروشده) → اسلات‌های واقعاً آزاد.
- `apps/web/src/app/api/v1/doctors/[id]/availability/route.ts` — `GET ?year=&month=` (روزهای کاری ماه) و `GET ?date=` (اسلات‌های یک روز).
- `packages/db/prisma/schema/clinic-credential.prisma` — فیلدهای جدید `soapSecurityId`/`soapSecurityTokenKeyEnc` روی `ClinicCredential` (migration زده شده، credential واقعی seed شده: `securityId=134`).
- صفحه‌ی `physician-booking-page.tsx` کامل به این API وصل شده (تقویم + تایم‌اسلات‌های واقعی، دیگه mock نیست).

**باگ‌هایی که در حین تست پیدا و رفع شدن:**
1. توکن OAuth1 (برای همون بخش REST که نوبت‌های رزروشده رو چک می‌کنه) منقضی شده بود → دوباره handshake شد، `accessToken`/`accessTokenSecret` جدید توی `ClinicCredential` ست شد.
2. `month` توی query param `?year=&month=` اولش صفر-پایه بود (قرارداد JS `Date`) که باعث گیجی شد («ماه ۸ رو انتخاب کردم ولی ۷ رفت») → به یک-پایه (انسانی، `month=8`=آگوست) تغییر کرد، فقط دقیقاً سرِ مرز HTTP (`medical-api-client.ts` و `route.ts`)، بدون تغییر توی بقیه‌ی کد (که همچنان صفر-پایه‌ست).

**قدم بعدی:** تأیید نهایی end-to-end از طریق مرورگر/curl توسط صاحب پروژه (چون تماس‌های SOAP و REST هر دو زنده‌ن، طبق قاعده‌ی «هیچ تماس زنده‌ای خودم نمی‌زنم» باید کاربر تست کنه) — بعد از restart کردنِ dev server (چون credential decrypt‌شده و ماژول‌های SOAP client توی حافظه‌ی پروسه cache می‌شن).
