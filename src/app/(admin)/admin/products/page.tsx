import { requireAdminPage } from "@/lib/auth/admin";
import { getAllProducts } from "@/lib/shop/products";
import { AdminProductsLanding } from "./_components/admin-products-landing";

export default async function AdminProducts() {
  const admin = await requireAdminPage();

  const products = await getAllProducts();

  return <AdminProductsLanding products={products} />;
}
