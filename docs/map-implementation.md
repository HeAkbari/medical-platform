# طراحی نقشه — Canadian Health Services

| | |
| --- | --- |
| **نسخه** | 1.1 |
| **وضعیت** | BC-only · EN-first · **Mock data MVP** · In-app booking |
| **دامنه** | نقشه خدمات سلامت با تمرکز بر **دسترسی مستقیم** در کانادا |
| **خارج از scope** | جزئیات پیاده‌سازی فنی، انتخاب vendor داده، قراردادهای API |

---

## ۱. خلاصه

نقشه در Canadian Health Services باید به کاربر کمک کند **خدمات سلامتی نزدیک خود را پیدا کند و بلافاصله اقدام کند** — بدون اینکه فکر کند می‌تواند از هر نقطه روی نقشه نوبت specialist بگیرد یا جایگزین اورژانس ۹۱۱ شود.

با توجه به ساختار **Medicare عمومیِ استانی/قلمرویی** در کانada:

- بیمه hospital و physician services در سطح استان/قلمرو مدیریت می‌شود (OHIP، MSP، RAMQ، AHCIP و …).
- **پزشک عمومی (GP / Family Doctor)** معمولاً درب اول سیستم است؛ پذیرش بیمار جدید محدود است.
- **اکثر specialistها** بدون **ارجاع (referral)** از GP قابل دسترسی نیستند.
- برخی خدمات **بدون ارجاع** قابل رزرو یا مراجعه هستند؛ نقشه باید عمدتاً روی این‌ها متمرکز باشد.

**قاعده طلایی نقشه:** اگر کاربر نمی‌تواند **بدون ارجاع** و با **انتظار واقع‌بینانه** (مراجعه، تماس، رزرو، یا مسیریابی) از آن نقطه استفاده کند، آن را روی نقشه نشان ندهید — یا آن را در بخش اطلاعاتی جدا (بدون CTA رزرو) قرار دهید.

### ۱.۱ استراتژی داده — MVP فعلی vs آینده

| لایه | MVP (الان) | فاز بعد (داده واقعی) |
| --- | --- | --- |
| **منبع** | **Mock data** در repo (JSON/seed) — سناریوهای BC واقع‌گرایانه | Feed/API از partnerها و منابع رسمی BC |
| **پوشش جغرافیایی** | Greater Victoria / Vancouver Island (مختصات mock) | کل BC |
| **Wait time** | اعداد mock با `updatedAt` ساختگی | HealthLink BC یا partner feeds |
| **GP accepting patients** | ✅ روی نقشه با **mock** | داده تأمین‌شده توسط partner |
| **رزرو** | **In-app booking** (drawer/form داخل اپ) | همان UX؛ backend به API partner |
| **Disclaimer UI** | «Sample data for demo» در dev/staging اختیاری؛ production تا زمان go-live واقعی | حذف badge demo |

> **تصمیم محصول:** تمام سرویس‌ها و داده‌های واقعی **قرار است بعداً از طرف شما/partnerها** داده شود. MVP باید **شکل نهایی UX** و **قرارداد داده (schema)** را ثابت کند، نه وابستگی به API خارجی.

---

## ۲. زمینه نظام سلامت کانada (برای طراحی محصول)

### ۲.۱ Medicare استانی — چه چیزی «رایگان» است؟

| حوزه | معمولاً تحت پوشش عمومی | معمولاً خارج از پوشش / پرداخت مستقیم |
| --- | --- | --- |
| ویزیت GP در مطب / clinic | ✅ (با card بیمه معتبر استان) | — |
| ER بیمارستان برای موارد اورژانسی | ✅ | — |
| بستری بیمارستان | ✅ | — |
| Specialist (قلب، پوست، …) | ✅ **اگر** با ارجاع و در سیستم استان | بدون ارجاع معمولاً ❌ |
| دارو (Pharmacy) | ❌ (به‌جز برنامه‌های کمکی/Provincial drug plans) | اکثراً out-of-pocket یا private insurance |
| دندانپزشکی | ❌ (جز برنامه‌های محدود کودک/سالمند در بعضی استان‌ها) | پرداخت مستقیم |
| Physio، Chiro، Massage، Optometry (بخشی) | ⚠️ بسته به استان و سقف سالانه | часто co-pay یا پوشش محدود |
| روانشناسی / مشاوره | ⚠️ فزاینده در استان‌ها؛ پوشش متفاوت | часто private pay یا employer plan |
| آزمایشگاه | ✅ اگر با requisition معتبر | بدون نسخه معمولاً ❌ |

