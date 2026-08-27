"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAdmin } from "@/lib/admin-store";
import { Button } from "@/components/ui/button";
import { ProductForm } from "../../_form";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const { db } = useAdmin();
  const product = db.products.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div className="admin-card mx-auto mt-10 max-w-md p-8 text-center">
        <p className="font-black text-navy dark:text-ivory">محصول پیدا نشد</p>
        <p className="mt-1 text-sm text-navy/50 dark:text-wheat">ممکن است حذف شده باشد.</p>
        <Button asChild variant="navy" className="mt-4 rounded-2xl">
          <Link href="/admin/products">بازگشت به محصولات</Link>
        </Button>
      </div>
    );
  }

  return <ProductForm key={product.id} product={product} />;
}
