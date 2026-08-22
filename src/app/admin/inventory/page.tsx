import { requireAdminPage } from "@/lib/auth/admin";
import { getAllProducts } from "@/lib/shop/products";
import { AdminInventoryLanding } from "./_components/admin-inventory-landing";

export default async function AdminInventory() {
  const admin = await requireAdminPage();

  const products = await getAllProducts();

  return <AdminInventoryLanding products={products} />;
}
