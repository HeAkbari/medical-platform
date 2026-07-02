# راهنمای دیپلوی Medical Platform روی VPS لینوکس

این سند گام‌به‌گام نحوهٔ انتقال و اجرای **اپلیکیشن Next.js** به‌همراه **سرور HAPI FHIR** (فاز ۱ — همان «happy-path» FHIR) و **دادهٔ نمونه** را روی سرور VPS شما توضیح می‌دهد.

> **نکته:** در این پروژه از **HAPI FHIR** استفاده می‌شود (نه happyFHIR). HAPI یک سرور مرجع FHIR R4 است که دادهٔ دمو را نگه می‌دارد.

| مؤلفه | نقش | پورت پیش‌فرض روی VPS |
|--------|-----|----------------------|
| **Web** (Next.js) | رابط کاربری + API | `3002` |
| **HAPI FHIR** | سرور دادهٔ بالینی (FHIR R4) | `8082` |
| **PostgreSQL** | دیتابیس HAPI | فقط داخل Docker (بدون پورت عمومی) |

**آی‌پی سرور شما:** `129.121.73.62`

پورت‌ها عمداً غیر از `3000`، `3001` و `8080` انتخاب شده‌اند تا با سرویس‌های دیگر روی سرور تداخل نداشته باشند. در صورت اشغال بودن، در فایل `deploy/.env` قابل تغییر هستند.

