"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Save } from "lucide-react";
import { useAdmin } from "@/components/admin";
import { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ui/image-upload";
import { AdminPageHeader } from "@/components/admin";
import { AppForm, Field, MoneyField, SelectField, SwitchField, TextareaField, TextField, useAppForm } from "@/components/form";
import { parseFaNumber } from "@/lib/forms";
import { SEASONS } from "@/lib/constants";
import { CAT_OPTIONS, productDefaults, productSchema, productValues, type ProductValues } from "../_lib/product-schema";

const DEFAULT_IMG = "/brand/look-party.jpg";

export function ProductForm({ product }: { product?: Product }) {
  const { upsertProduct, db } = useAdmin();
  const router = useRouter();
  const isNew = !product;

  const form = useAppForm({ schema: productSchema, defaultValues: productDefaults });

  useEffect(() => {
    if (product) form.reset(productValues(product));
  }, [product, form]);

  function submit(v: ProductValues) {
    upsertProduct({
      id: product?.id ?? Math.max(999, ...db.products.map((x) => x.id)) + 1,
      rate: product?.rate ?? 4.8,
      sold: product?.sold ?? 0,
      name: v.name.trim(),
      cat: v.cat,
      season: v.season,
      price: parseFaNumber(v.price),
      old: v.old ? parseFaNumber(v.old) : undefined,
      disc: v.disc.trim() || undefined,
      badge: v.badge.trim() || undefined,
      desc: v.desc.trim(),
      img: v.img || product?.img || DEFAULT_IMG,
      stock: v.stock,
    });
    router.push("/admin/products");
  }

  return (
    <AppForm form={form} onSubmit={submit} ariaLabel={isNew ? "محصول جدید" : "ویرایش محصول"} className="pb-24" notify>
      <AdminPageHeader
        kicker={isNew ? "NEW PRODUCT" : "EDIT PRODUCT"}
        title={isNew ? "محصول جدید" : "ویرایش محصول"}
        description={isNew ? "مشخصات، قیمت، تصاویر و تنوع‌های محصول جدید را با دقت تکمیل کنید." : "اطلاعات محصول را ویرایش کنید؛ تغییرات پس از ذخیره در کاتالوگ اعمال می‌شوند."}
        action={
          <Button asChild variant="outline" className="h-11 rounded-xl px-4">
            <Link href="/admin/products" aria-label="بازگشت به محصولات">
              <ArrowRight className="size-4" /> بازگشت به محصولات
            </Link>
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* مشخصات */}
        <section className="rounded-[22px] max-[639px]:rounded-[19px] border border-navy/9 bg-paper/94 shadow-[0_20px_48px_-34px_rgba(14,42,71,0.38),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[18px] transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:border-gold/40 hover:shadow-[0_24px_52px_-34px_rgba(14,42,71,0.44)] dark:border-gold-soft/16 dark:bg-[rgba(16,43,70,0.72)] dark:shadow-[0_25px_60px_-35px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.045),0_0_0_1px_rgba(193,147,87,0.025)] dark:hover:border-gold-soft/30 dark:hover:shadow-[0_28px_64px_-36px_rgba(0,0,0,0.88),0_0_34px_rgba(193,147,87,0.035)] space-y-4 p-5 sm:p-6">
          <h2 className="text-sm font-black text-gold">مشخصات</h2>

          <TextField name="name" label="نام محصول" placeholder="مثلاً: پیراهن مجلسی الماس طلایی" maxLength={80} required />
          <div className="grid grid-cols-2 gap-3">
            <SelectField name="cat" label="دسته‌بندی" options={CAT_OPTIONS} required />
            <SelectField name="season" label="زیرشاخه (فصل)" options={[...SEASONS]} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <MoneyField name="price" label="قیمت (تومان)" hint="حداقل ۱٬۰۰۰ تومان" required />
            <MoneyField name="old" label="قیمت قبل (اختیاری)" hint="اگر پر شود باید بیشتر از قیمت باشد" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextField name="disc" label="تخفیف (اختیاری)" placeholder="۱۷٪" maxLength={20} />
            <TextField name="badge" label="نشان (اختیاری)" placeholder="پرفروش / جدید" maxLength={20} />
          </div>

          <TextareaField
            name="desc"
            label="توضیح"
            placeholder="جنس پارچه، سایزبندی و ویژگی‌ها…"
            min={15}
            maxLength={800}
            required
          />
        </section>

        {/* تصویر + وضعیت */}
        <section className="space-y-5">
          <div className="rounded-[22px] max-[639px]:rounded-[19px] border border-navy/9 bg-paper/94 shadow-[0_20px_48px_-34px_rgba(14,42,71,0.38),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[18px] transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:border-gold/40 hover:shadow-[0_24px_52px_-34px_rgba(14,42,71,0.44)] dark:border-gold-soft/16 dark:bg-[rgba(16,43,70,0.72)] dark:shadow-[0_25px_60px_-35px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.045),0_0_0_1px_rgba(193,147,87,0.025)] dark:hover:border-gold-soft/30 dark:hover:shadow-[0_28px_64px_-36px_rgba(0,0,0,0.88),0_0_34px_rgba(193,147,87,0.035)] space-y-4 p-5 sm:p-6">
            <h2 className="text-sm font-black text-gold">تصویر محصول</h2>
            <Field name="img" skin="admin" noShell labelClassName="sr-only" label="عکس محصول">
              {({ field }) => (
                <ImageUpload
                  value={(field.value as string) || product?.img}
                  onChange={(v) => field.onChange(v ?? "")}
                  onClear={() => field.onChange("")}
                  label="عکس محصول را بکشید و رها کنید یا کلیک کنید"
                />
              )}
            </Field>

            <SwitchField
              name="stock"
              label="موجود در انبار"
              description="در صورت خاموش بودن، «ناموجود» نمایش داده می‌شود."
            />
          </div>
        </section>
      </div>

      {/* نوارِ چسبانِ عملیات — فقط رویِ ستونِ محتوا، نه رویِ منوی کناری */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-navy/8 bg-fog/90 px-4 py-3 backdrop-blur-xl dark:border-gold/20 dark:bg-navy-deep/90 lg:start-[272px]">
        <div className="flex items-center justify-end gap-2">
          <Button asChild type="button" variant="outline" className="h-11 rounded-2xl">
            <Link href="/admin/products">انصراف</Link>
          </Button>
          <Button type="submit" variant="navy" className="h-11 rounded-2xl px-6">
            <Save className="size-4" /> {isNew ? "ساخت محصول" : "ذخیره تغییرات"}
          </Button>
        </div>
      </div>
    </AppForm>
  );
}