**نتیجه برای نقشه:** برچسب **«تحت پوشش بیمه استانی»** باید **نوع پوشش** را دقیق بیان کند، نه فقط «رایگان».

### ۲.۲ ارجاع (Referral) — چه زمانی لازم است؟

| نوع خدمت | ارجاع GP معمولاً لازم است؟ | قابل نمایش روی نقشه؟ |
| --- | --- | --- |
| Walk-in Clinic | ❌ | ✅ |
| Urgent Care | ❌ | ✅ |
| ER | ❌ (اورژانس) | ✅ (با disclaimer) |
| Pharmacy | ❌ | ✅ |
| GP / Family Doctor (پذیرش بیمار) | ❌ برای مراجعه؛ ⚠️ برای attach شدن به roster | ⚠️ فقط با وضعیت «پذیرش بیمار» |
| Specialist پزشکی | ✅ در اکثر موارد | ❌ روی نقشه |
| Physio، Chiro، RMT، Acupuncture | ❌ (رزرو مستقیم) | ✅ |
| Psychology / Counselling | ❌ (رزرو مستقیم؛ پوشش جدا) | ✅ |
| Dietitian | ❌ در بسیاری موارد | ✅ |
| Podiatry | ❌ / ⚠️ استان‌محور | ✅ با برچسب استان |
| Dentistry | ❌ | ✅ (پرداخت مستقیم) |
| Imaging / Lab | ✅ (requisition) | ❌ به‌عنوان «مراجعه مستقیم» |

### ۲.۳ تفاوت استانی (نمونه — برای برچسب و copy)

پوشش و دسترسی direct-access **یکسان نیست**. محصول باید **استان/قلمرو کاربر** (یا انتخاب دستی) را در نظر بگیرد:

| موضوع | BC | ON | QC | AB | یادداشت طراحی |
| --- | --- | --- | --- | --- | --- |
| Physio تحت MSP/OHIP | سقف سالانه در BC | OHIP محدود/در حال تغییر | RAMQ متفاوت | AHCIP متفاوت | برچسب «پوشش استانی — سقف دارد» |
| Psychology publicly funded | محدود | برنامه‌های در حال گسترش | متفاوت | متفاوت | «بررسی eligibility در استان شما» |
| Podiatry | پوشش محدود | متفاوت | متفاوت | متفاوت | فیلتر استان یا مخفی تا تأیید |
| Pharmacy prescribing (minor ailments) | ✅ در استان‌های فعال | ✅ | متفاوت | ✅ | CTA «مشاوره دارویی» |

> **الزام محصول:** هر ادعای پوشش بیمه‌ای روی نقشه باید **استان‌محور** باشد یا با disclaimer «وضعیت پوشش را با بیمه استانی خود تأیید کنید».

---

## ۳. اصول طراحی نقشه

### ۳.۱ سه اصل اصلی (از نسخه اول — تقویت‌شده)

1. **بدون گمراه‌کردن (No false affordance)**  
   Marker روی نقشه = کاربر **می‌تواند همین حالا** تماس بگیرد، مسیر بگیرد، یا (در صورت پشتیبانی) رزرو کند.  
   Specialist با ارجاع، lab بدون نسخه، یا بیمارستان غیر-ER **نباید** با همان UX «رزرو نوبت» نمایش داده شوند.

2. **شفافیت هزینه و دسترسی (Coverage transparency)**  
   هر نقطه حداقل یکی از برچسب‌های بخش ۵ را دارد. متن کوتاه زیر عنوان: «چرا این روی نقشه است».

3. **اقدام فوری یا برنامه‌ریزی ساده (Actionable)**  
   حداقل یک action روشن: **تماس · مسیریابی · رزرو · ساعت کاری**. برای ER فقط مسیریابی + wait time + disclaimer اورژانس.

### ۳.۲ اصول تکمیلی

