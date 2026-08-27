import type { ReactNode } from "react";
import { AdminGate, AdminStore } from "@/features/admin";
import { AdminShell } from "@/features/admin";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminStore>
      <AdminGate>
        <AdminShell>{children}</AdminShell>
      </AdminGate>
    </AdminStore>
  );
}
