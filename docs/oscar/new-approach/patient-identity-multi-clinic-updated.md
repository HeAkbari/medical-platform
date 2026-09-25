# Patient Identity در معماری چندکلینیکی

## اصل طراحی

یک بیمار می‌تواند در چند کلینیک که هرکدام OSCAR مستقل دارند، پروفایل
داشته باشد.

سه شناسه را باید از هم جدا نگه داریم:

-   **patientId:** شناسه سراسری بیمار در پلتفرم ما؛ بهتر است UUID باشد.
-   **demographicNo:** شناسه محلی بیمار در یک OSCAR مشخص و بین کلینیک‌ها
    متفاوت است.
-   **HIN:** شماره Health Insurance بیمار؛ برای شناسایی/تطبیق بیمار
    استفاده می‌شود و نباید Primary Key پلتفرم باشد.

## مدل پیشنهادی

``` text
Patient
- id (UUID)              ← شناسه اصلی پلتفرم
- healthNumber (HIN)
- healthNumberProvince

PatientClinicIdentity
- patientId
- clinicId
- externalPatientId      ← در OSCAR همان demographicNo
```

مثال:

``` text
Patient: 7ca4...
HIN: 9876543217

Clinic A → demographicNo = 2
Clinic B → demographicNo = 587
```

## اتصال بیمار به یک کلینیک OSCAR

برای اولین اتصال بیمار به یک کلینیک، به‌جای جستجوی عمومی از endpoint
مخصوص Patient Matching استفاده می‌کنیم:

``` http
POST /oscar/ws/services/demographics/matchDemographic
```

نمونه درخواست:

``` json
{
  "hin": "9876543217",
  "dob": "1815-01-11"
}
```

نمونه پاسخ موفق:

``` json
{
  "code": "A",
  "demographicNo": 2
}
```

پس از تطبیق موفق، نگاشت زیر در پلتفرم ذخیره می‌شود:

``` text
patientId + clinicId → demographicNo
```

از آن به بعد برای درخواست‌های همان کلینیک از `demographicNo` ذخیره‌شده
استفاده می‌کنیم و نیازی نیست در هر درخواست دوباره بیمار را با HIN جستجو
کنیم.

## قاعده نهایی

``` text
patientId      = هویت سراسری بیمار در پلتفرم
demographicNo  = هویت بیمار در OSCAR یک کلینیک
HIN + DOB      = اطلاعات مورد استفاده برای Patient Matching
```

**HIN نباید Primary Key یا شناسه عمومی بیمار در پلتفرم باشد.**