4. **سلامت قبل از conversion** — نقشه جایگزین تشخیص، ۹۱۱، یا ۸۱۱/health line نیست.  
5. **استان‌محور بودن (Provincial context)** — پوشش و قوانین direct billing متفاوت است.  
6. **زبان (Official languages)** — UI انگلیسی/فرانسوی؛ نام مراکز طبق منبع داده.  
7. **حریم خصوصی (PIPEDA)** — موقعیت کاربر فقط با رضایت؛ ذخیره حداقلی.  
8. **دسترس‌پذیری** — فیلترها و popupها با screen reader و contrast مناسب.

---

## ۴. محدودیت‌ها، disclaimerها و الزامات حقوقی/پزشکی

### ۴.۱ آنچه نقشه **نیست**

- تشخیص‌دهنده پزشکی یا triage رسمی
- جایگزین **۹۱۱** برای stroke، chest pain، تنگی نفس شدید، خونریزی شدید، بی‌هوشی
- تضمین پذیرش، زمان انتظار دقیق (مگر منبع رسمی wait time)، یا پوشش بیمه فرد

### ۴.۲ Copy پیشنهادی (نمایش در UI)

**بالای نقشه (یک خط):**  
«For life-threatening emergencies, call 911. This map shows care you can access directly without a specialist referral.»

**روی ER / Urgent / Walk-in:**  
«Wait times are estimates. Severe symptoms may need 911.»

**روی خدمات با پوشش استانی:**  
«Provincial coverage varies. Bring your health card. Confirm fees before your visit.»

**روی پرداخت مستقیم (دندان، massage، …):**  
«Typically not covered by provincial health insurance.»

### ۴.۳ محتوای ممنوع روی نقشه

- ادعای «بدون نیاز به بیمه» برای خدمات پوشش‌داده‌شده استانی
- نمایش specialist با دکمه «Book now» بدون ارجاع
- ranking پزشکان بدون شفافیت منبع و بدون رعایت استاندارد تبلیغات سلامت استان
- فروش یا تبلیغ دارو بدون مجوز مربوط

---

## ۵. برچسب‌های پوشش و پرداخت (Coverage badges)

| برچسب (EN) | معنی | کاربرد |
| --- | --- | --- |
| **Provincially insured visit** | ویزیت با card استان معمولاً covered | Walk-in، GP visit |
| **May require co-pay / annual limit** | پوشش با سقف یا سهم بیمار | Physio، Chiro در BC و … |
| **Direct pay** | پرداخت مستقیم | Dentistry، بسیاری از RMT |
| **Private insurance accepted** | بیمه تکمیلی | Pharmacy، dental، counselling |
| **Accepting new patients** | GP roster باز | فقط وقتی تأیید شده |
| **Not accepting new patients** | فقط بیماران فعلی | GP — یا اصلاً نشان ندهید |
| **Open now** | ساعت کاری فعلی | همه دسته‌های با ساعت |
| **24 hours** | شبانه‌روزی | Pharmacy، بعضی ER |
| **Wait time (estimate)** | تخمین انتظار | ER، Urgent Care، بعضی Walk-in |
| **Referral not required** | دسترسی مستقیم | Direct-access specialists |
| **Province-specific** | قوانین استان را ببینید | Podiatry، psychology |

---

## ۶. Taxonomy — چه چیزهایی روی نقشه باشد

### ۶.۱ سطح ۱ — Super-categories (نوار فیلتر بالا)

```text
[ All ]  [ Urgent & walk-in ]  [ Pharmacy ]  [ Primary care ]  [ Therapy & rehab ]  [ Mental health ]  [ Dental & other ]
```

**تعریف «Urgent & walk-in» (رفع ابهام نسخه قبلی):**  
شامل **Walk-in Clinic · Urgent Care Centre · ER** — با زیربرچسب در detail sheet، نه یک entity مبهم.

### ۶.۲ سطح ۲ — دسته‌های مجاز (با جزئیات)

#### A. خدمات فوری و سرپایی

