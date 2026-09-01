"use client";

import Link from "next/link";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ImagePlus, Save, Trash2 } from "lucide-react";

import { AdminPageHeader, useAdmin } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CATS, SEASONS } from "@/lib/constants";
import { parseFaNumber } from "@/lib/digits";
import { cn } from "@/lib/utils";
import { adminGlassCard } from "@/lib/admin/admin-chrome";
import type { Product } from "@/types";

const DEFAULT_IMG = "/brand/look-party.jpg";
const CAT_OPTIONS = CATS.filter((item) => item !== "همه");

const FIELD_LABEL = "text-navy/55 dark:text-wheat text-xs font-black";
const FIELD_INPUT =
  "border-navy/12 dark:border-gold/20 h-11 rounded-2xl bg-transparent px-4 text-sm";
const SELECT_TRIGGER = cn(FIELD_INPUT, "shadow-none");
const FIELD_ERROR = "text-rose text-xs font-bold";
const FORM_SECTION = cn(adminGlassCard, "space-y-4 p-5 sm:p-6");
const SECTION_TITLE = "text-gold text-sm font-black";

type ProductFormValues = {
  name: string;
  cat: string;
  season: string;
  price: string;
  old: string;
  disc: string;
  badge: string;
  desc: string;
  img: string;
  stock: boolean;
};

type ProductFormErrors = Partial<
  Record<keyof ProductFormValues | "form", string>
>;

function getInitialValues(product?: Product): ProductFormValues {
  return {
    name: product?.name ?? "",
    cat: product?.cat ?? CAT_OPTIONS[0],
    season: product?.season ?? SEASONS[0],
    price: product ? String(product.price) : "",
    old: product?.old ? String(product.old) : "",
    disc: product?.disc ?? "",
    badge: product?.badge ?? "",
    desc: product?.desc ?? "",
    img: product?.img ?? "",
    stock: product?.stock ?? true,
  };
}

function validateProductForm(values: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {};

  const name = values.name.trim();
  if (name.length < 3) errors.name = "نام محصول باید حداقل ۳ حرف باشد";
  else if (name.length > 80) errors.name = "نام محصول حداکثر ۸۰ نویسه است";

  if (!CAT_OPTIONS.includes(values.cat as (typeof CAT_OPTIONS)[number])) {
    errors.cat = "دسته‌بندی را انتخاب کنید";
  }

  if (!SEASONS.includes(values.season as (typeof SEASONS)[number])) {
    errors.season = "زیرشاخه را انتخاب کنید";
  }

  const price = parseFaNumber(values.price);
  if (!Number.isFinite(price)) {
    errors.price = "قیمت معتبر وارد کنید";
  } else if (price < 1000 || price > 500_000_000) {
    errors.price = "قیمت باید بین ۱٬۰۰۰ تا ۵۰۰٬۰۰۰٬۰۰۰ باشد";
  }

  if (values.old.trim()) {
    const oldPrice = parseFaNumber(values.old);
    if (!Number.isFinite(oldPrice)) {
      errors.old = "قیمت قبل معتبر نیست";
    } else if (oldPrice < 0 || oldPrice > 500_000_000) {
      errors.old = "قیمت قبل باید بین ۰ تا ۵۰۰٬۰۰۰٬۰۰۰ باشد";
    } else if (Number.isFinite(price) && oldPrice <= price) {
      errors.old = "قیمتِ قبل باید بیشتر از قیمتِ فعلی باشد";
    }
  }

  const discount = values.disc.trim();
  if (discount) {
    const amount = parseFaNumber(discount.replace(/[٪%\s]/g, ""));
    if (!Number.isFinite(amount) || amount < 1 || amount > 99) {
      errors.disc = "تخفیف را عدد بنویسید، مثل «۱۷٪»";
    }
  }

  if (values.badge.trim().length > 20) {
    errors.badge = "نشان حداکثر ۲۰ نویسه است";
  }

  const desc = values.desc.trim();
  if (desc.length < 15) errors.desc = "حداقل ۱۵ حرف بنویسید تا توضیح مفید باشد";
  else if (desc.length > 800) errors.desc = "توضیح حداکثر ۸۰۰ نویسه است";

  return errors;
}

