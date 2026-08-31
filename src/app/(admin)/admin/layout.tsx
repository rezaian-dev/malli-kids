import type { ReactNode } from "react";
import { AdminGate, AdminStore } from "@/components/admin";
import { AdminShell } from "@/components/admin";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "کنسول مدیریت",
  description:
    "فضای مدیریتی ملی کیدز برای مدیریت سفارش‌ها، محصولات و محتوای فروشگاه.",
  path: "/admin",
  noIndex: true,
});

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminStore>
      <AdminGate>
        <AdminShell>{children}</AdminShell>
      </AdminGate>
    </AdminStore>
  );
}