| دسته | کاربر چه می‌کند | فیلدهای ضروری روی نقشه | Actions |
| --- | --- | --- | --- |
| **Walk-in Clinic** | مراجعه بدون نوبت برای مسائل غیراورژانسی | نام، آدرس، ساعت، «باز الآن»، تلفن، فاصله | Navigate، Call، Book* |
| **Urgent Care Centre** | بخیه، شکستگی ساده، تب، … | + سطح خدمات (X-ray، suturing، …)، wait estimate | Navigate، Call، Book* |
| **Emergency Department (ER)** | فقط اورژانس واقعی | wait time، آدرس، ۲۴/۷ | Navigate + **911 banner** |
| **Pharmacy** | نسخه، OTC، minor ailment prescribing (استان‌محور) | ساعت، ۲۴h، خدمات (flu shot، …) | Navigate، Call |

\* Book in app برای walk-in/urgent فقط اگر mock `supportsBooking: true` — در غیر این صورت Navigate + Call.

#### B. مراقبت اولیه (Primary care) — حالت ویژه

| حالت | روی نقشه؟ | شرط (MVP: mock BC) |
| --- | --- | --- |
| GP / Family practice **accepting new patients** | ✅ | mock + برچسب + **Book in app** |
| GP **not accepting** | ❌ در mock (نمایش ندهید) | جلوگیری از ناامیدی کاربر |
| Nurse Practitioner-led clinic | ✅ | mock؛ walk-in یا roster مشخص |

> در کانada **یافتن GP** مشکل ملی است. در MVP داده mock است؛ در production داده partner جایگزین می‌شود بدون تغییر UX.

#### C. Direct-access specialists & allied health

| دسته | ارجاع | پوشش معمول | رزرو در MVP |
| --- | --- | --- | --- |
| Physiotherapy | ❌ | استان‌محور، سقف | ✅ **In-app** (mock) |
| Chiropractic | ❌ | استان‌محور | ✅ |
| Massage (RMT) | ❌ | اغلب direct pay | ✅ |
| Acupuncture | ❌ | mixed | ✅ |
| Psychology / Counselling | ❌ | mixed / private | ✅ |
| Dietitian | ❌ | частo covered | ✅ |
| Podiatry | ⚠️ استان | mixed | ✅ با disclaimer |
| Dentistry | ❌ | direct pay | ✅ |
| Optometry | ❌ | частo provincial for exams | ⚠️ mock اختیاری |

#### D. آنچه عمداً **خارج از نقشه** می‌ماند

| دسته | دلیل |
| --- | --- |
| Medical specialists (cardiology, derm, ortho, …) | نیاز به referral |
| Hospitals (inpatient / non-ER) | غیر actionable روی نقشه |
| Diagnostic labs (blood, imaging) | نیاز به requisition — **جز** اگر فقط «محل تحویل نسخه» pharmacy-linked باشد |
| Long-term care / home care | خارج از use case «نقشه فوری» |
| Alternative بدون regulation واضح | ریسک گمراه‌کردن |

**استثناء آزمایشگاه:** اگر در آینده «Patient Service Centre» با **requisition از اپ (پس از virtual care)** داشته باشید، می‌توان در فاز جدا با copy «Bring your lab order» نشان داد — **نه در MVP.**

---

## ۷. آنچه روی نقشه **نمایش ندهیم** (خلاصه سیاست)

1. **Specialist physicians** بدون مسیر ارجاع روشن  
2. **بیمارستان** به‌جز نقطه ER  
3. **Lab / imaging** به‌عنوان مراجعه walk-in  
4. **GP not accepting patients** (مگر حالت اطلاعاتی بدون CTA)  
5. هر entity بدون **ساعت، آدرس، یا شماره تماس** معتبر  
6. هر خدمتی که **نمی‌توان action فوری** تعریف کرد  

---

## ۸. مدل داده (مفهومی — برای طراحی API و UI)

### ۸.۱ Entity: `MapFacility`

```text
MapFacility {
  id
  category: FacilityCategory      // enum از taxonomy
  subcategory?: string              // e.g. "Urgent Care"
  name
  address { street, city, province, postalCode }
  geo { lat, lng }
  phone?
  website?
  hours: WeeklyHours | "24/7"
  isOpenNow: boolean                // computed
  coverageBadges: CoverageBadge[]
  acceptingNewPatients?: boolean    // GP only
  waitTimeMinutes?: number          // ER / urgent — با source + updatedAt
  waitTimeSource?: string
  services?: string[]               // e.g. "X-ray", " suturing"
  languages?: string[]
  accessibility?: string[]
  province: CAProvinceCode
  actions: ActionType[]             // call, navigate, book
  bookingUrl?: string               // external یا in-app
  lastVerifiedAt: datetime
}
```