> **مهم:** روی سرور شما Docker نصب نیست — **قبل از هر چیز** [بخش ۴ (نصب Docker)](#۴-نصب-docker-از-صفر) را انجام دهید، سپس بقیهٔ مراحل را دنبال کنید.

### ترتیب پیشنهادی مراحل

| مرحله | بخش | توضیح |
|-------|-----|--------|
| ۱ | [۲](#۲-اتصال-به-سرور-با-putty) | اتصال SSH با PuTTY |
| ۲ | [۳](#۳-بررسی-وضعیت-سرور-docker-و-پورت‌ها) | تأیید که Docker نصب نیست |
| ۳ | [۴](#۴-نصب-docker-از-صفر) | **نصب Docker** + تست `hello-world` |
| ۴ | [۵](#۵-دریافت-پروژه-از-github) | `git clone` روی سرور |
| ۵ | [۶](#۶-نصب-ابزارهای-کمکی-git-python-و-) | نصب `git`، `python3` و `curl` |
| ۶ | [۷](#۷-دیپلوی-با-docker-compose) → [۸](#۸-بارگذاری-دادهٔ-fhir) | دیپلوی + seed داده |
| ۷ | [۹](#۹-تست-نهایی) | تست از مرورگر |

---

## فهرست

1. [معماری و پیش‌نیازها](#۱-معماری-و-پیش‌نیازها)
2. [اتصال به سرور با PuTTY](#۲-اتصال-به-سرور-با-putty)
3. [بررسی وضعیت سرور (Docker و پورت‌ها)](#۳-بررسی-وضعیت-سرور-docker-و-پورت‌ها)
4. [نصب Docker از صفر](#۴-نصب-docker-از-صفر)
5. [دریافت پروژه از GitHub](#۵-دریافت-پروژه-از-github)
6. [نصب ابزارهای کمکی (Git, Python و ...)](#۶-نصب-ابزارهای-کمکی-git-python-و-)
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

- Ubuntu 22.04/24.04 یا Debian 11/12 (یا توزیع لینوکس مشابه)
- **Docker Engine + Docker Compose** — روی سرور فعلی نصب نیست؛ [بخش ۴](#۴-نصب-docker-از-صفر) را دنبال کنید
- حداقل **۲ GB RAM** (HAPI FHIR در بوت اول ~۹۰ ثانیه RAM می‌خورد)
- پورت‌های `3002` و `8082` در فایروال باز باشند
- دسترسی `sudo` یا کاربر `root`

### ابزار روی ویندوز

- **PuTTY** (یا هر SSH client) — اتصال به سرور و اجرای دستورات
- **WinSCP** — **فقط در صورت نیاز** (مثلاً انتقال بکاپ دیتابیس FHIR از لوکال؛ [بخش ۱۱](#۱۱-انتقال-دادهٔ-فعلی-از-لوکال-اختیاری))

> همهٔ کارهای اصلی (نصب Docker، clone، build، deploy) **فقط با SSH/PuTTY** روی سرور انجام می‌شود.

### مخزن GitHub

```
https://github.com/HeAkbari/medical-platform.git
```

قبل از دیپلوی، مطمئن شوید آخرین تغییرات (شامل پوشهٔ `deploy/`) روی GitHub push شده باشد.

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

## ۳. بررسی وضعیت سرور (Docker و پورت‌ها)

بعد از ورود به سرور با PuTTY، **اولین کار** بررسی نصب بودن Docker است:

```bash
docker --version
docker compose version
```

### اگر Docker نصب **نیست**

خروجی شبیه این می‌بینید:

```
bash: docker: command not found
```

یا:

```
docker: command not found
```

→ مستقیم بروید به **[بخش ۴ — نصب Docker از صفر](#۴-نصب-docker-از-صفر)**. تا نصب Docker تمام نشود، بقیهٔ مراحل کار نمی‌کنند.

### اگر Docker نصب **است**

خروجی نمونه:

```
Docker version 27.x.x, build ...
Docker Compose version v2.x.x
```

سپس وضعیت فعلی سرور را ببینید:

```bash
# کانتینرهای در حال اجرا (ممکن است خالی باشد)
docker ps

# پورت‌های listen شده
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

## ۴. نصب Docker از صفر

این بخش برای سروری است که Docker روی آن نصب نیست (وضعیت فعلی VPS شما).

### ۴.۱ تشخیص توزیع لینوکس

```bash
cat /etc/os-release
```

| اگر `ID` برابر بود با | روش نصب |
|----------------------|---------|
| `ubuntu` یا `debian` | [۴.۲ — Ubuntu/Debian](#۴۲-نصب-روی-ubuntu--debian-پیشنهادی) |
| `centos`، `rhel`، `rocky`، `almalinux` | [۴.۳ — CentOS/RHEL](#۴۳-نصب-روی-centosrhelrocky) |

### ۴.۲ نصب روی Ubuntu / Debian (پیشنهادی)

**گام ۱ — به‌روزرسانی پکیج‌ها:**

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
```

**گام ۲ — نصب Docker با اسکریپت رسمی:**

```bash
curl -fsSL https://get.docker.com | sudo sh
```

این اسکریپت نصب می‌کند:
- Docker Engine
- Docker Compose plugin (`docker compose`)
- سرویس `docker` با start خودکار

**گام ۳ — فعال‌سازی و استارت سرویس:**

```bash
sudo systemctl enable docker
sudo systemctl start docker
sudo systemctl status docker
```

در خروجی `status` باید `active (running)` ببینید. برای خروج `q` بزنید.

**گام ۴ — اجرای Docker بدون `sudo` (پیشنهادی):**

```bash
sudo usermod -aG docker $USER
```

سپس **یک‌بار PuTTY را ببندید و دوباره وصل شوید** (logout/login) تا گروه `docker` اعمال شود.

> تا reconnect نکرده‌اید، همهٔ دستورات Docker را با `sudo` اجرا کنید:
> `sudo docker ps`

**گام ۵ — تست نصب:**

```bash
docker run --rm hello-world
```

پیام `Hello from Docker!` یعنی نصب موفق بوده.

```bash
docker compose version
```

باید نسخه Compose v2 را نشان دهد (مثلاً `v2.29.x`).

### ۴.۳ نصب روی CentOS/RHEL/Rocky

```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

سپس PuTTY را reconnect کنید و `docker run --rm hello-world` را تست کنید.

### ۴.۴ نصب دستی (اگر اسکریپت get.docker.com کار نکرد)

روی Ubuntu 22.04/24.04:

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

PuTTY reconnect → `docker run --rm hello-world`

### ۴.۵ عیب‌یابی نصب Docker

| مشکل | راه‌حل |
|------|--------|
| `permission denied` هنگام `docker ps` | `sudo docker ps` یا reconnect بعد از `usermod -aG docker` |
| `Cannot connect to the Docker daemon` | `sudo systemctl start docker` و `sudo systemctl status docker` |
| `curl: (6) Could not resolve host` | DNS سرور را بررسی کنید یا از IP مستقیم mirror استفاده کنید |
| `Package docker-ce has no installation candidate` | توزیع قدیمی است — `cat /etc/os-release` را چک کنید |
| RAM کم — build fail | حداقل ۲ GB؛ در صورت نیاز swap اضافه کنید (پایین) |

**اضافه کردن swap (اختیاری، اگر RAM کمتر از ۲ GB است):**

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

### ۴.۶ چک‌لیست قبل از ادامه

قبل از رفتن به بخش بعد، هر چهار مورد زیر باید OK باشد:

```bash
docker --version          # ✓ نسخه نمایش داده شود
docker compose version    # ✓ نسخه v2 نمایش داده شود
docker ps                 # ✓ بدون خطای permission/daemon
docker run --rm hello-world  # ✓ پیام Hello from Docker
```

---

## ۵. دریافت پروژه از GitHub

روش پیشنهادی: **clone مستقیم روی سرور** با PuTTY. نیازی به WinSCP نیست.

### ۵.۱ نصب Git (اگر نصب نیست)

```bash
sudo apt update
sudo apt install -y git
git --version
```

### ۵.۲ Clone پروژه

```bash
cd /opt
git clone https://github.com/HeAkbari/medical-platform.git
cd medical-platform
```

برای بررسی:

```bash
ls deploy/
# باید ببینید: docker-compose.prod.yml  Dockerfile  .env.production.example
```

### ۵.۳ اگر مخزن private است

**روش A — SSH key (پیشنهادی):**

روی سرور:

```bash
ssh-keygen -t ed25519 -C "vps-medical-platform" -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
```

خروجی `cat` را در GitHub بروید: **Settings → SSH and GPG keys → New SSH key** و paste کنید.

سپس:

```bash
cd /opt
git clone git@github.com:HeAkbari/medical-platform.git
cd medical-platform
```

**روش B — Personal Access Token (HTTPS):**

1. GitHub → **Settings → Developer settings → Personal access tokens**
2. یک token با دسترسی `repo` بسازید
3. Clone:

```bash
git clone https://<TOKEN>@github.com/HeAkbari/medical-platform.git
```

### ۵.۴ انتخاب branch

اگر روی branch خاصی کار می‌کنید:

```bash
cd /opt/medical-platform
git branch -a
git checkout main    # یا نام branch شما
git pull
```

### ۵.۵ به‌روزرسانی بعداً (بدون WinSCP)

هر بار که روی GitHub push کردید:

```bash
cd /opt/medical-platform
git pull
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env up -d --build web
```

---

## ۶. نصب ابزارهای کمکی (Git, Python و ...)

Docker و Git نصب شده؛ قبل از دیپلوی این ابزارها را هم بگذارید:

```bash
sudo apt update
sudo apt install -y git python3 curl nano
```

| ابزار | کاربرد |
|-------|--------|
| `git` | دریافت و به‌روزرسانی پروژه از GitHub |
| `python3` | اجرای `docs/oscar/seed.py` برای بارگذاری دادهٔ FHIR |
| `curl` | تست سلامت HAPI و اپ |
| `nano` | ویرایش `deploy/.env` روی سرور |

> اگر در [بخش ۵](#۵-دریافت-پروژه-از-github) قبلاً `git` را نصب کرده‌اید، دوباره نصب مشکلی ندارد.

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

### به‌روزرسانی بعد از push به GitHub

```bash
cd /opt/medical-platform
git pull
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env up -d --build web
```

---

## ۱۱. انتقال دادهٔ فعلی از لوکال (اختیاری — تنها جایی که WinSCP لازم است)

اگر روی ویندوز Docker با `docs/oscar/docker-compose.yml` اجرا شده و دادهٔ سفارشی دارید (نه seed پیش‌فرض):

### روی ویندوز (Git Bash یا PowerShell با Docker)

```bash
# بکاپ PostgreSQL از کانتینر لوکال
docker exec oscar-test-postgres pg_dump -U hapi -d hapi --no-owner --no-acl > hapi_backup.sql
```

### انتقال به سرور

**روش A — `scp` از Git Bash (بدون WinSCP):**

```bash
scp hapi_backup.sql root@129.121.73.62:/opt/medical-platform/
```

**روش B — WinSCP** (اگر `scp` در دسترس نیست):

فایل `hapi_backup.sql` را به `/opt/medical-platform/` منتقل کنید.

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

### Docker اصلاً نصب نیست / `command not found`

به [بخش ۴](#۴-نصب-docker-از-صفر) برگردید. تا `docker run --rm hello-world` موفق نشود، ادامه ندهید.

### `permission denied` روی docker.sock

```bash
sudo usermod -aG docker $USER
# PuTTY را ببندید و دوباره وصل شوید
```

یا موقتاً: `sudo docker compose ...`

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
# ── ۱. نصب Docker (اگر نصب نیست) ──
curl -fsSL https://get.docker.com | sudo sh
sudo systemctl enable --now docker
docker run --rm hello-world

# ── ۲. ابزارها + دریافت پروژه از GitHub ──
sudo apt update && sudo apt install -y git python3 curl nano
cd /opt
git clone https://github.com/HeAkbari/medical-platform.git
cd medical-platform

# ── ۳. دیپلوی کامل ──
cp deploy/.env.production.example deploy/.env
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env up -d --build
FHIR_BASE_URL=http://127.0.0.1:8082/fhir python3 docs/oscar/seed.py

# ── ۴. به‌روزرسانی بعدی ──
git pull
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env up -d --build web

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

*آخرین به‌روزرسانی: دیپلوی از GitHub (بدون WinSCP) + نصب Docker از صفر.*
