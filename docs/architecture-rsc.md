# معماری Server / Client در مالی‌کیدز

سندِ ممیزیِ کاملِ مرزِ سرور و کلاینت. قاعدهٔ حاکم بر پروژه:

> **پیش‌فرض هر فایل Server Component است. `"use client"` فقط جایی نوشته می‌شود که
> واقعاً به تعاملِ کاربر، وضعیتِ مرورگر یا API مرورگر نیاز باشد — و در آن صورت هم
> فقط همان «برگ» کلاینت می‌شود، نه والدش.**

سه الگویی که در کلِ کد استفاده می‌شود:

| الگو | کِی؟ | نمونه |
|---|---|---|
| **Leaf island** (جزیرهٔ برگ) | یک دکمه/فرمِ کوچک داخل مارک‌آپِ ایستا | `FavButton`, `AddToCart`, `NotifyForm`, `CollabForm` |
| **Slot / children** | پوستهٔ تعاملی لازم است ولی محتوا ایستاست | `Journal` (کروسل) + `JournalSlides` (سرور) — `ArticleView` + `<ArticleMissing/>` و `<ArticleActions/>` |
| **Context بالای اسلات‌ها** | چند برگِ پراکنده به یک دادهٔ زندهٔ مشترک نیاز دارند | `LiveProduct` در صفحهٔ محصول |

---

## ۱) چه چیزهایی در این پاس به سرور منتقل شد

| مسیر/کامپوننت | قبل | بعد | توضیح |
|---|---|---|---|
| `/collab` | کلِ صفحه `"use client"` | صفحه **Server** + `collab-form.tsx` (client) | چهار کارتِ معرفی، عنوان‌ها و پوستهٔ فرم روی سرور |
| `/tryon` → `coming-soon.tsx` | کلِ صفحه client | **Server** + `notify-form.tsx` (client) | هیرو، انیمیشن‌های CSS و سه مرحله روی سرور |
| `/articles` | کلِ صفحه client، محتوا بعد از mount | صفحه **Server** + `articles-list.tsx` (client) | HTML اولیه دیگر خالی نیست؛ فهرستِ دانه سمتِ سرور می‌آید |
| `/articles/[slug]` | `article-client.tsx` همه‌چیز را client می‌ساخت و `ArticleMissing` را از فایلِ `page.tsx` import می‌کرد (ضدالگو) | `page.tsx` **Server** + `article-view.tsx` (client) + اسلات‌های `article-missing.tsx` و `article-actions.tsx` (Server) | مقالهٔ دانه روی سرور رندر و **SSG** می‌شود (`generateStaticParams`) |
| `/product/[id]` | `view.tsx` کلاینت بود و به‌همین‌دلیل `ProductTabs`، `SizeTable` و کارت‌های «مدل‌های مشابه» هم به باندلِ مرورگر کشیده می‌شدند | `page.tsx` **Server**؛ فقط `LiveProduct` (Provider)، `Buy`، `ReviewForm`، `ProductReviews`، `LiveName` و `LiveDesc` کلاینت‌اند | نان‌بردکرامب، تب‌ها، جدول سایز و چهار کارتِ مشابه دوباره سرور شدند |
| `Journal` (کروسل مجله) | داده + مارک‌آپِ ۵ اسلاید داخل کامپوننت client | `journal.tsx` فقط موتورِ Embla؛ `journal-slides.tsx` **Server** | مارک‌آپ و متنِ مقاله‌ها از باندل خارج شد |
| `components/ui/table.tsx` | `"use client"` بی‌دلیل | Server | فقط `<table>`/`<div>` است و هیچ hook ندارد |
| مودالِ ورود (`features/auth`) | همیشه در باندلِ اولیهٔ همهٔ صفحه‌ها | `auth-modal-mount.tsx`: `next/dynamic` + `ssr:false` + prefetch در `requestIdleCallback` | تا وقتی کاربر «ورود» نزند، فرم‌ها/اسکیما/OTP دانلود نمی‌شود ولی در زمانِ بی‌کاری از قبل آماده می‌شود |
| `stories.tsx` | `<a href="/articles">` (رفرشِ کامل) | `next/link` | ناوبریِ client-side مثل بقیهٔ لینک‌ها |
| ۱۴ صفحهٔ ایستا | بدون metadata | `export const metadata` (عنوان + توضیح) | SEO: `/about`, `/contact`, `/faq`, `/fabrics`, `/kits`, `/patterns`, `/size-guide`, `/shipping`, `/privacy`, `/terms`, `/tutorials`, `/shop`, `/tryon`, `/profile` + `generateMetadata` برای محصول و مقاله |

