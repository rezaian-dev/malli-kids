import Link from "next/link";
import { requireAdminPage } from "@/lib/auth/admin";
import { getAllProducts, getProductById } from "@/lib/shop/products";
import { ProductForm } from "@/components/admin/product-form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { adminGlassCard } from "@/lib/admin/admin-chrome";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await requireAdminPage();

  const { id } = await params;
  const [product, allProducts] = await Promise.all([
    getProductById(Number(id)),
    getAllProducts(),
  ]);

  if (!product) {
    return (
      <div className={cn(adminGlassCard, "mx-auto mt-10 max-w-md p-8 text-center")}>
        <p className="text-navy dark:text-ivory font-black">محصول پیدا نشد</p>
        <p className="text-navy/70 dark:text-wheat mt-1 text-sm">
          ممکن است حذف شده باشد.
        </p>
        <Button asChild variant="navy" className="mt-4 rounded-2xl">
          <Link href="/admin/products">بازگشت به محصولات</Link>
        </Button>
      </div>
    );
  }

  return (
    <ProductForm key={product.id} product={product} allProducts={allProducts} />
  );
}