### ۸.۲ فیلدهای حداقلی به‌ازای دسته

| دسته | فیلدهای الزامی |
| --- | --- |
| همه | name, address, province, geo, hours یا 24/7, phone یا website |
| Walk-in / Urgent | isOpenNow |
| ER / Urgent | waitTime (اگر منبع دارید) + disclaimer |
| Pharmacy | is24h, minorAilmentsPrescribing (boolean, استان) |
| GP | acceptingNewPatients |
| Direct-access | coverageBadges, book action یا phone |

---

## ۹. طراحی UX — صفحه نقشه

### ۹.۱ Layout

```text
┌─────────────────────────────────────┐
│ ← Back    Find care near you    [⚙] │  ← header + filter drawer
├─────────────────────────────────────┤
│ [Urgent] [Pharmacy] [Primary] …      │  ← horizontal filter chips (top)
├─────────────────────────────────────┤
│                                     │
│            MAP (full bleed)         │
│         markers by category         │
│                                     │
├─────────────────────────────────────┤
│ 911 / emergency disclaimer strip    │  ← fixed, subtle, always visible
└─────────────────────────────────────┘
```

- **فیلتر بالا** (طبق نسخه اول سند — اصلاح‌شده با super-categories)
- **Disclaimer پایین** برای ER/911 — همیشه visible
- **Drawer فیلتر پیشرفته:** فاصله، «باز الآن»، «۲۴ ساعته»، «پذیرش بیمار جدید» (GP)، پوشش

### ۹.۲ Marker

- آیکون متفاوت per super-category (رنگ برند + شکل متمایز)
- خوشه‌بندی (cluster) در zoom پایین
- بدون عکس پروفایل پزشک به‌عنوان پیش‌فرض — **تسهیل (facility)** نه **فرد (specialist)**

### ۹.۳ Bottom sheet / Popup (detail)

```text
[ Category badge ] [ Coverage badge ] [ Open now ]
Name of facility
Address · distance · province
Wait: ~45 min (updated 12 min ago)   ← if applicable
Hours today: 8:00 – 20:00
Why on map: "Walk-in care — no referral needed"

[ Navigate ]  [ Call ]  [ Book ]       ← Book فقط اگر پشتیبانی شود
Short disclaimer (1 line)
```

### ۹.۴ فیلترها

| فیلتر | اعمال روی |
| --- | --- |
| Open now | همه |
| 24 hours | Pharmacy، ER |
| Within X km | همه |
| Accepting new patients | Primary care |
| Direct pay only / Insured visit | همه |
| Super-category chips | taxonomy سطح ۱ |

### ۹.۵ حالت‌های خالی و خطا

| حالت | رفتار |
| --- | --- |
| Location denied | مرکز map روی استان/شهر انتخاب‌شده + banner «Enable location» |
| No results | «No matching care nearby. Try urgent & walk-in or widen distance.» |
| Stale wait time | «Wait time unavailable — call ahead.» |
| Outside Canada | «This map is for Canadian health services.» |

---

## ۱۰. سناریوهای کاربر (User stories)

| # | سناریو | دسته | مسیر موفق |
| --- | --- | --- | --- |
| 1 | تب و می‌خواهد tonight دارو بگیرد | Pharmacy | فیلتر Open now + Navigate |
| 2 | sprain مچ پا — نه ER | Urgent Care | Urgent chip + wait time + Navigate |
| 3 | chest pain | — | disclaimer 911 — **نه** تشویق به walk-in |
| 4 | به GP جدید نیاز دارد | Primary | فیلتر Accepting new patients + **Book in app** |
| 5 | physiotherapy بعد از ورزش | Therapy | **Book in app** (+ Navigate) |
| 6 | دندان درد | Dental | Direct pay badge + **Book in app** |
| 7 | اضطراب — مشاور | Mental health | Coverage disclaimer + **Book in app** |

