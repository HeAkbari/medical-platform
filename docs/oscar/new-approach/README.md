# OSCAR EMR 19 — Full Postman Collection

این بسته مستقیماً از فایل WADL همین نصب OSCAR تولید شده است.

## محتوا

- `OSCAR-EMR-19-Full.postman_collection.json`
- `OSCAR-EMR-19-Full.postman_environment.json`
- `endpoints.json`
- `endpoints.csv`

## آمار

- تعداد Requestها: **299**
- تعداد گروه‌های کاربردی: **16**

## راه‌اندازی

1. فایل Collection و Environment را در Postman Import کنید.
2. Environment با نام `OSCAR EMR 19 - Full Collection` را انتخاب کنید.
3. `consumerKey` و `consumerSecret` را وارد کنید.
4. OAuth را از پوشه `01. OAuth` اجرا کنید.
5. پس از دریافت Access Token، ابتدا `GET - check If Authed` را اجرا کنید.

## نکات مهم

- URI ثبت‌شده Client در OSCAR باید `https://oauth.pstmn.io` باشد.
- Callback باید `https://oauth.pstmn.io/v1/callback` باشد.
- برای Request Token، Header دستی `Content-Type` اضافه نشده است.
- همه Requestهای API به‌طور مستقیم OAuth 1.0 دارند و به Inherit Auth وابسته نیستند.
- Body درخواست‌های POST و PUT نمونه اولیه است و قبل از ارسال باید براساس نیاز واقعی تکمیل شود.
- از داده واقعی بیمار برای تست استفاده نکنید.
