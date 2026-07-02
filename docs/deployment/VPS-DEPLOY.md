# راهنمای دیپلوی Medical Platform روی VPS لینوکس

این سند گام‌به‌گام نحوهٔ انتقال و اجرای **اپلیکیشن Next.js** به‌همراه **سرور HAPI FHIR** (فاز ۱ — همان «happy-path» FHIR) و **دادهٔ نمونه** را روی سرور VPS شما توضیح می‌دهد.

> **نکته:** در این پروژه از **HAPI FHIR** استفاده می‌شود (نه happyFHIR). HAPI یک سرور مرجع FHIR R4 است که دادهٔ دمو را نگه می‌دارد.

| مؤلفه | نقش | پورت پیش‌فرض روی VPS |
|--------|-----|----------------------|
| **Web** (Next.js) | رابط کاربری + API | `3002` |
| **HAPI FHIR** | سرور دادهٔ بالینی (FHIR R4) | `8082` |
| **PostgreSQL** | دیتابیس HAPI | فقط داخل Docker (بدون پورت عمومی) |

**آی‌پی سرور شما:** `129.121.73.62`

پورت‌ها عمداً غیر از `3000`، `3001` و `8080` انتخاب شده‌اند تا با اپ دیگری که قبلاً روی Docker بالا آمده تداخل نداشته باشند. در صورت اشغال بودن، در فایل `deploy/.env` قابل تغییر هستند.

---

## فهرست