---

## ۱۱. رزرو آنلاین (In-app booking)

### ۱۱.۱ MVP — رزرو **داخل خود اپ**

برای **همه دسته‌های قابل رزرو** روی نقشه (شامل **GP / Primary care** و direct-access):

- دکمه **Book** → **drawer یا فرم رزرو در اپ** (همان الگوی appointment booking)
- رزرو به **facility/provider انتخاب‌شده از نقشه** bind می‌شود (`facilityId` / `providerId` در mock)
- **Navigate** و **Call** مکمل هستند؛ جایگزین Book نیستند
- **هیچ‌گاه** deep link به سایت خارجی به‌عنوان مسیر اصلی MVP
- **هیچ‌گاه** booking specialist پزشکی بدون referral workflow

جریان پیشنهادی:

```text
Marker tap → Detail sheet → [ Book ] → Auth (در صورت نیاز) → Booking drawer
  → انتخاب زمان / reason → POST appointment API → تأیید
```

### ۱۱.۲ آینده (داده واقعی)

- UX رزرو **بدون تغییر**؛ فقط منبع availability و تأیید نوبت به API partner وصل می‌شود
- مدل درآمد (آینده): کمیسیون رزرو، featured listing — با شفافیت و رعایت قوانین BC

---

## ۱۲. منابع داده

### ۱۲.۱ MVP — Mock (الزام فعلی)

| نوع داده | MVP | محل پیشنهادی در کد |
| --- | --- | --- |
| Walk-in / Urgent / ER | Mock facilities BC | `features/map/data/mock-facilities.ts` |
| Pharmacy | Mock | همان فایل یا split per category |
| GP / Primary care | Mock + `acceptingNewPatients` | شامل GP practices |
| Physio، Dental، Mental health، … | Mock | taxonomy §۶ |
| Wait time | Mock + `waitTimeUpdatedAt` | برای UX ER/Urgent |
| Reviews (اختیاری) | Mock | per facility |

**اصول mock:**

- نام‌ها و آدرس‌های **واقع‌گرایانه BC** (Victoria، Saanich، Langford، …)
- مختصات در محدوده Vancouver Island
- هر رکورد `province: 'BC'` و `coverageBadges` معتبر طبق §۵
- حداقل **۳–۵ نمونه per super-category** برای تست فیلتر
- فیلد `source: 'mock'` برای migration آسان به API

### ۱۲.۲ فاز بعد — داده از partner (برنامه‌ریزی شده)

| نوع داده | منبع آینده (توسط شما/partner) | نکته |
| --- | --- | --- |
| Facilities | Partner API / فایل‌های تأمین‌شده | جایگزین mock با همان schema |
| ER wait times | HealthLink BC یا partner | TTL کوتاه؛ `lastVerifiedAt` روی UI |
| GP accepting | Feed partner | جایگزین mock GP |
| Availability slots | Partner scheduling API | پشت همان in-app booking |

**الزام UI (حتی با mock):** ساختار `lastVerifiedAt` / wait time / coverage badges را پیاده کنید تا switch به داده واقعی فقط swap منبع باشد.

---

## ۱۳. scope پیاده‌سازی MVP (BC · Mock · In-app)

یک **MVP واحد** — نه سه فاز جدا — با mock کامل و UX نهایی:

### شامل می‌شود

| حوزه | MVP |
| --- | --- |
| **جغرافیا** | BC (mock: Greater Victoria area) |
| **زبان UI** | EN-first |
| **داده** | 100% mock؛ schema آماده swap |
| **دسته‌ها روی نقشه** | Urgent & walk-in، Pharmacy، **Primary care (GP mock)**، Therapy & rehab، Mental health، Dental & other |
| **فیلترها** | Super-category chips، Open now، Distance، Accepting new patients (GP) |
| **Actions** | Navigate، Call، **Book (in-app drawer)** |
| **Wait time** | Mock روی ER/Urgent (برای UX) |
| **Auth** | Login قبل از Book (مثل بقیه اپ) |
| **Disclaimer** | 911 + MSP/coverage copy |
| **Routing** | مسیریابی به marker (OSRM یا mock polyline) |

