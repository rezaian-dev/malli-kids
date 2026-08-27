# ساختار پروژه — ملی‌کیدز

معماری **feature-based**: هر قابلیت مالکِ کامپوننت‌ها، منطق و دادهٔ خودش است.
لایه‌های عمومی (`components/ui`, `components/shared`, `lib`, `hooks`, `types`)
هیچ وابستگی‌ای به `features/` ندارند.

```
src/
├── app/                       ← فقط مسیریابی و ترکیب صفحه (بدون منطق دامنه)
│   ├── layout.tsx             ← ThemeProvider + Store + Toaster
│   ├── globals.css
│   ├── (storefront)/          ← ویترین عمومی: Header/Footer/AuthModal
│   ├── (admin)/               ← پنل مدیریت: AdminShell
│   └── api/tryon/
│
├── features/                  ← ★ قلب پروژه
│   ├── admin/
│   │   ├── components/  admin-shell, sales-chart
│   │   ├── lib/         nav, sales, admin-store, admin-data
│   │   └── index.ts     ← barrel (تنها درِ ورودی از بیرون)
│   ├── auth/
│   │   ├── components/  auth-modal
│   │   └── index.ts
│   ├── festive/
│   │   ├── festive-banner.tsx
│   │   ├── lib/         occasions (تقویم جلالی + بنرها)
│   │   └── index.ts
│   ├── home/
│   │   ├── components/  landing, journal, quotes, search, ornaments
│   │   ├── sections/    hero, marquee, find, looks, categories, …
│   │   └── index.ts
│   └── product/
│       ├── components/  product-card, product-card-actions, catalog
│       └── index.ts
│
├── components/                ← فقط چیزهای بین‌قابلیتی
│   ├── ui/                    ← shadcn/ui (دست‌نخورده، توسط CLI مدیریت می‌شود)
│   ├── layout/                ← header, footer (پوستهٔ سایت)
│   └── shared/                ← faq, intro, theme-provider, mode-toggle
│
├── hooks/                     ← use-pagination
├── lib/
│   ├── data/                  ← nav, nav-icons, pages, products, index (data seam)
│   ├── constants.ts
│   ├── format.ts              ← ارقام فارسی، تومان، نام
│   ├── store.tsx              ← استور UI (user + authOpen + toast)
│   └── utils.ts               ← cn, shell
├── types/                     ← product, user, festive, pagination, admin
└── fonts/
```

## قواعد

| قاعده | چرا |
| --- | --- |
| از بیرونِ یک feature فقط `@/features/<name>` را import کن، نه مسیر عمیق | جابه‌جایی فایل داخل feature هیچ‌جا را نمی‌شکند |
| داخل همان feature، مسیر مستقیم بزن (نه barrel خودش) | جلوگیری از حلقهٔ import |
| `features/*` نباید به `features/*` دیگر وابسته شود | اگر لازم شد، آن قطعه به `components/shared` یا `lib` منتقل می‌شود |
| `components/ui/` را دستی ویرایش نکن مگر لازم باشد | با `shadcn add` قابل به‌روزرسانی می‌ماند |
| `app/` فقط چینش صفحه | منطق در feature می‌ماند و تست‌پذیر است |

## نگاشت مسیرهای قدیمی → جدید

| قبل | بعد |
| --- | --- |
| `components/admin/shell.tsx` | `features/admin/components/admin-shell.tsx` |
| `components/admin/nav.ts` · `sales.ts` | `features/admin/lib/` |
| `lib/admin-store.tsx` · `lib/admin-data.ts` | `features/admin/lib/` |
| `components/home/*` | `features/home/components/` |
| `components/home/sections/*` | `features/home/sections/` |
| `components/product/*` | `features/product/components/` |
| `components/common/catalog.tsx` | `features/product/components/catalog.tsx` |
| `components/common/faq.tsx` · `intro.tsx` | `components/shared/` |
| `components/overlays/auth-modal.tsx` | `features/auth/components/` |
| `components/layout/festive-banner.tsx` | `features/festive/` |
| `lib/occasions.ts` | `features/festive/lib/occasions.ts` |
| `lib/use-pagination.ts` | `hooks/use-pagination.ts` |
| `lib/nav-icons.tsx` | `lib/data/nav-icons.tsx` |
| `lib/data.ts` | `lib/data/index.ts` |
| `components/theme-provider.tsx` · `mode-toggle.tsx` | `components/shared/` |
| ~~`components/overlays/cart-drawer.tsx`~~ | حذف شد |
| ~~`types/cart.ts`~~ | حذف شد |

`components/common/` و `components/overlays/` حذف شدند.