export function ProductForm({ product }: { product?: Product }) {
  const { upsertProduct, db } = useAdmin();
  const router = useRouter();
  const isNew = !product;
  const [values, setValues] = useState<ProductFormValues>(() =>
    getInitialValues(product),
  );
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [imageBusy, setImageBusy] = useState(false);

  function updateValue<K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      form: undefined,
    }));
  }

  async function onImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setImageBusy(true);
    setErrors((current) => ({ ...current, img: undefined, form: undefined }));

    try {
      const { compressToDataUrl } =
        await import("@/components/ui/image-upload");
      const dataUrl = await compressToDataUrl(file);
      updateValue("img", dataUrl);
    } catch {
      setErrors((current) => ({
        ...current,
        img: "آپلود تصویر ناموفق بود. دوباره تلاش کنید",
      }));
    } finally {
      setImageBusy(false);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateProductForm(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors({ ...nextErrors, form: "فیلدهای مشخص‌شده را اصلاح کنید" });
      return;
    }

    upsertProduct({
      id:
        product?.id ?? Math.max(999, ...db.products.map((item) => item.id)) + 1,
      rate: product?.rate ?? 4.8,
      sold: product?.sold ?? 0,
      name: values.name.trim(),
      cat: values.cat,
      season: values.season as Product["season"],
      price: parseFaNumber(values.price),
      old: values.old.trim() ? parseFaNumber(values.old) : undefined,
      disc: values.disc.trim() || undefined,
      badge: values.badge.trim() || undefined,
      desc: values.desc.trim(),
      img: values.img || DEFAULT_IMG,
      stock: values.stock,
    });

    router.push("/admin/products");
  }

  const preview = values.img || DEFAULT_IMG;

  return (
    <form onSubmit={onSubmit} noValidate className="pb-24">
      <AdminPageHeader
        kicker={isNew ? "NEW PRODUCT" : "EDIT PRODUCT"}
        title={isNew ? "محصول جدید" : "ویرایش محصول"}
        description={
          isNew
            ? "مشخصات، قیمت، تصاویر و تنوع‌های محصول جدید را با دقت تکمیل کنید."
            : "اطلاعات محصول را ویرایش کنید؛ تغییرات پس از ذخیره در کاتالوگ اعمال می‌شوند."
        }
        action={
          <Button asChild variant="outline" className="h-11 rounded-xl px-4">
            <Link href="/admin/products" aria-label="بازگشت به محصولات">
              <ArrowRight className="size-4" /> بازگشت به محصولات
            </Link>
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <section className={FORM_SECTION}>
          <div className="flex items-start justify-between gap-3">
            <h2 className={SECTION_TITLE}>مشخصات</h2>
            {errors.form ? (
              <p role="alert" className={FIELD_ERROR}>
                {errors.form}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="product-name" className={FIELD_LABEL}>
              نام محصول
            </label>
            <Input
              id="product-name"
              value={values.name}
              onChange={(event) => updateValue("name", event.target.value)}
              placeholder="مثلاً: پیراهن مجلسی الماس طلایی"
              maxLength={80}
              aria-invalid={Boolean(errors.name)}
              className={FIELD_INPUT}
              required
            />
            <FieldNote error={errors.name} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="product-cat" className={FIELD_LABEL}>
                دسته‌بندی
              </label>
              <Select
                value={values.cat}
                onValueChange={(value) => updateValue("cat", value)}
                dir="rtl"
              >
                <SelectTrigger
                  id="product-cat"
                  aria-invalid={Boolean(errors.cat) || undefined}
                  className={SELECT_TRIGGER}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  {CAT_OPTIONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldNote error={errors.cat} />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="product-season" className={FIELD_LABEL}>
                زیرشاخه (فصل)
              </label>
              <Select
                value={values.season}
                onValueChange={(value) => updateValue("season", value)}
                dir="rtl"
              >
                <SelectTrigger
                  id="product-season"
                  aria-invalid={Boolean(errors.season) || undefined}
                  className={SELECT_TRIGGER}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="start">
                  {SEASONS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldNote error={errors.season} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="product-price" className={FIELD_LABEL}>
                قیمت (تومان)
              </label>
              <Input
                id="product-price"
                value={values.price}
                onChange={(event) => updateValue("price", event.target.value)}
                inputMode="numeric"
                placeholder="حداقل ۱٬۰۰۰ تومان"
                aria-invalid={Boolean(errors.price)}
                className={FIELD_INPUT}
                required
              />
              <FieldNote error={errors.price} />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="product-old" className={FIELD_LABEL}>
                قیمت قبل (اختیاری)
              </label>
              <Input
                id="product-old"
                value={values.old}
                onChange={(event) => updateValue("old", event.target.value)}
                inputMode="numeric"
                placeholder="باید بیشتر از قیمت باشد"
                aria-invalid={Boolean(errors.old)}
                className={FIELD_INPUT}
              />
              <FieldNote error={errors.old} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="product-disc" className={FIELD_LABEL}>
                تخفیف (اختیاری)
              </label>
              <Input
                id="product-disc"
                value={values.disc}
                onChange={(event) => updateValue("disc", event.target.value)}
                placeholder="۱۷٪"
                maxLength={20}
                aria-invalid={Boolean(errors.disc)}
                className={FIELD_INPUT}
              />
              <FieldNote error={errors.disc} />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="product-badge" className={FIELD_LABEL}>
                نشان (اختیاری)
              </label>
              <Input
                id="product-badge"
                value={values.badge}
                onChange={(event) => updateValue("badge", event.target.value)}
                placeholder="پرفروش / جدید"
                maxLength={20}
                aria-invalid={Boolean(errors.badge)}
                className={FIELD_INPUT}
              />
              <FieldNote error={errors.badge} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="product-desc" className={FIELD_LABEL}>
              توضیح
            </label>
            <Textarea
              id="product-desc"
              value={values.desc}
              onChange={(event) => updateValue("desc", event.target.value)}
              placeholder="جنس پارچه، سایزبندی و ویژگی‌ها…"
              maxLength={800}
              aria-invalid={Boolean(errors.desc)}
              className="border-navy/12 dark:border-gold/20 min-h-36 rounded-2xl bg-transparent px-4 py-3 text-sm"
              required
            />
            <FieldNote error={errors.desc} />
          </div>
        </section>

        <section className="space-y-5">
          <div className={FORM_SECTION}>
            <h2 className={SECTION_TITLE}>تصویر محصول</h2>

            <div
              className={cn(
                "overflow-hidden rounded-[22px] border bg-white/55",
                "border-navy/10",
                "dark:border-gold/14 dark:bg-white/4",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- 🪶 Admin previews can use local files and data URLs. */}
              <img
                src={preview}
                alt={values.name || "پیش‌نمایش محصول"}
                className="h-64 w-full object-cover"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <label className="inline-flex">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onImageChange}
                  disabled={imageBusy}
                />
                <span
                  className={cn(
                    "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl border bg-white/70 px-4 text-sm font-black transition",
                    "border-navy/12 text-navy hover:border-gold/45",
                    "dark:border-gold/20 dark:text-ivory dark:bg-white/5",
                  )}
                >
                  <ImagePlus className="size-4" />
                  {imageBusy
                    ? "در حال پردازش تصویر…"
                    : values.img
                      ? "تغییر تصویر"
                      : "آپلود تصویر"}
                </span>
              </label>
              {values.img ? (
                <button
                  type="button"
                  onClick={() => updateValue("img", "")}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-2xl px-4 text-sm font-black transition",
                    "bg-rose/10 text-rose hover:bg-rose/15",
                  )}
                >
                  <Trash2 className="size-4" /> حذف تصویر
                </button>
              ) : null}
            </div>
            <FieldNote
              error={errors.img}
              hint="در صورت خالی بودن، تصویر پیش‌فرض برند ذخیره می‌شود"
            />

            <label
              className={cn(
                "flex items-center justify-between rounded-2xl border px-4 py-3",
                "border-navy/8",
                "dark:border-gold/20",
              )}
            >
              <span className="space-y-1">
                <span className="block text-sm font-black">موجود در انبار</span>
                <span className="text-navy/45 dark:text-wheat block text-[11px] font-bold">
                  در صورت خاموش بودن، «ناموجود» نمایش داده می‌شود.
                </span>
              </span>
              <Switch
                checked={values.stock}
                onCheckedChange={(checked) => updateValue("stock", checked)}
              />
            </label>
          </div>
        </section>
      </div>

      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t px-4 py-3 backdrop-blur-xl lg:inset-s-68",
          "border-navy/8 bg-fog/90",
          "dark:border-gold/20 dark:bg-navy-deep/90",
        )}
      >
        <div className="flex items-center justify-end gap-2">
          <Button
            asChild
            type="button"
            variant="outline"
            className="h-11 rounded-2xl"
          >
            <Link href="/admin/products">انصراف</Link>
          </Button>
          <Button
            type="submit"
            variant="navy"
            className="h-11 rounded-2xl px-6"
          >
            <Save className="size-4" /> {isNew ? "ساخت محصول" : "ذخیره تغییرات"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function FieldNote({ error, hint }: { error?: string; hint?: string }) {
  if (!error && !hint) return null;

  return error ? (
    <p role="alert" className={FIELD_ERROR}>
      {error}
    </p>
  ) : (
    <p className="text-navy/45 dark:text-wheat text-[11px] font-bold">{hint}</p>
  );
}