### عمداً خارج از MVP

| حوزه | دلیل |
| --- | --- |
| Specialist physicians | سیاست §۷ — نیاز به referral |
| Lab / imaging walk-in | نیاز به requisition |
| API/partner زنده | بعداً جایگزین mock |
| FR localization | بعد از EN-first |
| استان‌های غیر BC | بعداً |

### مسیر migration (بعد از MVP)

1. Partner داده `MapFacility[]` می‌دهد → جایگزین mock file / repository adapter  
2. Partner scheduling API → پشت همان booking drawer  
3. BC wait time feed → فیلد `waitTimeMinutes` از منبع واقعی  

---

## ۱۴. معیار موفقیت (KPIs)

- % sessions با حداقل یک action (call / navigate / book)
- زمان تا اولین action
- نرخ bounce وقتی location denied
- شکایات «couldn't actually book» (باید نزدیک صفر با رعایت سیاست نقشه)
- Coverage badge click-through (آگاهی کاربر از هزینه)

---

## ۱۵. واژه‌نامه

| اصطلاح | توضیح کوتاه |
| --- | --- |
| **Medicare (Canada)** | سیستم بیمه hospital/physician عمومی — **استان‌محور** |
| **Health card** | کارت بیمه استان (MSP، OHIP، …) |
| **Referral** | ارجاعنامه GP به specialist |
| **Walk-in** | مراجعه بدون نوبت از قبل |
| **Urgent Care** | مراقبت فوری غیر-ER |
| **ER / ED** | اورژانس بیمارستان |
| **Direct access** | بدون referral |
| **RMT** | Registered Massage Therapist |
| **PIPEDA** | قانون حریم خصوصی اطلاعات شخصی کانada |
| **811 / 988** | خطوط health / crisis (در copy جدا از نقشه قابل لینک) |

---

## ۱۶. تصمیمات محصول

### ✅ ثبت‌شده (نسخه MVP)

| # | موضوع | تصمیم |
| --- | --- | --- |
| 1 | استان | **فقط BC** — mock در محدوده Greater Victoria |
| 2 | زبان | **EN-first** |
| 3 | منبع داده | **تماماً Mock** در این نسخه؛ داده واقعی بعداً از partner/شما |
| 4 | رزرو | **In-app booking** — drawer/فرم داخل اپ؛ نه لینk خارجی |
| 5 | پزشک خانواده (GP) | **روی نقشه با mock** — شامل `acceptingNewPatients` و Book |
| 6 | Wait time | **Mock** (برای نمایش UX ER/Urgent) |
| 7 | داده آینده | Schema و UX ثابت؛ **swap mock → API** بدون redesign |

**پیامدهای BC (copy و badge — حتی با mock):**

- Health card = **MSP**
- Health line: **811** (HealthLink BC) در disclaimer
- Coverage badges طبق §۵ (Provincially insured، Direct pay، …)

### ❓ باز (اولویت پایین)

| # | موضوع | وضعیت |
| --- | --- | --- |
| 8 | Virtual care روی نقشه | بعداً — خارج از MVP mock |

---

## ۱۷. مراجع داخلی

- [deployment/README.md](./deployment/README.md) — ساختار کلی اپ (Home / Messages / Profile)
- CTA فعلی Home: «Find care near you» — باید با taxonomy این سند هم‌راستا شود (facility-centric، نه specialist-centric)

---

## پیوست — نگاشت فیلتر UI (نسخه قبلی → نسخه تکمیل‌شده)

| پیشنهاد قبلی | جایگزین پیشنهادی |
| --- | --- |
| `[ 🌡️ فوری ]` | `[ Urgent & walk-in ]` (Walk-in + Urgent + ER) |
| `[ 💊 داروخانه ]` | `[ Pharmacy ]` |
| `[ 🦷 دندانپزشک ]` | زیر `[ Dental & other ]` یا chip جدا |
| `[ 💪 فیزیوتراپی ]` | `[ Therapy & rehab ]` (Physio، Chiro، RMT، …) |
| `[ 🧠 مشاوره ]` | `[ Mental health ]` |
| — | `[ Primary care ]` (GP — mock در MVP) |

---

*پایان سند — نسخه ۱.۱*