---

## ۲) چه چیزهایی عمداً client مانده‌اند (و چرا)

### ۲.۱ پوستهٔ سایت (`components/layout`)
`Header` و `Footer` خودشان Server Component هستند؛ این‌ها فقط جزیره‌های داخلشان‌اند:

| فایل | دلیلِ ناگزیرِ client |
|---|---|
| `desktop-nav.tsx` | منوی کنترل‌شده که با تغییرِ مسیر بسته می‌شود (`usePathname`) |
| `nav-active-link.tsx` | `usePathname` برای حالت active |
| `category-menu.tsx` | باز/بستهٔ `NavigationMenu` |
| `mobile-nav.tsx` | `Sheet` + `Accordion` |
| `cart-sheet.tsx` | سبد خرید از `useStore` |
| `user-menu.tsx` | وضعیت ورود کاربر |
| `notices-bell.tsx` | اعلان‌های زنده (localStorage) |
| `newsletter-form.tsx` | اعتبارسنجیِ زنده + toast |
| `back-to-top.tsx` | `scroll` listener |
| `header-spacer.tsx` | `ResizeObserver` روی هدرِ ثابت |
| `click-progress.tsx` | نوارِ پیشرفتِ ناوبری |
| `mode-toggle.tsx` / `theme-provider.tsx` | تمِ تیره/روشن |

### ۲.۲ صفحه‌های ذاتاً تعاملی
| فایل | چرا |
|---|---|
| `shop/explorer.tsx` | کلِ صفحه یک ماشینِ فیلتر است: `useSearchParams`/`router.replace`، اسلایدرِ قیمت، سوییچ‌ها، Sheet و Popover. حتی نان‌بردکرامب و شمارندهٔ نتایج هم از همان state می‌آیند؛ تکه‌کردنش فقط prop-drilling اضافه می‌کرد بدون سودِ باندل. |
| `profile/profile.tsx` | تمام محتوایش دادهٔ کاربر است (سفارش‌ها، علاقه‌مندی‌ها، فرمِ پروفایل) که در مرورگر ذخیره می‌شود. |
| `product/[id]/buy.tsx` | گالری، انتخاب سایز/تعداد، کدِ تخفیف، دیالوگِ تسویه. |
| `home/components/quotes.tsx` | هر اسلاید به `selectedScrollSnap` و «مفید بود» واکنش می‌دهد؛ محتوا از وضعیت جدا نیست. |
| `home/components/search.tsx` | جست‌وجوی زنده. |
| `festive/campaign-banner-body.tsx` | جشنوارهٔ فعالِ ادمین از localStorage. |
| `tryon/studio.tsx` | استودیوی AI (فعلاً غیرفعال؛ جایگزینِ `TryOnComingSoon` است). |

### ۲.۳ پریمیتیوهای shadcn/Radix (`components/ui`)
`dialog`, `sheet`, `popover`, `select`, `tabs`, `accordion`, `switch`, `slider`,
`toggle`, `toggle-group`, `dropdown-menu`, `navigation-menu`, `avatar`, `label`,
`scroll-area`, `input-otp`, `pagination`, `sonner`, `slider-arrow`, `image-upload`
— همگی داخل خودشان hook و context دارند؛ حذفِ `"use client"` از آن‌ها باعثِ خطای
build می‌شود. تنها موردی که واقعاً بی‌دلیل client بود (`table.tsx`) اصلاح شد.

### ۲.۴ پنل ادمین (`(admin)` و `features/admin`)
کل پنل پشتِ لاگین است، ایندکس نمی‌شود و **دیتابیسش localStorage است**
(`admin-store.tsx`, `admin-sync.ts`). یعنی داده اصلاً روی سرور وجود ندارد که
بشود روی سرور رندر کرد؛ Server Component کردنِ این صفحه‌ها فقط یک اسکلتِ خالی
تولید می‌کرد که بلافاصله با دادهٔ کلاینت جایگزین می‌شد. تصمیمِ آگاهانه: **بماند
client**.

