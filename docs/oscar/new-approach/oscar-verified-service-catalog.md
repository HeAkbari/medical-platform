# کاتالوگ سرویس‌های تأییدشده‌ی OSCAR (REST + SOAP)

این سند از ۲۰۲۶-۰۹-۲۵ به بعد، هر سرویس OSCAR (چه REST از `ws/services`،
چه SOAP از `ws/{Service}`) رو که صاحب پروژه به‌صورت زنده تست می‌کنه، با
نمونه‌ی واقعیِ request/response ثبت می‌کنه — هدف اینه که در پایان، آپدیتِ
اپ (repository/adapter های `packages/domain/src/adapters/oscar`) دقیقاً
بر اساس همین سرویس‌های تأییدشده انجام بشه، نه حدس.

**پس‌زمینه:** تا امروز، credential/provider قبلی (`oscardoc`) روی ماژول
Demographic هیچ مجوزی نداشت (نه خواندن، نه نوشتن — جزئیات کامل در
[`deferred-items.md`](./deferred-items.md) آیتم ۱۴). کلینیک یک
provider/credential جدید با دسترسی کامل‌تر ایجاد کرد و صاحب پروژه با اون
یک OAuth1 consumer key/token تازه ساخته؛ سرویس‌هایی که قبلاً به همین دلیل
شکست می‌خوردن (از جمله ایجاد و حذف بیمار) الان کار می‌کنن.

**قانون مستندسازی این پروژه:** هر سرویسی که کشف/تست بشه ثبت می‌شه، حتی
اگه فعلاً در اپ استفاده نشه (طبق قانون کلی مستندسازیِ صاحب پروژه).

---

## نحوه‌ی ثبت هر سرویس

هر ورودی این قالب رو دنبال می‌کنه:

```
### <نام سرویس یا متد> — <REST یا SOAP>

- **Endpoint:** `METHOD /path` (یا SOAP operation name + service)
- **کاربرد:** توضیح یک/دو خطی که این سرویس چیکار می‌کنه و کجای اپ ممکنه ازش استفاده کنه
- **وضعیت:** ✅ تأییدشده زنده (تاریخ) | 🟡 تست شده ولی نتیجه ناقص | ❌ خطا داد

**Request نمونه:**
\`\`\`
...
\`\`\`

**Response نمونه:**
\`\`\`
...
\`\`\`

**نکات:** هر چیز غیرعادی — فیلدهای خالی/null، رفتار عجیب، محدودیت، وابستگی به سرویس دیگه
```

---

## REST (`ws/services`)

### ایجاد بیمار جدید — REST

- **Endpoint:** `POST /demographics`
- **کاربرد:** ایجاد یک رکورد Demographic (بیمار) جدید در OSCAR. تنها راه
  شناخته‌شده برای ایجاد بیمار (نه match/link با بیمار موجود — اون
  `matchDemographic`ه، جای دیگه مستند شده).
- **وضعیت:** ✅ تأییدشده زنده (۲۰۲۶-۰۹-۲۵) — با credential جدید (provider
  با دسترسی کامل‌تر، نه `oscardoc`). با credential قبلی همین دقیقاً همین
  درخواست با ۵۰۰ `missing required security object (_demographic)` شکست
  می‌خورد (نگاه کن به [`deferred-items.md`](./deferred-items.md) آیتم ۱۴).

**Request نمونه (مقادیر هویتی با placeholder جایگزین شده، ساختار واقعیه):**
```
POST /demographics
Accept: application/json, application/xml
Content-Type: application/json
Authorization: OAuth ... (OAuth1 HMAC-SHA1، امضای لحظه‌ای — نگاه کن به
  credential جاری در ClinicCredential، جدول DB)
```
```json
{
    "address": {
        "province": "CA-BC",
        "postal": "<POSTAL>",
        "city": "<CITY>",
        "address": "<STREET_ADDRESS>"
    },
    "phone": "<PHONE>",
    "alternativePhone": "",
    "patientStatus": "DE",
    "patientStatusDate": "2026-07-16",
    "rosterStatus": "",
    "providerNo": "104",
    "hin": "<HIN>",
    "ver": "",
    "dateOfBirth": 590803200000,
    "dobYear": "1988",
    "dobMonth": "09",
    "dobDay": "21",
    "sex": "M",
    "sexDesc": "Male",
    "familyDoctor": "<rdohip></rdohip><rd></rd>",
    "firstName": "<FIRST_NAME>",
    "lastName": "<LAST_NAME>",
    "hcType": "BC",
    "chartNo": "",
    "email": "<EMAIL>",
    "sin": "",
    "spokenLanguage": "",
    "provider": { "providerNo": "103", "...": "کل شیء providerTo1 واقعیِ یک provider موجود" },
    "title": "",
    "officialLanguage": "English",
    "countryOfOrigin": "CA",
    "newsletter": "Unknown",
    "notes": "<unotes></unotes>",
    "middleNames": "",
    "demoContacts": [],
    "demoContactPros": [],
    "extras": [],
    "doctors": [ { "providerNo": "999998", "lastName": "oscardoc", "...": "یک providerTo1 کامل" } ],
    "nurses": [],
    "midwives": [],
    "referralDoctors": [],
    "waitingListNames": [],
    "patientStatusList": [],
    "rosterStatusList": [],
    "allergies": [],
    "measurements": [],
    "consultationRequests": [],
    "consultationResponses": [],
    "encounterNotes": [],
    "documents": [],
    "medicationSummary": []
}
```

**Response نمونه (موفق، همون placeholder ها):**
```json
{
    "demographicNo": 15,
    "address": { "province": "CA-BC", "postal": "<POSTAL>", "city": "<CITY>", "address": "<STREET_ADDRESS>" },
    "phone": "<PHONE>",
    "patientStatus": "AC",
    "patientStatusDate": 1784160000000,
    "providerNo": "104",
    "hin": "<HIN>",
    "dateOfBirth": 590803200000,
    "dobYear": "1988", "dobMonth": "09", "dobDay": "21",
    "sex": "M", "sexDesc": "Male",
    "firstName": "<FIRST_NAME_UPPERCASED>",
    "lastName": "<LAST_NAME_UPPERCASED>",
    "hcType": "BC",
    "email": "<EMAIL>",
    "lastUpdateUser": "101",
    "lastUpdateDate": 1790342103221,
    "age": { "days": 4, "months": 0, "years": 38 },
    "provider": { "providerNo": "103", "...": "همون provider echo شد" },
    "doctors": [],
    "nurses": [], "midwives": [], "referralDoctors": [],
    "allergies": [], "measurements": [], "documents": []
}
```

**نکات مهم (از مقایسه‌ی request/response کشف شد):**

1. **`demographicNo` تازه اختصاص داده می‌شه** (این‌جا `15`) — کلید اصلی
   برای همه‌ی عملیات بعدی روی این بیمار (GET/PUT/DELETE، پیوست‌کردن نوبت
   و غیره).
2. **`patientStatus` که فرستادیم (`"DE"`) نادیده گرفته شد** — سرور
   همیشه بیمار تازه‌ساز رو `"AC"` (Active) برمی‌گردونه، صرف‌نظر از
   مقداری که تو request فرستادیم. یعنی برای ساختن بیمار با وضعیت غیر از
   Active، این فیلد کارساز نیست (شاید نیاز به یه `PUT` جدا بعد از create
   داشته باشه).
3. **`firstName`/`lastName` به‌صورت خودکار UPPERCASE می‌شن** — چیزی که
   فرستادیم mixed-case بود، چیزی که برگشت تماماً حروف بزرگ بود. این باید
   تو نمایش/normalize سمت اپ در نظر گرفته بشه (یا اپ خودش title-case کنه
   قبل نمایش).
4. **✏️ اصلاحیه: آرایه‌ی `doctors` که فرستادیم واقعاً ذخیره شد — فقط
   پاسخِ همون create نشونش نداد.** اولش فکر می‌کردیم نادیده گرفته می‌شه
   (چون response با `doctors: []` برگشت با این‌که یک `providerTo1` کامل
   (`oscardoc`) تو request بود)، ولی صاحب پروژه تأیید کرد که یه `GET`
   جدا بعد از create نشون داد دکتر واقعاً به لیست اضافه شده بود. یعنی
   این فیلد **نوشتنی هست**، فقط یه نمونه‌ی دیگه از همون الگوی «echo
   غیرقابل‌اعتماد تو پاسخِ فوریِ POST/PUT» بود (نگاه کن نکته‌ی ۵ سرویس
   PUT بالا برای همون الگو با فیلد `provider`) — برای دیدن مقدار واقعی،
   همیشه باید بعد از create/update یه `GET` جدا زد.
5. **`patientStatusDate` فرمت انعطاف‌پذیره ولی خروجی نرمالایز می‌شه** —
   ورودی رشته‌ی تاریخ ساده (`"2026-07-16"`) بود، خروجی epoch میلی‌ثانیه
   (`1784160000000`) شد. `dateOfBirth` رو مستقیم به‌صورت epoch میلی‌ثانیه
   فرستادیم و بدون تغییر برگشت — یعنی epoch-ms فرمت امن‌تر/مطمئن‌تریه.
6. **بدنه‌ی کامل (نه مینیمال) لازم بود** — تلاش‌های قبلی با یه JSON کوچیک
   (فقط `firstName`/`lastName`/`address`/...) هیچ‌وقت زنده تست نشدن؛ چیزی
   که واقعاً کار کرد، کل شیء `demographicTo1` بود (شامل `provider` و
   `doctors` کامل، حتی اگه بعضی فیلدهاش نادیده گرفته بشن). فعلاً معلوم
   نیست کدوم فیلدها واقعاً *لازم*ان و کدوم فقط «همراه» اومدن — نیاز به
   یه تست جدا با بدنه‌ی minimal داره تا فیلدهای واقعاً اجباری مشخص بشن
   (هنوز انجام نشده).

---

### ویرایش بیمار موجود — REST

- **Endpoint:** `PUT /demographics`
- **کاربرد:** آپدیت یک رکورد Demographic موجود (بر اساس `demographicNo`
  داخل بدنه — نه تو URL/path).
- **وضعیت:** ✅ تأییدشده زنده (۲۰۲۶-۰۹-۲۵) — روی همون بیمار تستی که با
  `POST /demographics` بالا ساخته شد (`demographicNo: 15`).

