import { requireAdminPage } from "@/lib/auth/admin";
import { getAllProducts } from "@/lib/shop/products";
import { ProductForm } from "@/components/admin/product-form";

export default async function NewProductPage() {
  const admin = await requireAdminPage();
  const allProducts = await getAllProducts();

  return <ProductForm allProducts={allProducts} />;
}