> مسیرِ مهاجرت وقتی API واقعی آمد: `admin-sync.ts` به `fetch` سمتِ سرور تبدیل
> می‌شود → صفحه‌ها `async` Server Component می‌شوند و جدول‌ها/فرم‌ها به‌عنوان
> جزیرهٔ client با `initialData` تغذیه می‌شوند. دقیقاً همان الگویی که در این پاس
> برای `/articles` و `/product/[id]` پیاده شد.

---

## ۳) نتیجهٔ اندازه‌گیری

بیلدِ production، مجموعِ اسکریپت‌های ارجاع‌شده در HTML اولیهٔ هر مسیر:

| مسیر | JS (gzip) قبل | JS (gzip) بعد | HTML سرور (قبل → بعد) |
|---|---|---|---|
| `/` | ۳۸۹ KB | **۳۸۱ KB** | ۵۸۹ → ۵۹۸ KB |
| `/shop` | ۳۹۱ KB | **۳۸۲ KB** | ۱۲۱ → ۱۲۲ KB |
| `/product/0` | ۳۸۴ KB | **۳۷۵ KB** | ۱۷۶ → ۲۱۴ KB |
| `/articles` | ۳۷۵ KB | **۳۶۶ KB** | ۱۲۱ → ۱۳۰ KB |
| `/collab` | ۳۷۷ KB | **۳۶۶ KB** | ۱۳۵ → ۱۴۵ KB |
| `/tryon` | ۳۷۶ KB | **۳۶۵ KB** | ۱۳۰ → ۱۳۸ KB |
| `/about` | ۳۷۳ KB | **۳۶۴ KB** | ۱۴۵ KB |

بالا رفتنِ HTML و پایین آمدنِ JS یعنی دقیقاً همان چیزی که می‌خواستیم: مارک‌آپ از
مرورگر به سرور منتقل شده است.

**چرا کاهش «فقط» ~۱۰KB است؟** چون بیش از ۹۰٪ باندل، *پوستهٔ مشترک* است نه
صفحه‌ها: runtime نکست/ری‌اکت + Radix + `react-hook-form`+`zod` (فرمِ خبرنامهٔ
فوتر در همهٔ صفحه‌ها) + sonner + آیکون‌ها. صفحه‌ها خودشان قبلاً هم سبک بودند.
گام‌های بعدی برای همان پوستهٔ مشترک (پیشنهاد، انجام‌نشده):

1. فرمِ خبرنامهٔ فوتر بدون `react-hook-form`/`zod` (اعتبارسنجیِ بومیِ HTML) →
   حذفِ این دو از باندلِ صفحه‌هایی که فرم دیگری ندارند.
2. `dynamic import` برای بدنهٔ `CartSheet` و `MobileNav` (مثل مودالِ ورود).
3. جایگزینیِ آیکون‌های `lucide-react` با SVG درون‌خطی در Server Componentها.

---

## ۴) اعتبارسنجیِ «هیچ‌چیز خراب نشد»

- **رگرسیونِ بصری:** ۳۶ اسکرین‌شاتِ تمام‌صفحه (۱۸ مسیر × موبایل ۳۹۰px و دسکتاپ
  ۱۳۶۶px) قبل و بعد، با `pixelmatch` مقایسه شد → تفاوتِ معنادار: **صفر**
  (تنها اختلاف‌ها مربوط به گرم‌شدنِ کشِ بهینه‌سازیِ تصویر در دیو سرور بود که با
  بازبینیِ دستی تأیید شد).
- **کنسول:** در همان ۳۶ بارگذاری، **۰ خطا** و ۰ هشدارِ hydration.
- **تستِ عملکردی (production build):** باز شدنِ مودالِ ورود (چانکِ lazy)، سبد
  خرید، فلشِ کروسل مجله، تعویضِ تبِ «استایل‌های منتخب»، رندرِ فهرست و متنِ مقاله
  در HTML سرور، تب‌های صفحهٔ محصول، افزودن به سبد، اعتبارسنجیِ فرمِ همکاری و
  فرمِ «خبرم کن» → **۱۰ از ۱۰ سبز**.
- `tsc --noEmit` بدون خطا، `eslint` بدون error، `npm audit` صفر آسیب‌پذیری.