**Request نمونه (مقادیر هویتی placeholder شدن):**
```
PUT /demographics
Accept: application/xml
Content-Type: application/json
Authorization: OAuth ... (OAuth1، همون credential)
```
```json
{
    "demographicNo": 15,
    "address": { "province": "CA-BC", "postal": "<POSTAL>", "city": "<CITY>", "address": "<STREET_ADDRESS>" },
    "phone": "<PHONE>",
    "patientStatus": "AC",
    "patientStatusDate": 1784160000000,
    "providerNo": "104",
    "hin": "<HIN_NEW_VALUE>",
    "dateOfBirth": 590803200000,
    "dobYear": "1988", "dobMonth": "09", "dobDay": "21",
    "sex": "M", "sexDesc": "Male",
    "firstName": "<FIRST_NAME_2>",
    "lastName": "<LAST_NAME_2>",
    "hcType": "BC",
    "chartNo": "",
    "email": "<EMAIL>",
    "provider": { "providerNo": "104", "lastName": "Sharifpour", "firstName": "Sina", "...": "کل شیء providerTo1" },
    "lastUpdateUser": "101",
    "doctors": [],
    "...": "بقیه‌ی فیلدها دقیقاً همون شکل demographicTo1 (شبیه POST بالا)"
}
```

**Response نمونه (موفق — این‌بار XML، چون فقط `Accept: application/xml`
فرستاده شد؛ طبق WADL، متد `PUT` روی این resource اصلاً representation
`application/json` برای response نداره، فقط `application/xml` — دقیقاً
تأیید شد):**
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<demographicTo1>
    <address>
        <address><STREET_ADDRESS></address>
        <city><CITY></city>
        <postal><POSTAL></postal>
        <province>CA-BC</province>
    </address>
    <age><days>4</days><months>0</months><years>38</years></age>
    <dateOfBirth>1988-09-21T00:00:00Z</dateOfBirth>
    <demographicNo>15</demographicNo>
    <dobDay>21</dobDay><dobMonth>09</dobMonth><dobYear>1988</dobYear>
    <email><EMAIL></email>
    <firstName><FIRST_NAME_2></firstName>
    <hin><HIN_NEW_VALUE></hin>
    <lastName><LAST_NAME_2></lastName>
    <lastUpdateDate>2026-09-25T13:22:18.641Z</lastUpdateDate>
    <lastUpdateUser>101</lastUpdateUser>
    <patientStatus>AC</patientStatus>
    <patientStatusDate>2026-07-16T00:00:00Z</patientStatusDate>
    <phone><PHONE></phone>
    <provider>
        <firstName>Sina</firstName>
        <lastName>Sharifpour</lastName>
        <name>Sharifpour, Sina</name>
        <ohipNo>1235</ohipNo>
        <practitionerNo>12341234</practitionerNo>
        <providerNo>104</providerNo>
        <lastUpdateDate>2026-06-25T05:01:29Z</lastUpdateDate>
    </provider>
    <providerNo>104</providerNo>
    <sex>M</sex><sexDesc>Male</sexDesc>
</demographicTo1>
```

**نکات مهم:**

1. **آپدیت واقعاً persist شد** — `hin` عمداً تغییر کرد (رقمی فرق کرد) و
   `firstName`/`lastName` کاملاً عوض شدن؛ response همون مقادیر جدید رو
   برگردوند. یعنی `PUT` واقعاً می‌نویسه، فقط echo نیست.
2. **فرمت response به `Accept` وابسته‌ست، ولی WADL محدودش کرده** — چون
   این‌بار فقط `Accept: application/xml` فرستاده شد (نه `json, xml` مثل
   POST)، جواب XML بود. طبق تعریف WADL، `PUT` اصلاً representation
   json برای response نداره (بر خلاف POST که هم json هم xml داره) — پس
   برای این متد همیشه باید XML رو parse کرد، نه JSON.
3. **فرمت تاریخ بین JSON و XML فرق می‌کنه** — تو پاسخ JSON سرویس create
   بالا، `dateOfBirth`/`patientStatusDate` به‌صورت epoch میلی‌ثانیه
   بودن؛ اینجا (XML) همون فیلدها به‌صورت رشته‌ی ISO-8601
   (`1988-09-21T00:00:00Z`) برگشتن. یعنی serializer XML و JSON سمت
   OSCAR فرمت متفاوتی برای تاریخ دارن — پارسر سمت اپ باید هر دو حالت رو
   پشتیبانی کنه (بسته به این‌که کدوم Accept فرستاده می‌شه).
4. **فیلدهای `null`/خالی از خروجی XML حذف می‌شن** — بر خلاف JSON (که
   `null`/`[]` رو صریح نشون می‌ده)، سریالایزر XML فیلدهای null رو کلاً از
   خروجی حذف می‌کنه (مثلاً `notes`, `nurse`, `resident`, `alert`,
   `doctors` خالی و ده‌ها فیلد دیگه اصلاً تو XML نیستن). این یه تفاوت
   سطحِ serialization‌ه، نه این‌که مقدار واقعی فرق کرده.
5. **شیء تو در توی `provider` احتمالاً read-only/computed‌ه، نه از
   بدنه‌ی request خونده می‌شه** — تو POST قبلی، `provider.providerNo`
   برابر `"103"` فرستاده شده بود ولی سرور `"103"` رو برگردوند؛ اینجا تو
   PUT، `provider.providerNo` برابر `"104"` فرستاده شد و سرور بازم
   `"104"` رو برگردوند — همیشه با همون اطلاعات واقعیِ provider واقعی
   (Sina Sharifpour) که این عدد بهش اشاره می‌کنه، صرف‌نظر از این‌که چه
   فیلدهای دیگه‌ای تو نestedِ `provider` object فرستاده بودیم. حدس
   محتمل (هنوز قطعی نیست): سرور این بلوک رو از روی مقدار
   `provider.providerNo` (یا شاید `providerNo` سطح بالا) لوک‌آپ و کامل
   می‌کنه، نه این‌که بقیه‌ی فیلدهای نستد رو از request بخونه/بنویسه —
   شبیه رفتار `doctors` تو POST که کلاً نادیده گرفته شد. برای تأیید
   قطعی، باید یه تست جدا با `provider.providerNo` نامعتبر یا خالی زد و
   دید چی برمی‌گرده.

   **✏️ اصلاحیه:** این حدس غلط بود — نگاه کن نکته‌ی ۵ سرویس بعدی (خواندن
   تکی بیمار) پایین.

---

### خواندن یک بیمار (تکی، بر اساس ID) — REST

- **Endpoint:** `GET /demographics/{demographicNo}`
- **کاربرد:** خوندن کامل اطلاعات یک بیمار مشخص با شماره‌ی `demographicNo`.
- **وضعیت:** ✅ تأییدشده زنده (۲۰۲۶-۰۹-۲۵)
- **✏️ اصلاحیه:** اولش فکر می‌کردیم این مسیر تو WADL نیست — غلط بود.
  `docs/oscar_wadl_files/services.xml` واقعاً یه resource جدا به اسم
  `/demographics/{dataId}` داره (پارامترش `dataId` نام‌گذاری شده، نه
  `demographicNo` — برای همین grep اولیه پیداش نکرده بود) که هم `GET`
  (با `includes[]` اختیاری، json/xml) و هم `DELETE` (xml) روش تعریف
  شده — درست همونی که پایین برای DELETE هم ثبت شده. این جدا از
  `/demographics/basic/{dataId}` (که فقط GET داره) هست. قبلاً
  `demographics/{dataId}?includes[]=documents` با credential قدیمی
  (`oscardoc`) «تأییدشده که در دسترس نیست، ۴۰۱» ثبت شده بود
  ([`OSCAR_ENDPOINTS_IN_USE.md`](../OSCAR_ENDPOINTS_IN_USE.md) خط ۱۶۸) —
  که احتمالاً به کمبود مجوز `_demographic` مربوط بوده (نگاه کن
  `deferred-items.md` #۱۴)، نه به خودِ مسیر؛ با credential جدید همین
  مسیر کار می‌کنه.

**Request:**
```
GET /demographics/15
Accept: application/json, application/xml
Authorization: OAuth ... (همون credential)
```

**Response نمونه (موفق، JSON — placeholder روی مقادیر هویتی):**
```json
{
    "demographicNo": 15,
    "address": { "province": "CA-BC", "postal": "<POSTAL>", "city": "<CITY>", "address": "<STREET_ADDRESS>" },
    "phone": "<PHONE>",
    "patientStatus": "AC",
    "patientStatusDate": "2026-07-16",
    "providerNo": "104",
    "hin": "<HIN>",
    "dateOfBirth": 590803200000,
    "dobYear": "1988", "dobMonth": "09", "dobDay": "21",
    "sex": "M", "sexDesc": "Male",
    "firstName": "<FIRST_NAME>",
    "lastName": "<LAST_NAME>",
    "email": "<EMAIL>",
    "provider": {
        "providerNo": "104",
        "firstName": "<REAL_PROVIDER_FIRST_NAME>",
        "lastName": "<REAL_PROVIDER_LAST_NAME>",
        "ohipNo": "",
        "practitionerNo": "",
        "...": "provider واقعیِ providerNo=104 — با چیزی که تو POST/PUT دیده بودیم فرق داره!"
    },
    "doctors": [
        { "providerNo": "999998", "lastName": "oscardoc", "firstName": "doctor", "...": "..." },
        { "providerNo": "102", "lastName": "<P2_LAST>", "firstName": "<P2_FIRST>", "...": "..." },
        { "providerNo": "101", "lastName": "<P3_LAST>", "firstName": "<P3_FIRST>", "...": "..." },
        { "providerNo": "103", "lastName": "<P4_LAST>", "firstName": "<P4_FIRST>", "...": "..." }
    ],
    "referralDoctors": [
        {
            "id": 1,
            "firstName": "<REFDOC_FIRST>",
            "lastName": "<REFDOC_LAST>",
            "professionalLetters": "FRCP",
            "streetAddress": "<REFDOC_ADDRESS>",
            "phoneNumber": "<REFDOC_PHONE>",
            "specialtyType": "Cardiology",
            "annotation": "<REFDOC_NOTE>"
        }
    ],
    "allergies": [], "measurements": [], "documents": []
}
```

**نکات مهم:**

1. **مسیر ساده‌ی `/demographics/{id}` وجود داره و کار می‌کنه**، حتی با
   این‌که در WADL نیست — برای خوندن تکی، به‌جای `basic/{dataId}` هم
   می‌شه از همین مسیر ساده‌تر استفاده کرد.
2. **`doctors` تو یه GET واقعی، ۴ تا provider واقعی برمی‌گردونه** —
   کاملاً برخلاف پاسخِ `POST`/`PUT` که همیشه `doctors: []` بود (حتی وقتی
   تو create یه provider تو این آرایه فرستاده بودیم). یعنی این لیست یه
   رابطه‌ی واقعیِ از قبل موجود تو OSCARه (شاید یه association پیش‌فرض که
   این نصب سندباکس برای بیمارهای جدید داره)، نه چیزی که از بدنه‌ی
   create/update نوشته بشه.
3. **`referralDoctors` هم پر و واقعیه** — یه پزشک ارجاع‌دهنده
   (`professionalSpecialistTo1`) با annotation. این فیلد هم تو
   POST/PUT همیشه خالی بود.
4. **فرمت `patientStatusDate` اینجا یه رشته‌ی تاریخ ساده‌ست
   (`"2026-07-16"`)** — نه epoch-ms (مثل پاسخ JSON اون POST) نه
   ISO-datetime کامل (مثل پاسخ XML اون PUT). یعنی این فیلد رو حداقل به
   **سه شکل مختلف** بسته به این‌که کدوم endpoint جوابش رو داده دیدیم؛
   `dateOfBirth` برعکس، تو همه‌ی این‌ها epoch-ms موند (پایدارتره). سمت اپ
   باید یه parser انعطاف‌پذیر برای تاریخ‌ها داشته باشه، نه فرض ثابت روی
   یه فرمت.
5. **🔑 کشف مهم: `provider` تو پاسخِ POST/PUT صرفاً echo بود، نه یه
   lookup واقعی.** تو پاسخ `POST` و `PUT` بالا، `provider.providerNo`
   همیشه دقیقاً همون چیزی بود که تو request فرستاده بودیم (با اسم‌های
   متفاوت هربار، چون خودمون دستی تغییرش داده بودیم). ولی همین `GET`
   خالص (بدون بدنه)، برای همون `demographicNo=15` با همون
   `providerNo="104"`، یه **provider کاملاً متفاوت** (نه چیزی که تو
   POST/PUT دیده بودیم) برگردوند. نتیجه: `provider` object تو پاسخِ
   نوشتن (POST/PUT) **قابل‌اعتماد نیست** — همیشه باید بعد از هر
   create/update، یه `GET` جدا زد تا مقدار واقعیِ فعلی رو گرفت؛ به پاسخِ
   خودِ POST/PUT برای این فیلد تکیه نکنیم.

---

### حذف بیمار — REST

- **Endpoint:** `DELETE /demographics/{demographicNo}` (تو WADL پارامترش
  `dataId` نام‌گذاری شده، ولی همون `demographicNo`ست — همون resource
  `/demographics/{dataId}` که تو نکته‌ی اصلاحیه‌ی سرویس GET بالا اشاره
  شد، همینجا `DELETE` هم داره).
- **کاربرد:** «حذف» یک بیمار.
- **وضعیت:** ✅ تأییدشده زنده (۲۰۲۶-۰۹-۲۵) — با credential قدیمی
  (`oscardoc`) به‌خاطر کمبود مجوز `_demographic` شکست می‌خورد.

**Request:**
```
DELETE /demographics/12
Accept: application/xml
Authorization: OAuth ... (همون credential)
```

**Response نمونه (موفق، XML — طبق WADL این متد فقط xml داره، نه json):**
```xml
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<demographicTo1>
    <demographicNo>12</demographicNo>
    <firstName><FIRST_NAME></firstName>
    <lastName><LAST_NAME></lastName>
    <email><EMAIL></email>
    <hin><HIN></hin>
    <patientStatus>DE</patientStatus>
    <patientStatusDate>2026-07-16T00:00:00Z</patientStatusDate>
    <provider>
        <providerNo>104</providerNo>
        <firstName>Meisam</firstName>
        <lastName>Abdollahi</lastName>
        <!-- provider واقعی، مطابق با چیزی که از GET هم دیدیم -->
    </provider>
    <doctors><!-- ۴ تا provider واقعی، مثل GET --></doctors>
    <referralDoctors><!-- همون پزشک ارجاع‌دهنده‌ی واقعی --></referralDoctors>
    <!-- بقیه‌ی فیلدها دست‌نخورده، دقیقاً مثل قبل از delete -->
