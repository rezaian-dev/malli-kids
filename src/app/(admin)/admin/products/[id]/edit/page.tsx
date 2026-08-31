"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAdmin } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { ProductForm } from "../../_components/product-form";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { db } = useAdmin();
  const product = db.products.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="border-navy/9 bg-paper/94 hover:border-gold/40 dark:border-gold-soft/16 dark:hover:border-gold-soft/30 mx-auto mt-10 max-w-md rounded-[22px] border p-8 text-center shadow-[0_20px_48px_-34px_rgba(14,42,71,0.38),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[18px] transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:shadow-[0_24px_52px_-34px_rgba(14,42,71,0.44)] max-[639px]:rounded-[19px] dark:bg-[rgba(16,43,70,0.72)] dark:shadow-[0_25px_60px_-35px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.045),0_0_0_1px_rgba(193,147,87,0.025)] dark:hover:shadow-[0_28px_64px_-36px_rgba(0,0,0,0.88),0_0_34px_rgba(193,147,87,0.035)]">
        <p className="text-navy dark:text-ivory font-black">محصول پیدا نشد</p>
        <p className="text-navy/50 dark:text-wheat mt-1 text-sm">
          ممکن است حذف شده باشد.
        </p>
        <Button asChild variant="navy" className="mt-4 rounded-2xl">
          <Link href="/admin/products">بازگشت به محصولات</Link>
        </Button>
      </div>
    );
  }

  return <ProductForm key={product.id} product={product} />;
}
