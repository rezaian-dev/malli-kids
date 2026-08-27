"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Save } from "lucide-react";
import { useAdmin } from "@/features/admin";
import { CATS } from "@/lib/constants";
import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageUpload } from "@/components/ui/image-upload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHead } from "@/features/admin";
import { toast } from "sonner";

const CAT_OPTIONS = CATS.filter((c) => c !== "همه");

export function ProductForm({ product }: { product?: Product }) {
  const { upsertProduct } = useAdmin();
  const router = useRouter();
  const isNew = !product;

  const [name, setName] = useState(product?.name ?? "");
  const [cat, setCat] = useState(product?.cat ?? "دخترانه");
  const [img, setImg] = useState(product?.img ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [old, setOld] = useState(product?.old ? String(product.old) : "");
  const [disc, setDisc] = useState(product?.disc ?? "");
  const [badge, setBadge] = useState(product?.badge ?? "");
  const [desc, setDesc] = useState(product?.desc ?? "");
  const [stock, setStock] = useState(product?.stock ?? true);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (name.trim().length < 2) return toast("نام محصول را وارد کنید");
    if (!Number(price)) return toast("قیمت معتبر وارد کنید");
    upsertProduct({
      id: product?.id ?? -1,
      rate: product?.rate ?? 4.8,
      sold: product?.sold ?? 0,
      name: name.trim(),
      cat,
      price: Number(price),
      old: Number(old) || undefined,
      disc: disc.trim() || undefined,
      badge: badge.trim() || undefined,
      desc: desc.trim(),
      img: img || product?.img || "/brand/look-party.jpg",
      stock,
    });
    router.push("/admin/products");
  }


  return (
    <form onSubmit={submit} className="pb-24">
      <div className="mb-6 flex items-center gap-3">
        <Button asChild variant="outline" size="icon" className="size-10 shrink-0 rounded-full">
          <Link href="/admin/products" aria-label="بازگشت">
            <ArrowRight className="size-4" />
          </Link>
        </Button>
        <PageHead kicker={isNew ? "NEW PRODUCT" : "EDIT PRODUCT"} title={isNew ? "محصول جدید" : "ویرایش محصول"} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Details */}
        <section className="admin-card space-y-4 p-5 sm:p-6">
          <h2 className="text-sm font-black text-gold">مشخصات</h2>

          <div>
            <Label htmlFor="name" className="text-xs font-black">
              نام محصول
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثلاً: پیراهن مجلسی الماس طلایی" className="mt-1.5 h-11 rounded-2xl" />
          </div>

          <div>
            <Label className="text-xs font-black">دسته‌بندی</Label>
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger className="mt-1.5 h-11 rounded-2xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CAT_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="price" className="text-xs font-black">
                قیمت (تومان)
              </Label>
              <Input id="price" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} placeholder="۱۲۹۰۰۰۰" className="mt-1.5 h-11 rounded-2xl" dir="ltr" />
            </div>
            <div>
              <Label htmlFor="old" className="text-xs font-black">
                قیمت قبل (اختیاری)
              </Label>
              <Input id="old" inputMode="numeric" value={old} onChange={(e) => setOld(e.target.value.replace(/\D/g, ""))} placeholder="—" className="mt-1.5 h-11 rounded-2xl" dir="ltr" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="disc" className="text-xs font-black">
                تخفیف (اختیاری)
              </Label>
              <Input id="disc" value={disc} onChange={(e) => setDisc(e.target.value)} placeholder="۱۷٪" className="mt-1.5 h-11 rounded-2xl" />
            </div>
            <div>
              <Label htmlFor="badge" className="text-xs font-black">
                نشان (اختیاری)
              </Label>
              <Input id="badge" value={badge} onChange={(e) => setBadge(e.target.value)} placeholder="پرفروش / جدید" className="mt-1.5 h-11 rounded-2xl" />
            </div>
          </div>

          <div>
            <Label htmlFor="desc" className="text-xs font-black">
              توضیح
            </Label>
            <Textarea id="desc" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="جنس پارچه، سایزبندی و ویژگی‌ها…" className="mt-1.5 min-h-28 rounded-2xl" />
          </div>
        </section>

        {/* Image + status + preview */}
        <section className="space-y-5">
          <div className="admin-card space-y-4 p-5 sm:p-6">
            <h2 className="text-sm font-black text-gold">تصویر محصول</h2>
            <ImageUpload value={img || product?.img} onChange={setImg} onClear={() => setImg("")} label="عکس محصول را بکشید و رها کنید یا کلیک کنید" />

            <label className="flex items-center justify-between rounded-2xl border border-navy/10 px-4 py-3 dark:border-gold/20">
              <span>
                <span className="block text-sm font-black text-navy dark:text-ivory">موجود در انبار</span>
                <span className="block text-[11px] font-bold text-navy/45 dark:text-wheat">در صورت خاموش بودن، «ناموجود» نمایش داده می‌شود.</span>
              </span>
              <Switch checked={stock} onCheckedChange={setStock} />
            </label>
          </div>
        </section>
      </div>

      {/* Sticky action bar — confined to the content column, never over the sidebar */}
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
    </form>
  );
}
