import type { ReactNode } from "react";
import { AdminGate, AdminStore } from "@/lib/admin-store";
import { AdminShell } from "@/components/admin/shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminStore>
      <AdminGate>
        <AdminShell>{children}</AdminShell>
      </AdminGate>
    </AdminStore>
  );
}
