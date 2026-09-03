"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useAdmin } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { ProductForm } from "./product-form";
import { cn } from "@/lib/utils";
import { adminGlassCard } from "@/lib/admin/admin-chrome";

export function EditProductLanding() {
  const { id } = useParams<{ id: string }>();
  const { db } = useAdmin();
  const product = db.products.find((p) => p.id === Number(id));

  if (!product) {
    return (
      <div
        className={cn(adminGlassCard, "mx-auto mt-10 max-w-md p-8 text-center")}
      >
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