1. [معماری و پیش‌نیازها](#۱-معماری-و-پیش‌نیازها)
2. [اتصال به سرور با PuTTY](#۲-اتصال-به-سرور-با-putty)
3. [بررسی Docker و پورت‌های اشغال‌شده](#۳-بررسی-docker-و-پورت‌های-اشغال‌شده)
4. [آماده‌سازی روی ویندوز (لوکال)](#۴-آماده‌سازی-روی-ویندوز-لوکال)
5. [انتقال پروژه با WinSCP](#۵-انتقال-پروژه-با-winscp)
6. [نصب ابزارهای لازم روی سرور](#۶-نصب-ابزارهای-لازم-روی-سرور)
7. [دیپلوی با Docker Compose](#۷-دیپلوی-با-docker-compose)
8. [بارگذاری دادهٔ FHIR](#۸-بارگذاری-دادهٔ-fhir)
9. [تست نهایی](#۹-تست-نهایی)
10. [مدیریت روزمره](#۱۰-مدیریت-روزمره)
11. [انتقال دادهٔ فعلی از لوکال (اختیاری)](#۱۱-انتقال-دادهٔ-فعلی-از-لوکال-اختیاری)
12. [عیب‌یابی](#۱۲-عیب‌یابی)
13. [امنیت (پیشنهادی)](#۱۳-امنیت-پیشنهادی)

---

## ۱. معماری و پیش‌نیازها

### معماری روی سرور

```
مرورگر کاربر
    │
    ├─► http://129.121.73.62:3002     ← اپ Next.js (web)
    │         │
    │         └─► http://hapi-fhir:8080/fhir  (شبکهٔ داخلی Docker)
    │
    └─► http://129.121.73.62:8082     ← رابط HAPI FHIR (اختیاری، برای دیباگ)
              │
              └─► PostgreSQL (volume: medical-platform-hapi-pg)
```

### چه چیزی دیپلوی می‌شود؟

| بخش | وضعیت در پروژه |
|-----|----------------|
| اپ وب (`apps/web`) | **آمادهٔ production** — Next.js 16 با API Routeها |
| HAPI FHIR + PostgreSQL | **آماده** — `deploy/docker-compose.prod.yml` |
| NestJS API (`apps/api`) | هنوز پیاده‌سازی نشده — استفاده نمی‌شود |
| Prisma / دیتابیس اپ | هنوز وصل نشده — استفاده نمی‌شود |

### پیش‌نیاز روی VPS

- Ubuntu/Debian یا توزیع لینوکس مشابه
- Docker Engine + Docker Compose plugin
- حداقل **۲ GB RAM** (HAPI FHIR در بوت اول ~۹۰ ثانیه RAM می‌خورد)
- پورت‌های `3002` و `8082` در فایروال باز باشند

### ابزار روی ویندوز

- **PuTTY** — SSH
- **WinSCP** — انتقال فایل
- **Docker Desktop** (لوکال) — فقط اگر می‌خواهید دادهٔ فعلی را بکاپ بگیرید

---

## ۲. اتصال به سرور با PuTTY

1. PuTTY را باز کنید.
2. **Host Name:** `129.121.73.62`
3. **Port:** `22`
4. **Connection type:** SSH
5. (اختیاری) در **Connection → Data** نام کاربری `root` یا کاربر خود را وارد کنید.
6. **Open** → پسورد را وارد کنید.

اولین بار fingerprint سرور را تأیید کنید.

---

## ۳. بررسی Docker و پورت‌های اشغال‌شده

بعد از ورود به سرور، این دستورات را اجرا کنید:

```bash
# نسخه Docker
docker --version
docker compose version

# کانتینرهای در حال اجرا
docker ps

# پورت‌های listen شده روی سرور
sudo ss -tlnp | grep -E ':(3000|3001|3002|8080|8081|8082)\s'
```

### اگر پورت‌ها اشغال بودند

فایل `deploy/.env` را روی سرور ویرایش کنید (بعد از انتقال پروژه):

```env
WEB_HOST_PORT=3003      # مثلاً اگر 3002 اشغال است
HAPI_HOST_PORT=8083     # مثلاً اگر 8082 اشغال است
HAPI_DB_PASSWORD=یک-رمز-قوی
```

---

## ۴. آماده‌سازی روی ویندوز (لوکال)

### ۴.۱ اطمینان از build موفق

در پوشهٔ پروژه روی ویندوز:

```bash
bun install
bun run build:web
```

اگر build بدون خطا تمام شد، پروژه برای Docker آماده است.

### ۴.۲ (اختیاری) بکاپ دادهٔ FHIR لوکال

اگر روی ویندوز HAPI را با `docs/oscar/docker-compose.yml` اجرا کرده‌اید و می‌خواهید **همان داده** را منتقل کنید، به [بخش ۱۱](#۱۱-انتقال-دادهٔ-فعلی-از-لوکال-اختیاری) مراجعه کنید.

در غیر این صورت، روی سرور `seed.py` را اجرا می‌کنید — دادهٔ دمو یکسان است (idempotent).

---

## ۵. انتقال پروژه با WinSCP

### روش پیشنهادی: انتقال کل پروژه

1. WinSCP را باز کنید.
2. **File protocol:** SFTP
3. **Host name:** `129.121.73.62`
4. **User name / Password:** همان اطلاعات SSH
5. **Login**

6. در پنل راست (سرور)، پوشهٔ مقصد بسازید:

```
/opt/medical-platform
```

7. از پنل چپ (ویندوز)، کل پوشهٔ پروژه را بکشید به `/opt/medical-platform`.

### فایل‌هایی که **نباید** منتقل شوند (WinSCP آن‌ها را رد کند یا بعداً حذف کنید)

| مسیر | دلیل |
|------|------|
| `node_modules/` | روی سرور دوباره نصب/بیلد می‌شود |
| `apps/web/.next/` | در Docker بیلد می‌شود |
| `.git/` | اختیاری — برای دیپلوی لازم نیست |
| `apps/web/.env.local` | تنظیمات لوکال — روی سرور از Docker env استفاده می‌شود |

> **نکته:** اگر `node_modules` هم منتقل شود حجم زیاد می‌شود و لازم نیست. Docker خودش `bun install` و `build` را انجام می‌دهد.

### روش جایگزین: Git روی سرور

اگر repo روی GitHub/GitLab است:

```bash
cd /opt
git clone <URL-مخزن> medical-platform
cd medical-platform
```

---

## ۶. نصب ابزارهای لازم روی سرور

اگر Docker نصب نیست:

```bash
# Ubuntu — نصب Docker (رسمی)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# یک‌بار logout/login کنید تا گروه docker اعمال شود
```

Python برای seed (فقط یک‌بار):

```bash
sudo apt update
sudo apt install -y python3 curl
```

---

## ۷. دیپلوی با Docker Compose

روی سرور (PuTTY):

```bash
cd /opt/medical-platform

# کپی تنظیمات پورت
cp deploy/.env.production.example deploy/.env

# در صورت نیاز پورت‌ها را ویرایش کنید
nano deploy/.env
```

### بالا آوردن stack

```bash
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env up -d --build
```

اولین بار ممکن است **۵ تا ۱۵ دقیقه** طول بکشد (دانلود imageها + build اپ).

### مشاهده وضعیت

```bash
# وضعیت کانتینرها
docker compose -f deploy/docker-compose.prod.yml ps

# لاگ همه سرویس‌ها
docker compose -f deploy/docker-compose.prod.yml logs -f

# فقط HAPI (صبر تا healthy شود)
docker compose -f deploy/docker-compose.prod.yml logs -f hapi-fhir
```

HAPI FHIR حدود **۹۰ تا ۱۲۰ ثانیه** بعد از start به حالت healthy می‌رسد.

### آدرس‌های دسترسی

| سرویس | URL |
|--------|-----|
| اپلیکیشن | http://129.121.73.62:3002 |
| HAPI UI | http://129.121.73.62:8082 |
| FHIR base (عمومی) | http://129.121.73.62:8082/fhir |

---

## ۸. بارگذاری دادهٔ FHIR

بعد از healthy شدن HAPI، **یک‌بار** seed را اجرا کنید:

```bash
cd /opt/medical-platform

# صبر تا metadata پاسخ دهد
curl -sf http://127.0.0.1:8082/fhir/metadata > /dev/null && echo "HAPI ready"

# بارگذاری دادهٔ دمو (idempotent — چندبار اجرا مشکلی ندارد)
FHIR_BASE_URL=http://127.0.0.1:8082/fhir python3 docs/oscar/seed.py
```

خروجی موفق شبیه این است:

```
PUT Patient/pat-akbari → 200
PUT Practitioner/prac-rezaei → 200
...
Done. N resources upserted.
```

### ورود به اپ (حساب دمو)

| فیلد | مقدار |
|------|--------|
| شماره تلفن | `+1 416 555 0101` |
| کد OTP | `123456` |

> OTP فقط برای محیط توسعه/دمو است و در production باید با سرویس SMS واقعی جایگزین شود.

---

## ۹. تست نهایی

روی سرور:

```bash
# سلامت FHIR
curl -s http://127.0.0.1:8082/fhir/metadata | head -c 200

# لیست بیماران
curl -s "http://127.0.0.1:8082/fhir/Patient?_count=3"

# API اپ (از داخل سرور)
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3002/en/home
```

از مرورگر ویندوز:

1. http://129.121.73.62:3002 — صفحهٔ خانه باز شود
2. لاگین با شماره و OTP دمو
3. نوبت‌ها، نسخه‌ها، نقشه و... داده نشان دهند

اگر صفحه باز نشد:

```bash
# فایروال Ubuntu
sudo ufw status
sudo ufw allow 3002/tcp
sudo ufw allow 8082/tcp
```

همچنین در پنل VPS (مثلاً OVH، Hetzner، ...) Security Group / Firewall را بررسی کنید.

---

## ۱۰. مدیریت روزمره

```bash
cd /opt/medical-platform

# شروع
docker compose -f deploy/docker-compose.prod.yml up -d

# توقف (دادهٔ FHIR حفظ می‌شود)
docker compose -f deploy/docker-compose.prod.yml down

# ری‌استارت فقط اپ
docker compose -f deploy/docker-compose.prod.yml restart web

# به‌روزرسانی بعد از تغییر کد
docker compose -f deploy/docker-compose.prod.yml up -d --build web

# مشاهده مصرف منابع
docker stats medical-platform-web medical-platform-hapi-fhir medical-platform-postgres
```

### بعد از آپدیت کد از WinSCP

1. فایل‌های جدید را منتقل کنید
2. روی سرور: `docker compose -f deploy/docker-compose.prod.yml up -d --build web`

---

## ۱۱. انتقال دادهٔ فعلی از لوکال (اختیاری)

اگر روی ویندوز Docker با `docs/oscar/docker-compose.yml` اجرا شده و دادهٔ سفارشی دارید:

### روی ویندوز (Git Bash یا PowerShell با Docker)

```bash
# بکاپ PostgreSQL از کانتینر لوکال
docker exec oscar-test-postgres pg_dump -U hapi -d hapi --no-owner --no-acl > hapi_backup.sql
```

فایل `hapi_backup.sql` را با WinSCP به `/opt/medical-platform/` منتقل کنید.

### روی سرور

```bash
cd /opt/medical-platform

# فقط HAPI + DB را بالا بیاورید (بدون web)
docker compose -f deploy/docker-compose.prod.yml up -d postgres hapi-fhir

# صبر تا healthy شود
sleep 120

# بازیابی
cat hapi_backup.sql | docker exec -i medical-platform-postgres psql -U hapi -d hapi
```

> **هشدار:** restore روی دیتابیس خالی انجام شود. اگر قبلاً seed زده‌اید، اول volume را پاک کنید:
> `docker compose -f deploy/docker-compose.prod.yml down -v` (همهٔ داده پاک می‌شود)

---

## ۱۲. عیب‌یابی

### کانتینر web بالا نمی‌آید

```bash
docker compose -f deploy/docker-compose.prod.yml logs web
```

علت‌های رایج: خطای build، کمبود RAM، پورت اشغال.

### اپ بالا است ولی داده خالی است

1. HAPI healthy است؟ `docker compose -f deploy/docker-compose.prod.yml ps`
2. seed اجرا شده؟ `FHIR_BASE_URL=http://127.0.0.1:8082/fhir python3 docs/oscar/seed.py`
3. env اپ: `docker exec medical-platform-web printenv FHIR_BASE_URL` باید `http://hapi-fhir:8080/fhir` باشد

### HAPI مدام restart می‌شود

```bash
docker compose -f deploy/docker-compose.prod.yml logs hapi-fhir
docker compose -f deploy/docker-compose.prod.yml logs postgres
```

معمولاً PostgreSQL هنوز آماده نیست یا RAM کم است.

### پورت در دسترس نیست از بیرون

```bash
sudo ss -tlnp | grep 3002
curl http://127.0.0.1:3002/en/home   # از خود سرور
```

اگر لوکال کار می‌کند ولی از بیرون نه → فایروال VPS یا Security Group.

### تداخل با اپ Docker دیگر

```bash
docker ps --format "table {{.Names}}\t{{.Ports}}"
```

نام کانتینرهای این پروژه:

- `medical-platform-web`
- `medical-platform-hapi-fhir`
- `medical-platform-postgres`

شبکه: `medical-platform-network` — جدا از اپ‌های دیگر.

---

## ۱۳. امنیت (پیشنهادی)

این دیپلوی برای **تست/استیج** مناسب است. برای production واقعی:

| مورد | اقدام |
|------|--------|
| پسورد DB | `HAPI_DB_PASSWORD` را در `deploy/.env` عوض کنید |
| OTP | سرویس SMS واقعی به‌جای `123456` |
| HTTPS | Nginx/Caddy + Let's Encrypt جلوی پورت 3002 |
| FHIR عمومی | پورت `8082` را فقط از IP ادمین باز کنید یا پشت VPN |
| فایروال | فقط پورت‌های لازم (`22`, `3002`, شاید `443`) |
| به‌روزرسانی | `docker compose pull` برای imageهای پایه |

### نمونه Nginx (اختیاری — دامنه `app.example.com`)

```nginx
server {
    listen 80;
    server_name app.example.com;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

سپس با Certbot گواهی SSL بگیرید.

---

## خلاصهٔ دستورات (cheat sheet)

```bash
# روی سرور — دیپلوی کامل
cd /opt/medical-platform
cp deploy/.env.production.example deploy/.env
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env up -d --build
FHIR_BASE_URL=http://127.0.0.1:8082/fhir python3 docs/oscar/seed.py

# آدرس‌ها
# اپ:     http://129.121.73.62:3002
# HAPI:   http://129.121.73.62:8082/fhir
```

---

## فایل‌های مرتبط در مخزن

| فایل | توضیح |
|------|--------|
| `deploy/docker-compose.prod.yml` | stack production (web + HAPI + PostgreSQL) |
| `deploy/Dockerfile` | build اپ Next.js |
| `deploy/.env.production.example` | نمونه تنظیم پورت و رمز DB |
| `docs/oscar/docker-compose.yml` | stack توسعهٔ لوکال (پورت 8080) |
| `docs/oscar/seed.py` | بارگذاری دادهٔ دمو FHIR |
| `docs/oscar/FHIR_ENDPOINTS_IN_USE.md` | endpointهای FHIR که اپ استفاده می‌کند |

---

*آخرین به‌روزرسانی: مطابق ساختار فعلی monorepo (Next.js 16 + HAPI FHIR R4 + Bun/Nx).*