</demographicTo1>
```

**نکات مهم (این‌یکی خیلی مهمه):**

1. **🔑 این یک soft-delete‌ه، نه حذف واقعی از دیتابیس.** رکورد بیمار بعد
   از `DELETE` کاملاً همچنان موجوده و با همون `demographicNo` (اینجا
   `12`) قابل `GET` زدنه — فقط `patientStatus` به `"DE"` تغییر می‌کنه.
   این دقیقاً همون کدیه که قبلاً تو `POST /demographics` امتحان کرده
   بودیم و سرور نادیده‌اش گرفته بود (نکته‌ی ۲ سرویس create بالا) — یعنی
   `"DE"` یه کد وضعیت واقعی و معتبره (به احتمال زیاد "Deceased" یا
   "Deleted")، فقط تنها راه رسیدن بهش از طریق create نیست، از طریق همین
   `DELETE` هست.
2. **یعنی اگه اپ به این «حذف» تکیه کنه، بیمار همچنان تو سیستم OSCAR
   باقی می‌مونه** — هر query ای که `patientStatus` رو فیلتر نکنه (مثل
   `GET /demographics` معمولی که قبلاً دیدیم)، احتمالاً بازم این بیمار
   رو نشون می‌ده مگر این‌که صراحتاً `DE` رو exclude کنه. این باید تو
   طراحی «حذف بیمار» تو اپ در نظر گرفته بشه — عملاً معادل یه
   soft-delete/آرشیوه، نه حذف واقعیِ داده.
3. **`provider` و `doctors` تو پاسخِ DELETE، واقعی‌ان (نه echo)** —
   `provider.providerNo=104` اینجا درست «Abdollahi, Meisam» رو نشون
   می‌ده (مطابق GET واقعی)، نه echo چیزی که قبلاً دستی تو یه POST/PUT
   فرستاده شده بود. یعنی برخلاف POST/PUT، پاسخِ `DELETE` (مثل `GET`) به
   دیتابیس واقعی وصله (این‌جا اصلاً بدنه‌ای هم تو request نبود که echo
   بشه) — کاملاً هم‌راستا با نکته‌ی ۵ سرویس create/GET بالا.

---

### لیست پزشکان (Provider ها) — REST

- **Endpoint:** `GET /providerService/providers_json`
- **کاربرد:** گرفتن لیست کامل provider های ثبت‌شده تو این نصب OSCAR.
  **از قبل تو پروژه استفاده می‌شه** — طبق
  [`OSCAR_ENDPOINTS_IN_USE.md`](../OSCAR_ENDPOINTS_IN_USE.md)، همین
  endpoint یه job دوره‌ای رو تغذیه می‌کنه که جدول `Doctor` (Postgres) رو
  پر می‌کنه (`GET /api/v1/doctors` نهایتاً از همین جدول می‌خونه، نه
  مستقیم از OSCAR).
- **وضعیت:** ✅ تأییدشده زنده (۲۰۲۶-۰۹-۲۵) — این یکی حتی با credential
  قدیمی (`oscardoc`) هم کار می‌کرد؛ چون روی ماژول Provider (نه
  Demographic) مجوز داشت.

**Request:**
```
GET /providerService/providers_json
Accept: application/json
Authorization: OAuth ... (بدون هیچ query param ای — بدون offset/limit)
```

**Response نمونه (کامل، غیرشخصی — این‌جا اطلاعات provider ذاتاً برای
نمایش عمومی/انتخاب پزشکه، PII حساس نیست):**
```json
{
    "offset": 0,
    "limit": 0,
    "total": 7,
    "timestamp": 1790344824651,
    "content": [
        { "providerNo": "104", "firstName": "Meisam", "lastName": "Abdollahi", "name": "Abdollahi, Meisam", "ohipNo": "", "specialty": "", "email": "", "enabled": true },
        { "providerNo": "101", "firstName": "Farzad", "lastName": "Alimohammadi", "ohipNo": "6025", "practitionerNo": "6726736025", "specialty": "", "enabled": true },
        { "providerNo": "102", "firstName": "Amin", "lastName": "Bahrami", "ohipNo": "1234", "practitionerNo": "1234567", "specialty": "", "enabled": true },
        { "providerNo": "999998", "firstName": "doctor", "lastName": "oscardoc", "specialty": "", "dob": "0001-01-01", "signedConfidentiality": -62135769600000, "enabled": true },
        { "providerNo": "105", "firstName": "sean", "lastName": "Seansean", "specialty": "", "enabled": true },
        { "providerNo": "103", "firstName": "Sina", "lastName": "Sharifpour", "ohipNo": "1235", "practitionerNo": "12341234", "specialty": "", "enabled": true },
        { "providerNo": "-1", "firstName": "system", "lastName": "system", "specialty": "system", "ohipNo": null, "email": null, "enabled": true }
    ],
    "query": null
}
```

**نکات مهم:**

1. **wrapper پاسخ استاندارد `abstractSearchResponse`ه** (`offset`,
   `limit`, `total`, `timestamp`, `content`, `query`) — همون schema که
   تو WADL برای خیلی از لیست‌ها تعریف شده (نگاه کن
   [`services.xml:414-423`](../../oscar_wadl_files/services.xml#L414-L423)).
   احتمالاً بقیه‌ی endpoint های لیستی مشابه هم همین شکل رو دارن.
2. **`limit: 0` تو پاسخ به این معنی نیست که چیزی محدود شده** — چون هیچ
   `offset`/`limit` تو request فرستاده نشده بود، سرور همه‌ی ۷ تا رکورد
   رو برگردوند (`total: 7`، `content` هم ۷ تا عضو داره)؛ `limit: 0`
   فقط echo مقدار پیش‌فرض/نبودِ پارامتره، نه یه محدودیت واقعی. برای اپ
   مهمه این رو با یه pagination واقعی (که واقعاً می‌بُره) اشتباه نگیریم.
3. **لیست شامل provider های غیر-پزشک/سیستمی هم می‌شه** — `providerNo: "-1"`
   با `name: "system, system"` (یه حساب سیستمی OSCAR، نه پزشک واقعی) و
   `providerNo: "999998"` (همون `oscardoc`، حساب دمو/integration که قبلاً
   کلی باهاش کار کردیم، نه یه پزشک واقعی کلینیک). **اپ باید این‌ها رو قبل
   از نمایش به‌عنوان «پزشک» فیلتر کنه** — مثلاً بر اساس `providerNo`
   منفی یا لیست سیاه شناخته‌شده، نه صرفاً `enabled: true` (چون هر دوی
   این‌ها هم `enabled: true` دارن).
4. **فیلدهای بالینی/نمایشی (specialty, ohipNo, email, phone) تقریباً
   برای همه خالی‌ان** — حتی برای پزشک‌های واقعی (`101`-`105`), `specialty`
   همیشه `""` بود. یعنی این endpoint فقط برای شناسه/اسم پایه مفیده، نه
   منبع تخصص/بیوگرافی پزشک — با چیزی که از قبل می‌دونستیم (این اطلاعات
   از جدول `Doctor` خودمون میان، نه از OSCAR) سازگاره.

---

### لیست کامل نسخه‌های یک بیمار — REST

- **Endpoint:** `GET /rx/drugs/all/{demographicNo}`
- **کاربرد:** گرفتن همه‌ی نسخه‌های دارویی یک بیمار (فعال + آرشیوشده، همه
  با هم) — خواهرخوانده‌ی `rx/drugs/current/{demographicNo}` و
  `rx/drugs/archived/{demographicNo}` که قبلاً تو
  [`OSCAR_ENDPOINTS_IN_USE.md`](../OSCAR_ENDPOINTS_IN_USE.md) (خط ۱۲۸-۱۲۹)
  «پیاده‌شده ولی تست زنده نشده» ثبت شده بودن؛ این‌یکی (`all`) قبلاً حتی
  تو اون سند هم نبود، مستقیم از WADL کشف شد.
- **وضعیت:** ✅ تأییدشده زنده (۲۰۲۶-۰۹-۲۵)

**Request:**
```
GET /rx/drugs/all/1
Accept: application/json
Authorization: OAuth ...
```

**Response نمونه:**
```json
{
    "offset": 0,
    "limit": 0,
    "total": 0,
    "timestamp": 1790345667887,
    "content": [
        {
            "drugId": 1,
            "brandName": "CLOPIDOGREL  75MG TABLET",
            "genericName": "CLOPIDOGREL (CLOPIDOGREL BISULFATE)",
            "atc": "B01AC04",
            "regionalIdentifier": "02385813",
            "demographicNo": 1,
            "providerNo": "999998",
            "takeMin": 1.0, "takeMax": 1.0,
            "rxDate": "2017-09-11",
            "endDate": "2017-10-09",
            "writtenDate": "2017-09-11",
            "frequency": "OD",
            "duration": 14, "durationUnit": "D",
            "form": "TABLET",
            "method": "Take",
            "prn": false,
            "repeats": 1,
            "quantity": 14,
            "instructions": "CLOPIDOGREL  75MG TABLET\nTake 1 tab OD\nQty:14 Repeats:1",
            "archived": false,
            "strength": 75.0, "strengthUnit": "MG",
            "longTerm": true,
            "noSubstitutions": false,
            "dispenseInterval": "0",
            "refillDuration": 0, "refillQuantity": 0,
            "nonAuthoritative": false
        }
    ],
    "query": null
}
```

**نکات مهم:**

1. **🔑 باگ/ناسازگاریِ `total` — قابل‌اعتماد نیست.** پاسخ `total: 0`
   می‌ده، در حالی که `content` واقعاً **یک آیتم داره**! یعنی برای چک
   کردن «آیا این بیمار نسخه داره یا نه»، اپ **نباید** به `total` تکیه
   کنه — باید طول واقعی آرایه‌ی `content` رو چک کنه. چون wrapper
   (`abstractSearchResponse`) بین خیلی از لیست‌های OSCAR مشترکه (نگاه
   کن نکته‌ی ۱ سرویس «لیست پزشکان» بالا)، این باگ احتمالاً رو خواهرخوانده‌های
   `current`/`archived`/`longterm` هم صدق می‌کنه — هنوز مستقیم تست نشده،
   ولی باید با همین فرض احتیاط برخورد کرد.
2. **ساختار دارو غنی و مستقیماً قابل‌نمایشه** — `instructions` یه رشته‌ی
   انسانی-خوان کامل داره (نام دارو + دوز + تعداد repeat)، که می‌تونه
   بدون پردازش اضافه مستقیم تو UI نشون داده بشه. فیلدهای ساختاریافته
   هم هستن (`frequency`, `duration`+`durationUnit`, `form`, `strength`+
   `strengthUnit`, `repeats`, `quantity`) برای هر نمایش سفارشی‌تر.
3. **`archived`/`longTerm` بولین‌های مفیدن** برای فیلتر «نسخه‌ی فعلی»
   در برابر «آرشیوشده»/«بلندمدت» بدون نیاز به صدا زدن endpoint جدا —
   یعنی احتمالاً فقط همین یکی (`all`) برای اپ کافیه و نیازی به صدا زدن
   `current`/`archived` جدا نیست (باید بررسی بشه).

---

## SOAP (`ws/{Service}`)

### زمان‌بندی روزانه‌ی یک پزشک — SOAP

- **سرویس/عملیات:** `ScheduleService.getDayWorkSchedule(providerNo, date)`
- **کاربرد:** گرفتن قالب کاری واقعیِ یک پزشک برای یه روز مشخص — همه‌ی
  اسلات‌های ۱۵ دقیقه‌ای روز با کد وضعیت هرکدوم (کار/مرخصی/نوع نوبت‌دهی).
- **وضعیت:** ✅ تأییدشده زنده (۲۰۲۶-۰۹-۲۵؛ اولین بار ۲۰۲۶-۰۹-۰۱ کشف و تست
  شده بود، الان با credential/provider جدید دوباره تأیید شد)
- **⚠️ توضیح کامل‌تر جای دیگه هست:** این عملیات قبلاً به‌طور کامل تو
  [`oscar-soap-schedule-services.md`](./oscar-soap-schedule-services.md)
  مستند شده — شامل جزئیات عجیبِ auth (WS-Security UsernameToken، فرمت
  دقیق `Password/@Type`، نیاز به خاموش‌کردن «Pin(remote) Enable» تو
  پنل ادمین OSCAR برای اکانت integration)، و **از قبل تو کد پیاده‌سازی
  شده** (`packages/domain/src/adapters/oscar/oscar-schedule-service.ts`).
  این‌جا فقط برای کامل‌بودن کاتالوگ، خلاصه ثبت می‌شه.

**Request:**
```
POST /oscar/ws/ScheduleService
Content-Type: text/xml; charset=UTF-8
SOAPAction;
```
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ws="http://ws.oscarehr.org/" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
  <soapenv:Header>
    <wsse:Security>
      <wsse:UsernameToken>
        <wsse:Username>...</wsse:Username>
        <wsse:Password Type="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText">...</wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
  </soapenv:Header>
  <soapenv:Body>
    <ws:getDayWorkSchedule>
      <arg0>104</arg0>
      <arg1>2026-09-21T13:15:00</arg1>
    </ws:getDayWorkSchedule>
  </soapenv:Body>
</soapenv:Envelope>
```

