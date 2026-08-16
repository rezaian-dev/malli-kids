<p align="center">
  <img src="public/og.jpg" alt="ملی‌کیدز — آتلیه پوشاک کودک" width="100%" />
</p>

<p align="center">
  <img src="public/brand/logo.png" alt="ملی‌کیدز" height="72" />
</p>

<h1 align="center">ملی‌کیدز ✨</h1>

<p align="center">
  👗 آتلیه پوشاک کودک<br />
  <em>🛍️ فروشگاه · 👤 حساب مشتری · 🖥️ کنسول مدیریت</em>
</p>

<p align="center">
  <img src="public/brand/stack.png" alt="Next.js، React، TypeScript، Tailwind، MongoDB، Zod" width="100%" />
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 16" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-087EA4?style=for-the-badge&logo=react&logoColor=white" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://www.mongodb.com"><img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" /></a>
  <img src="https://img.shields.io/badge/Better%20Auth-1.7-111111?style=for-the-badge" alt="Better Auth" />
</p>

---

## 📖 دربارهٔ پروژه

ملی‌کیدز فروشگاه آنلاین یک **آتلیه پوشاک کودک** است، نه قالب آماده و نه دمو. لباس اینجا قرار است بخشی از خاطرهٔ کودکی شود؛ برای همین رابط فارسی و راست‌چین است، موجودی واقعی است، و کنسول طوری نوشته شده که تیم هر روز با آن کار کند.

این مخزن همان آتلیه روی وب است: **یک اپ Next.js 16** با سه سطح، یک کاتالوگ، یک نشست و یک زبان بصری.

| سطح | چه می‌بینید |
| --- | --- |
| 🛍️ **ویترین** | خانه، فروشگاه، محصول، مجله، پرو مجازی، صفحات اعتماد |
| 👤 **حساب** | ورود، پروفایل، فرزند، آدرس روی نقشه، سفارش، فاکتور، علاقه‌مندی، تیکت |
| 🖥️ **کنسول** | محصول، انبار، سفارش، کوپن جلالی، بنر، مجله، چت، نظرات، ممیزی |

پیش‌فرض **Server Component** است؛ کلاینت فقط جایی که باید حرکت کند. متن ثابت **SSG**، کاتالوگ **ISR** (قیمت و موجودی)، حساب و ادمین **SSR**.

جزئیات برند در کد هم هست: ارقام فارسی، راست‌چین منطقی، انقضای کوپن روی **روز تقویم جلالی** (نه ساعت)، قفل موجودی هنگام تسویه، و SEO فقط برای چیزی که روی صفحه دیده می‌شود.

> 🤍 ملی‌کیدز فقط یک برند لباس کودک نیست؛ همراه لحظه‌های کوچک و فراموش‌نشدنی کودکی است.

شروع پیشنهادی: خانه → یک محصول → سبد. کنسول روی `/admin`.

---

## 🌟 امکانات

**🛍️ فروشگاه**  
فیلتر دسته، جنسیت، فصل و قیمت · مرتب‌سازی · کارت گرید و لیست · گالری · جدول سایز · ست کامل · نظر خریدار · موجودی مجدد · نوار خرید چسبان

**🧺 خرید**  
علاقه‌مندی · سبد · کوپن · ارسال رایگان از سقف برند · قفل موجودی در تسویه · فاکتور PDF

**🔐 حساب**  
Better Auth (رمز، OTP، بازیابی) · پروفایل · فرزند · نقشه · سفارش · تیکت

**🎛️ کنسول**  
داشبورد فروش · محصول و انبار · سفارش · مشتری و تیم · کوپن با انقضای **روز جلالی** · بنر مناسبتی · مجله TipTap · همکاری · چت و پاسخ آماده · نظرات · ممیزی

**📰 محتوا**  
درباره، FAQ، ارسال، سایز، حریم و شرایط — SSG · پارچه، الگو، کیت، آموزش · اینماد و ساماندهی

**🪞 پرو مجازی**  
`/tryon` — عکس یا مدل نمونه، انتخاب لباس، پیشنهاد سایز

---

## 🧊 رندر صفحات

| کجا | چگونه | چرا |
| --- | --- | --- |
| درباره، قوانین، FAQ، ارسال، سایز | **SSG** | متن برند ثابت است |
| خانه، فروشگاه، محصول | **ISR** ۶۰ث | قیمت و موجودی |
| همکاری، تماس | **ISR** ۵دقیقه | نیمه‌پایدار |
| مجله | **ISR** ۱ساعت | تحریریه |
| پروفایل، پرو، `/admin` | **SSR** | نشست خصوصی |

نقشه: `src/lib/cache.ts`

---

## 🗂️ نقشهٔ کد

```
src/app/(storefront)/     ویترین
src/app/admin/            کنسول
src/app/api/              هویت · فاکتور · پرو
src/components/           رابط مشترک
src/lib/db/               مدل‌های Mongoose
src/lib/shop/             دامنهٔ فروش
src/lib/auth/             نشست و نقش
src/proxy.ts              گیت Next.js 16
```

ماندگاری در `lib/db` · قانون کسب‌وکار در `lib/shop` و `lib/auth` · شکل در route groupها.

---

## 🧰 پشته

| لایه | انتخاب |
| --- | --- |
| اپ | Next.js 16 · React 19 · TypeScript 5.9 |
| ظاهر | Tailwind CSS v4 · Radix · CVA |
| داده | MongoDB · Mongoose |
| فرم | React Hook Form · Zod 4 |
| هویت | Better Auth · نامه |
| تحریریه | TipTap |
| تاریخ | تقویم جلالی |
| نقشه | Leaflet |
| فاکتور | Playwright |
| کاروسل | Embla |

---

## 🚀 اجرا

Node ۲۲ و MongoDB.

```bash
npm install
npm run dev
```

```bash
npm run build && npm start
npm run lint
npm run format:check
```

Playwright فقط برای چاپ فاکتور PDF است؛ e2e در این ریپو نیست.

---

<p align="center">
  <img src="public/brand/logo.png" alt="" height="40" /><br />
  <sub>👗 ملی‌کیدز · تمام حقوق محفوظ است</sub>
</p>
