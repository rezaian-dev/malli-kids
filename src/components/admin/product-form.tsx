"use client";

import Link from "next/link";
import { useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ImagePlus, Save, Trash2 } from "lucide-react";

import { AdminPageHeader } from "@/components/admin";
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
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { adminGlassCard } from "@/lib/admin/admin-chrome";
import {
  createProductAction,
  updateProductAction,
} from "@/app/(admin)/admin/products/_lib/actions";
import type { Product } from "@/types";

const MAX_IMAGES = 6;
const CAT_OPTIONS = CATS.filter((item) => item !== "همه");

const FIELD_LABEL = "text-navy/70 dark:text-wheat text-xs font-black";
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
  images: string[];
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
    images: product?.images ?? [],
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

  if (values.images.length === 0) {
    errors.images = "حداقل یک تصویر بارگذاری کنید";
  }

  return errors;
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const isNew = !product;
  const [values, setValues] = useState<ProductFormValues>(() =>
    getInitialValues(product),
  );
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [imageBusy, setImageBusy] = useState(false);
  const [pending, startTransition] = useTransition();

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

  async function onImagesChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(
      0,
      Math.max(0, MAX_IMAGES - values.images.length),
    );
    event.target.value = "";
    if (files.length === 0) return;

    setImageBusy(true);
    setErrors((current) => ({ ...current, images: undefined, form: undefined }));

    try {
      const { compressToDataUrl } =
        await import("@/components/ui/image-upload");
      const dataUrls = await Promise.all(files.map((file) => compressToDataUrl(file)));
      updateValue("images", [...values.images, ...dataUrls]);
    } catch {
      setErrors((current) => ({
        ...current,
        images: "آپلود تصویر ناموفق بود. دوباره تلاش کنید",
      }));
    } finally {
      setImageBusy(false);
    }
  }

  function removeImage(index: number) {
    updateValue(
      "images",
      values.images.filter((_, i) => i !== index),
    );
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateProductForm(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors({ ...nextErrors, form: "فیلدهای مشخص‌شده را اصلاح کنید" });
      return;
    }

    const payload = {
      name: values.name.trim(),
      cat: values.cat,
      season: values.season as NonNullable<Product["season"]>,
      price: parseFaNumber(values.price),
      old: values.old.trim() ? parseFaNumber(values.old) : undefined,
      disc: values.disc.trim() || undefined,
      badge: values.badge.trim() || undefined,
      desc: values.desc.trim(),
      images: values.images,
      stock: values.stock,
    };

    startTransition(async () => {
      const result = product
        ? await updateProductAction(product.id, payload)
        : await createProductAction(payload);

      if (!result.ok) {
        setErrors({ form: result.error });
        toast.error(result.error);
        return;
      }

      toast.success(isNew ? "محصول ساخته شد" : "محصول ذخیره شد", {
        description: payload.name,
      });
      router.push("/admin/products");
    });
  }

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
            <h2 className={SECTION_TITLE}>تصاویر محصول</h2>

            <div
              className={cn(
                "overflow-hidden rounded-[22px] border bg-white/55",
                "border-navy/10",
                "dark:border-gold/14 dark:bg-white/4",
              )}
            >
              {values.images[0] ? (
                /* eslint-disable-next-line @next/next/no-img-element -- 🪶 Admin previews can use local files and data URLs. */
                <img
                  src={values.images[0]}
                  alt={values.name || "پیش‌نمایش محصول"}
                  className="h-64 w-full object-cover"
                />
              ) : (
                <div className="text-navy/70 dark:text-wheat/70 flex h-64 items-center justify-center text-sm font-bold">
                  هنوز تصویری بارگذاری نشده
                </div>
              )}
            </div>

            {values.images.length > 1 ? (
              <div className="flex flex-wrap gap-2">
                {values.images.slice(1).map((src, i) => (
                  <div key={src} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element -- 🪶 Admin previews can use local files and data URLs. */}
                    <img
                      src={src}
                      alt={`تصویر ${i + 2} محصول`}
                      className="border-navy/10 dark:border-gold/20 size-16 rounded-xl border object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i + 1)}
                      aria-label="حذف این تصویر"
                      className="bg-rose absolute -inset-e-1.5 -top-1.5 grid size-5 place-items-center rounded-full text-white"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              {values.images.length < MAX_IMAGES ? (
                <label className="inline-flex">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={onImagesChange}
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
                      : values.images.length
                        ? "افزودن تصویر"
                        : "آپلود تصویر (یک یا چند عکس)"}
                  </span>
                </label>
              ) : null}
              {values.images[0] ? (
                <button
                  type="button"
                  onClick={() => removeImage(0)}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-2xl px-4 text-sm font-black transition",
                    "bg-rose/10 text-rose hover:bg-rose/15",
                  )}
                >
                  <Trash2 className="size-4" /> حذف تصویر اصلی
                </button>
              ) : null}
            </div>
            <FieldNote
              error={errors.images}
              hint={`حداقل یک تصویر لازم است؛ تصویر اول، تصویر اصلی محصول است (حداکثر ${MAX_IMAGES} تصویر).`}
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
                <span className="text-navy/70 dark:text-wheat block text-[11px] font-bold">
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
            disabled={pending}
          >
            <Save className="size-4" />{" "}
            {pending ? "در حال ذخیره…" : isNew ? "ساخت محصول" : "ذخیره تغییرات"}
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
    <p className="text-navy/70 dark:text-wheat text-[11px] font-bold">{hint}</p>
  );
}
