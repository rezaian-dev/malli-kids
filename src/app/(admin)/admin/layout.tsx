import type { ReactNode } from "react";
import { AdminGate, AdminStore } from "@/components/admin";
import { AdminShell } from "@/components/admin";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminStore>
      <AdminGate>
        <AdminShell>{children}</AdminShell>
      </AdminGate>
    </AdminStore>
  );
}