**Response نمونه (موفق):**
```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ns2:getDayWorkScheduleResponse xmlns:ns2="http://ws.oscarehr.org/">
      <return>
        <holiday>false</holiday>
        <timeSlotDurationMin>15</timeSlotDurationMin>
        <timeSlots><date>2026-09-21T10:00:00Z</date><scheduleCode>67</scheduleCode></timeSlots>
        <!-- ... تا 13:45، همه scheduleCode=67 (16 اسلات) ... -->
        <timeSlots><date>2026-09-21T14:00:00Z</date><scheduleCode>80</scheduleCode></timeSlots>
        <!-- ... تا 15:45، همه scheduleCode=80 (8 اسلات) ... -->
      </return>
    </ns2:getDayWorkScheduleResponse>
  </soap:Body>
</soap:Envelope>
```

**نکات:**

1. **الگوی دقیقاً یکسان با تست ۲۰۲۶-۰۹-۰۱ قبلی** — همون توالیِ
   `scheduleCode` (۶۷ از ۱۰:۰۰ تا ۱۳:۴۵، بعد ۸۰ از ۱۴:۰۰ تا ۱۵:۴۵)، همون
   `timeSlotDurationMin: 15`. یعنی provider ۱۰۴ (Meisam Abdollahi) یه
   برنامه‌ی کاری ثابت/تکرارشونده داره، حداقل بین این دو روز تست.
2. یه نکته‌ی جانبی: تو همین پیام، مقادیر `soapSecurityId`/
   `soapSecurityTokenKey` هم داده شد ولی تو خودِ این curl استفاده نشدن
   (این درخواست فقط از WS-Security UsernameToken معمولی استفاده کرده،
   نه این دو تا) — احتمالاً از یه Postman environment/عملیات login جدا
   مونده؛ اگه مربوط به یه عملیات SOAP دیگه‌ست (مثلاً `LoginService`)،
   جدا مستندش می‌کنیم وقتی curl اون یکی رو فرستادی.

---

### دیکشنری کدهای نوع نوبت‌دهی — SOAP

- **سرویس/عملیات:** `ScheduleService.getScheduleTemplateCodes()`
  (بدون پارامتر)
- **کاربرد:** لوک‌آپ برای تبدیل `scheduleCode` عددی (که تو
  `getDayWorkSchedule` بالا می‌بینیم، مثلاً `67`/`80`) به توضیح
  انسانی‌خوان + رنگ + مدت‌زمان + این‌که اصلاً یه نوبتِ قابل‌رزرو-توسط-بیمارِ
  واقعیه یا کار داخلی/اداری پزشکه (Vacation, Meeting, Travel, ...).
- **وضعیت:** ✅ تأییدشده زنده (۲۰۲۶-۰۹-۲۵؛ اولین بار ۲۰۲۶-۰۹-۰۱ هم تست
  شده بود ولی فقط یه excerpt ۳تایی ثبت شده بود — این‌بار **لیست کامل
  ۲۵تایی** گرفته شد).
