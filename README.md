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

ملی‌کیدز فروشگاهِ برخطِ یک **آتلیهٔ پوشاک کودک** است؛ نه قالب آماده و نه نسخهٔ نمایشی. لباس این‌جا قرار است بخشی از خاطرهٔ کودکی شود. برای همین رابط کاملاً فارسی و راست‌چین است، موجودی واقعی است و کنسول طوری نوشته شده که تیم هر روز با آن کار کند.

این مخزن همان آتلیه روی وب است: **یک برنامه با Next.js نسخهٔ ۱۶** با سه سطح، یک کاتالوگ، یک نشست و یک زبان بصری.

| سطح | چه می‌بینید |
| --- | --- |
| 🛍️ **ویترین** | خانه، فروشگاه، محصول، مجله، پرو مجازی، صفحات اعتماد |
| 👤 **حساب** | ورود، پروفایل، فرزند، آدرس روی نقشه، سفارش، فاکتور، علاقه‌مندی، تیکت |
| 🖥️ **کنسول** | محصول، انبار، سفارش، کوپن جلالی، بنر، مجله، گفت‌وگو، نظرات، ممیزی |

پیش‌فرض **کامپوننت سرور** است؛ سمت کاربر فقط جایی است که باید حرکت کند. متن ثابت با **ساخت ایستا**، کاتالوگ با **بازتولید دوره‌ای** (قیمت و موجودی)، حساب و مدیریت با **رندر سمت سرور**.

جزئیات برند در کد هم هست: ارقام فارسی، راست‌چین منطقی، انقضای کوپن روی **روزِ تقویم جلالی** (نه ساعت)، قفل موجودی هنگام تسویه، و سئو فقط برای چیزی که روی صفحه دیده می‌شود.

> 🤍 ملی‌کیدز فقط یک برند لباس کودک نیست؛ همراه لحظه‌های کوچک و فراموش‌نشدنی کودکی است.

شروع پیشنهادی: خانه، سپس یک محصول، سپس سبد. کنسول در مسیر `admin` است.

---

## 🌟 امکانات

**🛍️ فروشگاه**  
فیلتر دسته، جنسیت، فصل و قیمت · مرتب‌سازی · کارت شبکه‌ای و فهرستی · گالری · جدول سایز · ست کامل · نظر خریدار · موجودی مجدد · نوار خرید چسبان

**🧺 خرید**  
علاقه‌مندی · سبد · کوپن · ارسال رایگان از سقف برند · قفل موجودی در تسویه · فاکتور پی‌دی‌اف

**🔐 حساب**  
ورود و رمز یک‌بارمصرف و بازیابی · پروفایل · فرزند · نقشه · سفارش · تیکت

**🎛️ کنسول**  
داشبورد فروش · محصول و انبار · سفارش · مشتری و تیم · کوپن با انقضای **روز جلالی** · بنر مناسبتی · مجله · همکاری · گفت‌وگو و پاسخ آماده · نظرات · ممیزی

**📰 محتوا**  
درباره، پرسش‌های متداول، ارسال، سایز، حریم خصوصی و شرایط — ساخت ایستا · پارچه، الگو، کیت، آموزش · اینماد و سامان‌دهی

**🪞 پرو مجازی**  
مسیر پرو: عکس یا مدل نمونه، انتخاب لباس، پیشنهاد سایز

---

## 🧊 رندر صفحات

| کجا | چگونه | چرا |
| --- | --- | --- |
| درباره، قوانین، پرسش‌ها، ارسال، سایز | **ساخت ایستا** | متن برند ثابت است |
| خانه، فروشگاه، محصول | **بازتولید هر ۶۰ ثانیه** | قیمت و موجودی |
| همکاری، تماس | **بازتولید هر ۵ دقیقه** | نیمه‌پایدار |
| مجله | **بازتولید هر ۱ ساعت** | تحریریه |
| پروفایل، پرو، مدیریت | **رندر سمت سرور** | نشست خصوصی |

نقشه در `src/lib/cache.ts` است.

---

## 🗂️ نقشهٔ کد

```
src/app/(storefront)/     ویترین
src/app/admin/            کنسول
src/app/api/              هویت · فاکتور · پرو
src/components/           رابط مشترک
src/lib/db/               مدل‌های داده
src/lib/shop/             دامنهٔ فروش
src/lib/auth/             نشست و نقش
src/proxy.ts              گیت Next.js ۱۶
```

ماندگاری در `lib/db` · قانون کسب‌وکار در `lib/shop` و `lib/auth` · شکل در گروه‌های مسیر.

---

## 🧰 پشته

| لایه | انتخاب |
| --- | --- |
| برنامه | Next.js ۱۶ · React ۱۹ · TypeScript ۵٫۹ |
| ظاهر | Tailwind نسخهٔ ۴ · Radix · CVA |
| داده | MongoDB · Mongoose |
| فرم | React Hook Form · Zod ۴ |
| هویت | Better Auth · نامه |
| تحریریه | TipTap |
| تاریخ | تقویم جلالی |
| نقشه | Leaflet |
| فاکتور | Playwright |
| کاروسل | Embla |

---

## 🚀 اجرا

نسخهٔ ۲۲ Node و پایگاه MongoDB لازم است.

```bash
npm install
npm run dev
```

```bash
npm run build && npm start
npm run lint
npm run format:check
```

از Playwright فقط برای چاپ فاکتور پی‌دی‌اف استفاده می‌شود. آزمون سرتاسری در این مخزن نیست.

---

<p align="center">
  <img src="public/brand/logo.png" alt="" height="40" /><br />
  <sub>👗 ملی‌کیدز · تمام حقوق محفوظ است</sub>
</p>
