# Documentation

راهنماها و مستندات پروژه **Medical Platform** در این پوشه نگهداری می‌شوند.

## ساختار پیشنهادی

| پوشه | محتوا |
|------|--------|
| [`guides/`](./guides/) | راهنمای توسعه، راه‌اندازی محلی، workflow |
| [`deployment/`](./deployment/) | دیپلوی (Netlify و غیره)، env، CI |
| [`architecture/`](./architecture/) | ساختار monorepo، ماژول‌ها، تصمیم‌های فنی |

## شروع سریع

- Monorepo با **Nx** + **Bun**
- اپ وب: `apps/web`
- API: `apps/api`
- پکیج‌های مشترک: `packages/*`

```bash
bun install
bun run dev        # Next.js (map / home)
bun run dev:api    # API
bun run build      # build همه پروژه‌ها
```

## افزودن سند جدید

1. فایل Markdown در پوشه مناسب بساز (مثلاً `docs/guides/local-setup.md`).
2. لینک آن را در این فایل یا README همان پوشه اضافه کن.
