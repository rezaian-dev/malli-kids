# مَلی‌کیدز 🧸 — فروشگاه پوشاک کودک

فروشگاه RTL فارسی برای پوشاک کودک؛ ساخته‌شده با Next.js App Router + React Server Components + shadcn/ui.

## 🧰 Stack

| لایه | انتخاب |
|---|---|
| فریم‌ورک | Next.js 16 (App Router، Turbopack) |
| زبان | TypeScript (strict) |
| استایل | Tailwind CSS v4 + shadcn/ui |
| فرم‌ها | react-hook-form + zod (پوستهٔ `AppForm`) |
| داده | localStorage + Store محلی (بدون بک‌اند) |

## ⚡ اسکریپت‌ها

```bash
npm run dev     # توسعه با Turbopack
npm run build   # بیلد تولید
npm run start   # اجرای بیلد
npm run lint    # ESLint
```

## 🗂️ ساختار

```
src
├── app/
│   ├── (storefront)/   # فروشگاه: shop, profile, product, articles …
│   ├── (admin)/        # پنل ادمین: admin/** (روت‌گروپ مجزا)
│   ├── layout.tsx      # روت‌لایه (فونت، تم، هدر/فوتر)
│   ├── globals.css     # تم Tailwind + انیمیشن‌ها
│   └── page.tsx        # خانه
├── components/
│   ├── ui/             # کامپوننت‌های shadcn/ui
│   ├── layout/         # هدر، فوتر، منوها، کارت سبد
│   ├── home/           # بخش‌های صفحهٔ اصلی
│   ├── product/        # کارت محصول و اجزای آن
│   ├── admin/          # اجزای پنل ادمین
│   └── shared/         # اجزای مشترک (Pagination, FAQ …)
├── features/           # ماژول‌های افقی: auth, product, admin, festive
├── lib/                # استور، داده، فرمت (فارسی) و ابزار
└── types/              # تایپ‌های سراسری
```

هر segment از `app` خطا/بارگذاری خودش را دارد: `error.tsx`، `loading.tsx` (Skeleton)، `not-found.tsx`. برای Streaming مرزهای `Suspense` در `page.tsx` + `loading.tsx` استفاده شده.

## 📏 قراردادها (طبق بازبینی‌ها)

- **Server Components پیش‌فرض**؛ `"use client"` فقط برای تعامل (فرم، state، روتر).
- هر کامپوننت **یک وظیفه**؛ صفحه‌ها فقط ارکستریشن (state + چیدمان) هستند.
- **کامنت‌ها انگلیسی و خیلی کوتاه‌اند** و با ایموجیِ مرتبط (`// 🧭 Derives state from URL`).
- چیدمان **RTL** با Tailwind (کلاس‌های `ms-`/`me-`/`end-`).
- شرطی‌ها با `cn()`؛ کلاس‌ها بر اساس canonical Tailwind مرتب می‌شوند.
- فرم‌ها از `AppForm` (`@/components/form`) با schema زد.

## 🔑 نکته‌ها

- هویت: استور از `localStorage` می‌خواند؛ سفارش/تیکت/علاقه‌مندی همگی سمت کلاینت.
- تم: Dark/Light با `instrumentation-client.ts` (بدون فلشِ روشن).
- آواتار پروفایل: فشرده‌سازی canvas در `src/lib/to-blob.ts`.