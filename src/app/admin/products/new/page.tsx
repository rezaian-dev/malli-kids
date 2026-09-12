import { requireAdminPage } from "@/lib/auth/admin";
import { getAllProducts } from "@/lib/shop/products";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  await requireAdminPage();
  const allProducts = await getAllProducts();

  return <ProductForm allProducts={allProducts} />;
}