- از قبل هم مستند بوده: [`oscar-soap-schedule-services.md`](./oscar-soap-schedule-services.md#getScheduleTemplateCodes---scheduleTemplateCodeTransfer)
  (فقط excerpt) و **از قبل تو کد پیاده‌سازی شده**.

**Request:** همون envelope بالا، فقط با بدنه‌ی
`<ws:getScheduleTemplateCodes/>` (بدون پارامتر).

**🔑 کشف مهم (۲۰۲۶-۰۹-۲۵): این جدول کد عددی، و `status`ی که همه‌جای دیگه
(هم REST هم SOAP appointment) می‌بینیم، دو تا نمایش از یه مفهوم واحدن.**
یه سرویس REST جدا (`GET /schedule/codes` — نگاه کن entry بعدی) دقیقاً
همین ۲۳ ردیف رو، به همون ترتیب، برمی‌گردونه — ولی به‌جای کد عددی، یه
**کد تک‌حرفی/تک‌کاراکتری** می‌ده. چون ترتیب و تعداد دقیقاً یکیه، می‌شه
positional map کرد:

| description | کد عددی (SOAP `scheduleCode`) | کد حرفی (REST `schedule/codes` → `code`, همون appointment `status`) | duration | confirm | color |
|---|---|---|---|---|---|
| Academic | 65 | `A` | — | N | — |
| Behavioral Science | 66 | `B` | 15 | N | #BFEFFF |
| 30 Minute Appointment | 50 | `2` | 30 | N | #BFEFFF |
| 45 Minute Appointment | 51 | `3` | 45 | N | #BFEFFF |
| Monitoring | 77 | `M` | — | N | EED2EE |
| 60 Minute Appointment | 54 | `6` | 60 | N | #BFEFFF |
| Rounds | 82 | `R` | 15 | N | — |
| Study Leave | 69 | `E` | 15 | N | — |
| Vacation | 86 | `V` | 15 | N | FFF68F |
| PBSG Rounds | 71 | `G` | 15 | N | — |
| Hospital Rounds | 72 | `H` | 15 | N | — |
| Drug Rep (Chief) | 100 | `d` | 15 | N | — |
| Urgent | 85 | `U` | 15 | N | — |
| Administrative Work | 97 | `a` | 15 | N | #BFEFFF |
| **Travel** | 116 | **`t`** | — | N | — |
| Meeting | 109 | `m` | — | N | — |
| 15 Minute Appointment | 49 | `1` | 15 | N | #BFEFFF |
| Same Day | 115 | `s` | 15 | Day | FFF68F |
| Same Day - R1 | 83 | `S` | 30 | Day | FFF68F |
| Same Week | 87 | `W` | 15 | Wk | FFF68F |
| On Call Clinic | **67** | `C` | 15 | Onc | green |
| Phone Appointment | 80 | `P` | 15 | No | #BFEFFF |
| Clinic Appointment | **67** | `C` | 15 | No | — |

(`bookinglimit` همه‌جا `1` بود؛ `id` فقط تو نسخه‌ی SOAP بود، نگاه کن نکته‌ی ۲.)

**نکات مهم:**

1. **این لیست، این‌بار کامله (۲۳ تا)، نه فقط excerpt** — سند قبلی فقط ۳
   ردیف مرتبط رو نشون داده بود (خودش صریح گفته بود «فقط مرتبط‌ترین‌ها»).
   حالا یه مرجع کامل داریم برای هر کد ممکن.
2. **کد `67`/`C` یکتا نیست، دقیقاً همون‌جوری که قبلاً کشف شده بود** —
   هم «On Call Clinic» هم «Clinic Appointment» همین کد عددی (۶۷) و همین
   کد حرفی (`C`) رو دارن. یعنی از روی خودِ کد تنها نمی‌شه فهمید کدوم
   مقصوده، فقط می‌شه گفت «یه نوبت کلینیکی معمولی ۱۵ دقیقه‌ای، قابل رزرو».
   برای هدف اپ (نشون‌دادن اسلات آزاد به بیمار) کافیه.
3. **می‌شه اسلات‌های غیرقابل‌رزرو رو فیلتر کرد** — کدهایی مثل Vacation
   (۸۶/`V`)، Meeting (۱۰۹/`m`)، Travel (۱۱۶/`t`)، Study Leave (۶۹/`E`)،
   Administrative Work (۹۷/`a`) یعنی اون بازه‌ی زمانی کارِ داخلی/شخصیِ
   پزشکه، نه یه slot کلینیکی — این‌ها باید از «زمان‌های آزاد قابل‌رزرو»
   حذف بشن.
4. **جفتِ واقعی که تو `getDayWorkSchedule` provider ۱۰۴ دیدیم**:
   `67`/`C` (۱۰:۰۰ تا ۱۳:۴۵) = یه نوبت کلینیکی معمولی، `80`/`P` (۱۴:۰۰
   تا ۱۵:۴۵) = Phone Appointment. یعنی provider ۱۰۴ صبح حضوری، بعدازظهر
   تلفنی کار می‌کنه — دقیقاً همون سناریویی که صاحب پروژه قبلاً توضیح داده
   بود («هر پزشک حداقل ۲ نوع نوبت‌دهی متفاوت داره»).
5. **🔑 این جدول معمای `status: "t"` تو `getAppointment2` رو حل می‌کنه**
   (نگاه کن entry «خواندن یک نوبت مشخص» بالا) — `t` دقیقاً کد حرفیِ
   «Travel» تو همین جدوله. یعنی، طبق گفته‌ی صاحب پروژه، **این‌طور به‌نظر
   می‌رسه که `status` روی رکورد نوبت، همون کد نوع‌نوبت‌دهی (appointment
   type/template code) است، نه یه enum جداگانه‌ی «تأییدشده/لغوشده/...».**
   این یه فرض قوی و خوب‌شواهددار است، ولی صددرصد تأییدنشده — ارزش داره
   موقع پیاده‌سازیِ واقعیِ رزرو نوبت، مطمئن بشیم اپ همیشه یه کد معنادار
   (نه پیش‌فرض تصادفی مثل همین `t`/Travel که برای یه نوبت واقعیِ بیمار
   منطقی نیست) رو صریحاً برای `status`/نوع نوبت می‌فرسته.

   **✅ تأیید نهایی و یه باگ واقعی که همین فرض آشکارش کرد (۲۰۲۶-۰۹-۲۷):**
   بعد از این‌که `create()` رو به SOAP سوییچ کردیم، برای هر نوبتِ جدید
   `status: 'C'` فرستاده می‌شد (یه انتخاب عمدی، چون `'C'` = «Clinic
   Appointment»، یه کد معنادار به‌جای `t`/Travel). ولی کدِ اپ (`mapOscarAppointmentStatus`
   تو `oscar-mappers.ts`) از قبل، از یه سند طراحیِ اولیه، فرض کرده بود
   `code === 'c'` (بدون حساسیت به بزرگ/کوچیک) یعنی «لغوشده». نتیجه: هر
   نوبت جدیدی که با `'C'` ساخته می‌شد، تو لیست نوبت‌های بیمار به‌عنوان
   `status: "cancelled"` نشون داده می‌شد — تأییدشده زنده با
   `GET /api/v1/appointments?patientId=...` که چند تا نوبتِ کاملاً تازه و
   هیچ‌وقت لغونشده رو `cancelled` نشون داد. یعنی این فرض قدیمی (`'c'` =
   لغوشده) **غلط از آب دراومد** — `'c'`/`'C'` فقط یه کد نوع‌نوبته، نه
   نشونه‌ی لغو. `mapOscarAppointmentStatus` اصلاح شد (فعلاً همیشه
   `'scheduled'` برمی‌گردونه، چون هنوز هیچ کد تأییدشده‌ای برای «لغوشده»ی
   واقعی نداریم) — و مسیر نوشتنِ لغو (`toOscarStatusCode`/`updateStatus`)
   هم به‌عنوان «به احتمال زیاد خراب، نه فقط تست‌نشده» علامت‌گذاری شد،
   چون همون فرض اشتباه اونجا هم هست.

   **✅ به‌روزرسانی نهایی (بعد از تست کامل `updateAppointment` +
   `getAppointment2` پایین): این فرض قطعاً تأیید شد.** `status` دقیقاً
   همون کد نوع‌نوبت‌دهیِ همین جدوله (case-insensitive — OSCAR حروف
   کوچیک/بزرگ رو یکی می‌بینه). جزئیات کامل تست تو entry «ویرایش نوبت
   موجود» پایین.

---

### دیکشنری کدهای نوع نوبت‌دهی (نسخه‌ی حرفی) — REST

- **Endpoint:** `GET /schedule/codes`
- **کاربرد:** دقیقاً همون چیزی که `ScheduleService.getScheduleTemplateCodes`
  (SOAP، entry بالا) می‌ده، ولی با کد **تک‌حرفی** به‌جای عددی — همون کدی
  که تو فیلد `status` رکورد نوبت (هم REST هم SOAP) دیده می‌شه. این
  endpoint نه تو `OSCAR_ENDPOINTS_IN_USE.md` نه تو WADL دیده شده بود؛
  کاملاً جدید کشف شد.
- **وضعیت:** ✅ تأییدشده زنده (۲۰۲۶-۰۹-۲۵)

**Request:**
```
GET /schedule/codes
Accept: application/json
Authorization: OAuth ...
```

**Response نمونه (۳ ردیف اول از ۲۳ تا — لیست کامل تو جدول ترکیبیِ entry
قبلی هست):**
```json
[
    { "id": null, "code": "A", "description": "Academic", "duration": "", "color": null, "confirm": "N", "bookinglimit": 1 },
    { "id": null, "code": "B", "description": "Behavioral Science", "duration": "15", "color": "#BFEFFF", "confirm": "N", "bookinglimit": 1 },
    { "id": null, "code": "2", "description": "30 Minute Appointment", "duration": "30", "color": "#BFEFFF", "confirm": "N", "bookinglimit": 1 }
]
```

**نکات مهم:**

1. **`id` همیشه `null`ه** — برخلاف نسخه‌ی SOAP که `id` واقعی داشت
   (۱، ۲، ۳، ...)، اینجا `id` صراحتاً حذف/null شده. یعنی برای پیدا کردن
   شناسه‌ی عددیِ داخلیِ OSCAR (اگه لازم شد)، باید از نسخه‌ی SOAP استفاده
   کرد، نه این‌یکی.
2. **wrapper نداره** — برخلاف بقیه‌ی لیست‌های REST که دیدیم
   (`abstractSearchResponse` با `offset`/`limit`/`total`/`content`)، این
   یکی مستقیماً یه آرایه‌ی خام JSON‌ه، بدون هیچ wrapper ای.
3. برای جدول کامل و نگاشت عددی↔حرفی، نگاه کن entry «دیکشنری کدهای نوع
   نوبت‌دهی — SOAP» بالا.

---

### خواندن یک نوبت مشخص — SOAP

- **سرویس/عملیات:** `ScheduleService.getAppointment2(id: int, arg1: boolean)`
- **کاربرد:** خوندن اطلاعات یک نوبت مشخص با `id`. قبلاً تو
  [`oscar-soap-schedule-services.md`](./oscar-soap-schedule-services.md)
  فقط به‌عنوان «کشف‌شده، هنوز تست نشده» لیست شده بود (خط ۴۰) — این
  اولین تست زنده‌ش بود.
- **وضعیت:** ✅ تأییدشده زنده (۲۰۲۶-۰۹-۲۵)
- **⚠️ نکته:** معنی دقیق پارامتر دوم (`arg1`, اینجا `true` فرستاده شد)
  هنوز مشخص نیست — تو WSDL فقط `arg1: boolean` بدون توضیح بود. احتمال
  می‌ره چیزی شبیه «شامل نوبت‌های آرشیوشده/لغوشده هم بشه یا نه» باشه؛
  برای تأیید باید با `false` هم تست بشه و مقایسه بشه (هنوز انجام نشده).

**Request:**
```xml
<ws:getAppointment2>
  <arg0>13</arg0>
  <arg1>true</arg1>
</ws:getAppointment2>
```

**Response نمونه:**
```xml
<return>
    <appointmentEndDateTime>2026-09-21T12:14:59Z</appointmentEndDateTime>
    <appointmentStartDateTime>2026-09-21T12:00:00Z</appointmentStartDateTime>
    <createDateTime>2026-09-05T18:38:21Z</createDateTime>
    <creator>drfinder_api</creator>
    <demographicNo>3</demographicNo>
    <id>13</id>
    <notes></notes>
    <programId>0</programId>
    <providerNo>104</providerNo>
    <reason></reason>
    <status>t</status>
    <updateDateTime>2026-09-05T18:38:21Z</updateDateTime>
</return>
```

**نکات مهم:**

1. **`creator: "drfinder_api"` — تأیید غیرمستقیمِ خیلی مهم.** این
   یعنی این نوبت واقعاً توسط اپ خودمون (از طریق OAuth1 consumer که
   `drfinder_api` نامیده شده) ساخته شده — پس مسیر واقعیِ رزرو نوبت
   (`POST /schedule/add` که تو `OSCAR_ENDPOINTS_IN_USE.md` قبلاً «نوشتن»
   ثبت شده بود) واقعاً و درست کار می‌کنه و OSCAR درست ردش می‌کنه کی
   ساخته.
2. **پاسخ خیلی سبک‌تر از معادل REST‌شه** — فقط فیلدهای پایه (زمان
   شروع/پایان، `demographicNo`, `providerNo`, `status`, `notes`, `reason`,
   `creator`) — نه اسم بیمار، نه نوع نوبت، نه هیچ enrichment دیگه‌ای.
   برای نمایش تو UI باید جدا `demographicNo`/`providerNo` رو resolve
   کرد.
3. **✏️ `status: "t"` حل شد (بعداً، نگاه کن entry «دیکشنری کدهای نوع
   نوبت‌دهی») — `t` دقیقاً کد حرفیِ «Travel» تو جدول `schedule/codes`ه.**
   یعنی به‌نظر می‌رسه `status` روی نوبت، همون کد نوع‌نوبت‌دهی/template
   باشه، نه یه enum جدا برای «تأییدشده/لغوشده». چون این نوبت تستی
   احتمالاً بدون تعیین صریح نوع نوبت ساخته شده، به‌طور پیش‌فرض یه کد
   نامرتبط (`t`/Travel) گرفته — نه چیزی معنادار برای یه نوبت واقعی
   بیمار. جزئیات کامل و سطح اطمینان تو entry «دیکشنری کدهای نوع
   نوبت‌دهی — SOAP» نکته‌ی ۵.
4. **این می‌تونه جایگزین قابل‌اعتماد `schedule/{demographicNo}/appointmentHistory`
   (REST) باشه** — اون endpoint طبق `OSCAR_ENDPOINTS_IN_USE.md` یه باگ
   شناخته‌شده داره (همیشه ۵۰۰ می‌ده). اگه اپ از قبل `id` نوبت رو داره
   (مثلاً از پاسخ خودِ `POST /schedule/add`)، `getAppointment2` یه راه
   SOAP سالم برای خوندن دوباره‌ی همون نوبته.

---

### ثبت نوبت جدید — SOAP

- **سرویس/عملیات:** `ScheduleService.addAppointment(appointmentTransfer)`
- **کاربرد:** ساختن یه نوبت جدید. تو
  [`oscar-soap-schedule-services.md`](./oscar-soap-schedule-services.md)
  فقط به‌عنوان «کشف‌شده، هنوز تست نشده» لیست شده بود (خط ۴۰؛ و اونجا
  صریحاً تصمیم گرفته شده بود که رزرو از طریق REST `POST /schedule/add`
  انجام بشه، نه SOAP) — این اولین تست زنده‌ی این عملیات SOAP بود.
- **وضعیت:** ✅ تأییدشده زنده (۲۰۲۶-۰۹-۲۵) — **و از ۲۰۲۶-۰۹-۲۷ عملاً
  جایگزینِ REST `POST /schedule/add` تو کدِ اپ شد**، چون اون REST endpoint
  دقیقاً همون باگ «Access Denied» رو داد که `appointmentHistory` می‌داد
  (نگاه کن [`deferred-items.md`](./deferred-items.md) #۳؛ الگوی تکراری تو
  کلِ `AppointmentManager`، نه یه متد خاص). `OscarAppointmentRepository.create`
  حالا مستقیماً از همین عملیات استفاده می‌کنه.

**Request:**
```xml
<ws:addAppointment>
  <arg0>
    <demographicNo>15</demographicNo>
    <providerNo>104</providerNo>
    <appointmentStartDateTime>2026-09-22T13:15:00</appointmentStartDateTime>
    <appointmentEndDateTime>2026-09-22T13:30:00</appointmentEndDateTime>
    <reason></reason>
    <notes></notes>
    <status>t</status>
    <programId>0</programId>
  </arg0>
</ws:addAppointment>
```

**Response (موفق):**
```xml
<return>18</return>
```

**نکات مهم:**

1. **پاسخ فقط یه عدد خامه** — همون `id` نوبت تازه‌ساخته‌شده (اینجا `18`)،
   هیچ فیلد دیگه‌ای برنمی‌گرده. برای گرفتن جزئیات کامل نوبتِ تازه‌ساخته
   شده، باید جدا `getAppointment2(18, true)` (entry بالا) صدا زده بشه.
2. **⚠️ همون کد `status: "t"` (Travel) دوباره استفاده شد** — طبق نکته‌ی
   ۵ entry «دیکشنری کدهای نوع نوبت‌دهی»، این احتمالاً یه پیش‌فرض
   معنی‌دار نیست. بازه‌ی زمانیِ این نوبت (۱۳:۱۵ تا ۱۳:۳۰) دقیقاً ۱۵
   دقیقه‌ست — یعنی کد معناداری که باید فرستاده می‌شد، محتمل‌ترین گزینه
   `49`/`"1"` («15 Minute Appointment») یا `67`/`"C"` (یه نوبت کلینیکی
   عمومی) بود، نه `t`/Travel. **مهم: هروقت اپ واقعاً این عملیات رو
   پیاده کرد، باید صریحاً یه کد نوع‌نوبت معنادار انتخاب/تنظیم بشه، نه
   این مقدار placeholder.**
3. **الان دو مسیر مستقل برای ثبت نوبت تأیید شده داریم** — REST
   `POST /schedule/add` (قبلاً، طبق `OSCAR_ENDPOINTS_IN_USE.md`) و این
   SOAP `addAppointment`. طبق تصمیم قبلیِ صاحب پروژه، مسیر REST برای
   پیاده‌سازی نهایی انتخاب شده؛ این یکی صرفاً برای کامل‌بودنِ کاتالوگ
   و مقایسه ثبت شد.

---

### ویرایش نوبت موجود — SOAP

- **سرویس/عملیات:** `ScheduleService.updateAppointment(appointmentTransfer)`
- **کاربرد:** ویرایش یه نوبت موجود (زمان، وضعیت، ...) بر اساس `id`.
- **وضعیت:** ✅ تأییدشده زنده (۲۰۲۶-۰۹-۲۵) — روی نوبت `id: 18` که با
  `addAppointment` بالا ساخته شده بود.

**Request:**
```xml
<ws:updateAppointment>
  <arg0>
    <id>18</id>
    <demographicNo>15</demographicNo>
    <providerNo>104</providerNo>
    <appointmentStartDateTime>2026-09-22T13:00:00</appointmentStartDateTime>
    <appointmentEndDateTime>2026-09-22T13:15:00</appointmentEndDateTime>
    <status>c</status>
    <programId>0</programId>
  </arg0>
</ws:updateAppointment>
```

**Response (موفق):**
```xml
<ns2:updateAppointmentResponse xmlns:ns2="http://ws.oscarehr.org/"/>
```
(بدنه‌ی پاسخ کاملاً خالیه — نه خطا، نه هیچ فیلدی. فقط `200`/envelope
خالی یعنی موفق.)

**نکات مهم:**

1. **پاسخ هیچ تأییدی از مقادیر جدید نمی‌ده** — برخلاف `PUT /demographics`
   (REST) که رکورد کامل آپدیت‌شده رو برمی‌گردوند، این‌جا هیچی برنمی‌گرده.
   برای مطمئن‌شدن از این‌که واقعاً چی ذخیره شد، باید حتماً جدا
   `getAppointment2(18, true)` صدا زده بشه — هنوز این تأیید نهایی گرفته
   نشده.
2. **🔑 `status` از `t` به `c` (حرف کوچیک) تغییر کرد — سؤالی که این
   باز کرد، با تست بعدی قطعی حل شد (نگاه کن نکته‌ی ۳).**

**✅ تأیید نهایی (تست دوم، همون روز):** صاحب پروژه بعداً همین نوبت
(`id: 18`) رو دوباره با `status: "C"` (این‌بار حرف بزرگ) آپدیت کرد و
بلافاصله `getAppointment2(18, true)` رو صدا زد. پاسخ:
```xml
<return>
    <appointmentEndDateTime>2026-09-22T13:14:59Z</appointmentEndDateTime>
    <appointmentStartDateTime>2026-09-22T13:00:00Z</appointmentStartDateTime>
    <createDateTime>2026-09-25T15:04:01Z</createDateTime>
    <creator>drfinder_api</creator>
    <demographicNo>15</demographicNo>
    <id>18</id>
    <programId>0</programId>
    <providerNo>104</providerNo>
    <status>C</status>
    <updateDateTime>2026-09-25T15:12:15Z</updateDateTime>
</return>
```

3. **🔑 نتیجه‌ی قطعی: `status` واقعاً همون کد نوع‌نوبت‌دهیه، و OSCAR
   حروف کوچیک/بزرگ رو یکی می‌بینه.** طبق تأیید صاحب پروژه («برای اپ هر
   دو رو یکی می‌بینه»)، تست اول (`c` کوچیک) هم واقعاً به همون معنیِ
   «On Call Clinic»/«Clinic Appointment» (`C`) ذخیره شده بود؛ فقط برای
   یکدستی، بار دوم با حرف بزرگ دوباره آپدیت شد. یعنی فرضیه‌ی اصلیِ
   entry «دیکشنری کدهای نوع نوبت‌دهی» (نکته‌ی ۵) **قطعاً تأیید شد**: کد
   `status` روی نوبت، دقیقاً همون کد نوع‌نوبت‌دهی از جدول `schedule/codes`
   است (case-insensitive)، نه یه enum حالت جدا.
4. **🔑 کشف مهم دیگه: `updateAppointment` یه overwrite کامله، نه
   patch جزئی.** تو request بالا، فیلدهای `notes`/`reason` اصلاً
   فرستاده نشدن (نه این‌که خالی باشن، کلاً غایب بودن). قبل از این آپدیت
   (موقع create)، این فیلدها صریحاً `""` (رشته‌ی خالی) بودن و تو GET قبلی
   به‌صورت `<notes></notes><reason></reason>` دیده می‌شدن. **بعد از این
   آپدیت، این دو فیلد اصلاً تو پاسخِ `GET` بالا نیستن** (نه حتی خالی) —
   طبق الگوی شناخته‌شده‌ی این پروژه (فیلد null از XML حذف می‌شه، نه فیلد
   `""`)، یعنی این دو فیلد به `null` تبدیل شدن. **نتیجه‌ی عملی مهم: اگه
   اپ بخواد فقط یه فیلد (مثلاً فقط `status`) رو آپدیت کنه، باید همیشه
   کل شیء `appointmentTransfer` رو (با تمام فیلدهای فعلیِ درست، گرفته‌شده
   از یه `GET` قبلی) بفرسته — وگرنه فیلدهایی که نفرستاده پاک می‌شن.**
   این دقیقاً شبیه رفتاریه که برای `PUT /demographics` (REST) هم دیدیم.

---

### لیست نوبت‌های یک بیمار — SOAP (جایگزین REST خراب)

- **سرویس/عملیات:** `ScheduleService.getAppointmentsForPatient2(demographicNo, offset, limit, includeArchived)`
- **کاربرد:** لیست همه‌ی نوبت‌های یک بیمار مشخص. **جایگزین مستقیمِ**
  REST `POST /schedule/{demographicNo}/appointmentHistory` که یه باگ
  دائمی و رفع‌نشدنی سمت سرور OSCAR داره (همیشه `500 Access Denied` از
  `AppointmentManager.getAppointmentHistoryWithoutDeleted` — نگاه کن
  [`deferred-items.md`](./deferred-items.md) #۳). این باگ سمت کدِ خودِ
  OSCARه، نه چیزی که با تغییر request حل بشه — پس این SOAP عملیات
  جایگزین دائمیه، نه یه workaround موقت.
- **وضعیت:** ✅ تأییدشده زنده (۲۰۲۶-۰۹-۲۶/۲۷) — و **پیاده‌سازی و
  جایگزین شد** تو `OscarAppointmentRepository.findAll({patientId})`.

**Request:**
```xml
<ws:getAppointmentsForPatient2>
  <arg0>18</arg0>
  <arg1>0</arg1>
  <arg2>20</arg2>
  <arg3>true</arg3>
</ws:getAppointmentsForPatient2>
```

**Response نمونه:**
```xml
<return>
    <appointmentEndDateTime>2026-10-01T11:44:00Z</appointmentEndDateTime>
    <appointmentStartDateTime>2026-10-01T11:30:00Z</appointmentStartDateTime>
    <createDateTime>2026-09-26T21:09:37Z</createDateTime>
    <creator>101</creator>
    <demographicNo>18</demographicNo>
    <id>19</id>
    <location></location>
    <name>RIVERA, JANE</name>
    <notes></notes>
    <programId>0</programId>
    <providerNo>104</providerNo>
    <reason>Appointment</reason>
    <remarks></remarks>
    <resources></resources>
    <status>t</status>
    <type></type>
    <updateDateTime>2026-09-26T21:09:37Z</updateDateTime>
    <urgency></urgency>
</return>
```

**نکات مهم:**

1. **شکل داده غنی‌تر از `getAppointment2` تکی‌ست** — این‌جا `name`
   (اسم کامل بیمار، برای نمایش مستقیم تو UI)، `location`, `remarks`,
   `resources`, `type`, `urgency` هم هست — فیلدهایی که تو `getAppointment2`
   نبودن.
2. **پارامتر چهارم (`includeArchived`؟) هنوز دقیقاً تأیید نشده** — دقیقاً
   همون ابهامِ پارامتر دومِ `getAppointment2`. فعلاً `true` می‌فرستیم.
3. این پیدا شدن دقیقاً همون لحظه‌ای اتفاق افتاد که برای اولین بار کدِ
   واقعیِ اپ (نه curl دستی) این بخش رو زنده تست کرد و به باگ REST خورد —
   یه نمونه‌ی خوب از این‌که تست end-to-end واقعی، مشکلاتی رو پیدا می‌کنه
   که تست‌های تکی‌ی سرویس‌ها (حتی وقتی همه‌شون جدا موفق بودن) نشون نمی‌دن.

---

### نوبت‌های یک پزشک در یک روز مشخص — SOAP (جایگزین REST خراب سوم)

- **سرویس/عملیات:** `ScheduleService.getAppointmentsForProvider2(providerNo, date, includeArchived)`
- **کاربرد:** لیست نوبت‌های واقعاً رزروشده‌ی یک پزشک در یک روز مشخص —
  برای کم‌کردن از الگوی کاری کلی (`getDayWorkSchedule`) تا اسلات‌های
  واقعاً آزاد مشخص بشن. **جایگزین مستقیمِ** REST
  `GET /schedule/{providerNo}/day/{date}` که همون باگ خانواده‌ی
  `deferred-items.md` #۳ رو داره — این‌بار خطا از `checkPrivilege` روی
  `_demographic` میاد، چون این REST endpoint داخلش برای فرمت‌کردنِ اسم
  نمایشیِ بیمار، `DemographicManager.getDemographic` رو صدا می‌زنه (که
  خودش یه چک مجوز جدا داره)؛ SOAP اسم بیمار رو مستقیم تو پاسخ می‌ده،
  بدون این mesh مجوز.
- **وضعیت:** ⚠️ **غیرقابل‌اعتماد (۲۰۲۶-۰۹-۲۹)** — قبلاً (۲۰۲۶-۰۹-۲۷) تأیید
  و تو `OscarAppointmentRepository.findAll({doctorId, date})` استفاده شده
  بود، ولی تست زنده‌ی بعدی نشون داد برای یه روز نوبت رو برمی‌گردونه و برای
  یه روز دیگه که واقعاً نوبت داره، هیچی برنمی‌گردونه. نتیجه: اسلات‌های
  رزروشده دوباره تو فرانت آزاد نشون داده می‌شدن. **از کد حذف شد و با REST
  `GET /schedule/fetchDays/...` جایگزین شد** (entry بعدی). تابع
  `getAppointmentsForProvider` فقط برای مرجع نگه داشته شده. علتش هنوز
  مشخص نیست (شاید به معنی واقعیِ پارامتر boolean سوم ربط داشته باشه که
  هنوز تأیید نشده).
- **⚠️ توجه مهم:** این فقط نوبت‌های *رزروشده* رو می‌ده، نه الگوی کاریِ
  کلی — باید همیشه کنار `getDayWorkSchedule` استفاده بشه (یکی «چه
  ساعتی کار می‌کنه»، اون یکی «کدوم ساعت‌ها الان پره»)، دقیقاً همون
  ترکیبی که `availability.ts` از قبل هم استفاده می‌کرد.

**Request:**
```xml
<ws:getAppointmentsForProvider2>
  <arg0>104</arg0>
  <arg1>2026-10-01</arg1>
  <arg2>true</arg2>
</ws:getAppointmentsForProvider2>
```

**Response نمونه (همون شکل غنیِ `appointmentTransfer2` — با `name`):**
```xml
<return>
    <appointmentEndDateTime>2026-10-01T11:44:00Z</appointmentEndDateTime>
    <appointmentStartDateTime>2026-10-01T11:30:00Z</appointmentStartDateTime>
    <demographicNo>18</demographicNo>
    <id>19</id>
    <name>RIVERA, JANE</name>
    <providerNo>104</providerNo>
    <reason>Appointment</reason>
    <status>t</status>
</return>
```

**نکات مهم:**

1. **همون شکل داده‌ی `getAppointmentsForPatient2`** — همون
   `parseSoapAppointmentRow`ی که قبلاً نوشتیم، بدون تغییر، این‌جا هم
   کار می‌کنه (فقط query متفاوته: بر اساس provider+date، نه demographicNo).
2. این سومین موردیه که همون الگوی «REST داخلش یه چک مجوز/Access-Denied
   جدا داره که SOAP نداره» تکرار شد
   (`appointmentHistory`, `addAppointment`, حالا `getAppointmentsForDay`)
   — تقریباً مطمئنیم کل خانواده‌ی endpoint های REST مربوط به
   `AppointmentManager`/`ScheduleService` (REST) روی این نصب OSCAR با
   این مشکل مواجه‌ان، درحالی‌که معادل‌های SOAP همیشه کار کردن.

---

### نوبت‌های یک یا چند پزشک در یک بازه‌ی روزها — REST (جایگزین `getAppointmentsForProvider2`)

- **Endpoint:** `GET /schedule/fetchDays/{sDate}/{eDate}/{providers}`
- **کاربرد:** لیست نوبت‌های رزروشده‌ی پزشک(ها) بین دو تاریخ. برای یک روز
  مشخص، `sDate` و `eDate` یکی فرستاده می‌شن. پارامتر `providers` تو WADL
  به‌صورت جمع اومده (احتمالاً چند providerNo رو قبول می‌کنه، ولی تست نشده).
- **وضعیت:** ✅ تأییدشده زنده (۲۰۲۶-۰۹-۲۹) — برای هر دو روزی که
  `getAppointmentsForProvider2` یکی‌شون رو خالی برمی‌گردوند، درست جواب داد.
  **پیاده‌سازی شد** تو `OscarAppointmentRepository.findAll({doctorId, date})`
  (mapper: `oscarFetchDaysApptToDomain`). برخلاف بقیه‌ی REST‌های
  `AppointmentManager`، این یکی به باگ «Access Denied» (deferred-items.md #۳)
  نخورد. حالت بازه‌ی چندروزه فعلاً سناریوی استفاده نداره.

**Request:**
```
GET /schedule/fetchDays/2026-10-05/2026-10-05/104
Accept: application/json
Authorization: OAuth ...
```

**Response:**
```json
{
    "offset": 0,
    "limit": 0,
    "total": 0,
    "timestamp": 1790665324002,
    "content": [
        {
            "appointmentNo": 24,
            "providerNo": "104",
            "appointmentDate": "2026-10-05",
            "startTime": "10:00:00",
            "demographicNo": 20,
            "notes": "",
            "location": null,
            "resources": null,
            "status": "C",
            "lastName": "AKBARI",
            "firstName": "HESAM",
            "phone": "+989115994925",
            "phone2": null,
            "email": "hesamakbari.rk@gmail.com",
            "demoCell": null,
            "reminderPreference": null,
            "hPhoneExt": null,
            "wPhoneExt": null
        }
    ],
    "query": null
}
```

**نکات مهم:**

1. **wrapper صفحه‌بندی داره ولی `offset`/`limit`/`total` همه صفرن**، حتی
   وقتی `content` پره. پس به `total` نباید تکیه کرد، فقط `content` رو بخون.
2. **`startTime` بدون timezone‌ه** (`HH:mm:ss`) و `appointmentDate` جداست.
   تو mapper با پسوند صریح `Z` ترکیب می‌شن (`2026-10-05T10:00:00.000Z`) تا
   با `date` اسلات‌های `getDayWorkSchedule` (که `...T10:00:00Z` هستن) قابل
   مقایسه باشن. این نوبتِ ساعت ۱۰:۰۰ دقیقاً روی اسلات ۱۰:۰۰ افتاد، پس
   هر دو تو یه فضای زمانی هستن.
3. **هیچ فیلد زمان پایان/مدت نداره.** فعلاً mapper مدت رو ۱۵ دقیقه فرض
   می‌کنه (مدت هر دو کدی که اپ رزرو می‌کنه: `67`/`C` و `80`/`P`).
4. **🔑 کشف جانبی: کد عددیِ SOAP دقیقاً کد ASCII کد حرفیه.** `C` = ۶۷،
   `P` = ۸۰، `t` = ۱۱۶، `1` = ۴۹ و... هر ۲۳ ردیف جدول «دیکشنری کدهای نوع
   نوبت‌دهی» بالا با `status.charCodeAt(0)` جور درمیان. یعنی اگه لازم شد مدت
   واقعیِ یه نوبت از `status` دربیاد، می‌شه `status.charCodeAt(0)` رو تو
   `getScheduleTemplateCodes` پیدا کرد و `duration` رو خوند. هنوز تو کد
   استفاده نشده.
5. اطلاعات تماس بیمار (`phone`, `email`) هم مستقیم تو پاسخ هست. برای
   محاسبه‌ی اسلات آزاد لازم نیست و map نمی‌شه.

---

## جمع‌بندی نهایی

وضعیت فعلی (۲۰۲۶-۰۹-۲۵) هر کدوم از ۴ بخش خواسته‌شده، بر اساس بررسی کد
فعلی اپ (نه فقط سرویس‌های OSCAR):

### پزشک (Doctor)
| route داخلی | وضعیت | سرویس OSCAR |
|---|---|---|
| `GET /api/v1/doctors[/{id}]` | 🟡 فقط از جدول `Doctor` (Postgres) می‌خونه، تماس زنده با OSCAR نداره | — |
| `scripts/sync-doctors.ts` (job دوره‌ای، جدا از request path) | ✅ جدول `Doctor` رو پر می‌کنه | `GET /providerService/providers_json` (این کاتالوگ) + `GET /providerService/provider/{id}` |

**کاری که این کاتالوگ اضافه کرد:** تأیید کرد `providers_json` شامل
provider های غیر-پزشک (`-1`, `999998`) هم می‌شه — باید چک بشه
`sync-doctors.ts` این‌ها رو فیلتر می‌کنه یا نه.

### بیمار (Patient)
| route داخلی | وضعیت | سرویس OSCAR |
|---|---|---|
| `GET /api/v1/patients` | 🟡 فقط Postgres، بدون OSCAR | — |
| `POST /api/v1/patients/link-clinic` | ✅ زنده | `POST /demographics/matchDemographic` |
| *(هیچ route ای برای create/update/delete بیمار در OSCAR وجود نداره)* | ❌ پیاده نشده | `POST`/`PUT`/`DELETE /demographics` (همه‌شون الان تو این کاتالوگ تأییدشده‌ی زنده‌ان) |

**کاری که این کاتالوگ اضافه کرد:** هر ۴ عملیات CRUD روی Demographic
(create/read/update/soft-delete) الان تأییدشده‌ی زنده‌ان با نمونه‌ی
واقعی — قبلاً حتی «هیچ‌وقت پیاده نشد» ثبت شده بودن. اگه قراره اپ
create/update/delete بیمار رو مستقیم پیاده کنه (نه فقط match)، پایه‌ی
لازم آماده‌ست — فقط باید تصمیم گرفت کدوم فیلدها واقعاً لازمن (نکته‌ی ۶
سرویس create رو نگاه کن، هنوز باز مونده).

### نوبت (Appointment)
| route داخلی | وضعیت فعلی کد | سرویس OSCAR که این کاتالوگ تأیید کرد |
|---|---|---|
| `GET/POST /api/v1/appointments` | 🟡 پیاده‌شده، اکثراً تست زنده نشده (به‌جز history که باگ ۵۰۰ داره) | REST: `schedule/add`, `schedule/fetchProviderAppts`, `schedule/{providerNo}/day/{date}` |
| `GET /api/v1/appointments/{id}` | ✅ پیاده شد (۲۰۲۶-۰۹-۲۵) — `OscarAppointmentRepository.findById` حالا `getAppointment2` رو صدا می‌زنه؛ هنوز end-to-end زنده تست نشده | SOAP `getAppointment2` |
| `POST /api/v1/appointments/{id}/cancel` | 🟡 پیاده‌شده، تست زنده نشده | REST `schedule/appointment/{id}/updateStatus` |
| *(هیچ‌کدوم از SOAP add/update/get استفاده نمی‌شن)* | — | SOAP `addAppointment`/`updateAppointment`/`getAppointment2` همه تأییدشده‌ی زنده، ولی کد فعلی از REST استفاده می‌کنه |

**کاری که این کاتالوگ اضافه کرد:** یه مسیر SOAP کامل و تأییدشده
(add/update/get) به‌عنوان جایگزین برای بخش‌های خراب/تست‌نشده‌ی REST پیدا
شد — به‌خصوص `getAppointment2` می‌تونه فوراً `GET /api/v1/appointments/{id}`
مسدود رو باز کنه. کشف مهم‌تر: **`updateAppointment` (SOAP) overwrite
کامله، نه patch** — هر پیاده‌سازی‌ای (REST یا SOAP) باید این رو در نظر
بگیره.

### وقت‌های آزاد (Availability)
| route داخلی | وضعیت | سرویس OSCAR |
|---|---|---|
| `GET /api/v1/doctors/{id}/availability` | ✅ **از قبل زنده و پیاده‌سازی‌شده** (`apps/web/src/lib/doctors/availability.ts`) | SOAP `getDayWorkSchedule` + `getScheduleTemplateCodes` (ترکیب‌شده با REST `schedule/fetchDays/{date}/{date}/{providerNo}` برای کم‌کردن نوبت‌های رزروشده — از ۲۰۲۶-۰۹-۲۹؛ قبلش `schedule/{providerNo}/day/{date}` و بعد SOAP `getAppointmentsForProvider2` بود که هر دو خراب بودن) |

**کاری که این کاتالوگ اضافه کرد:** لیست کامل و به‌روز کدهای
`getScheduleTemplateCodes`/`schedule/codes` (۲۳ ردیف، نه فقط excerpt
قبلی) + نگاشت عددی↔حرفی — این می‌تونه فیلتر «کدوم کدها واقعاً قابل‌رزرو
توسط بیمارن» رو دقیق‌تر کنه. یه یادداشتِ قدیمیِ نادرست در
`OSCAR_ENDPOINTS_IN_USE.md` (که می‌گفت SOAP «هنوز به کد وصل نشده») هم
در همین بررسی اصلاح شد.

### جمع‌بندی کلی
سه بخش از چهار (بیمار، نوبت، وقت‌های آزاد) الان یا کامل پیاده‌ست، یا
همه‌ی سرویس‌های OSCAR لازمش تأییدشده‌ی زنده‌ست و فقط کار سیم‌کشیِ اپ
مونده. بخش پزشک همچنان یه لایه‌ی sync دوره‌ای (نه real-time) داره —
اگه نیاز به real-time شد، `providers_json` خودش تأییدشده‌ی زنده‌ست و
مستقیم هم قابل‌استفاده‌ست.
