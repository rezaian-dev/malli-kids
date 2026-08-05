import type { ReactNode } from "react";
import "../admin.css";
import { AdminShell, type AdminIdentity } from "@/components/admin";
import { requireAdmin } from "@/lib/auth/admin";
import { getAdminNotifCounts, type AdminNotifCounts } from "@/lib/admin/notif-counts";
import { buildMetadata } from "@/lib/seo";

function toAdminIdentity(admin: {
  firstName: string;
  lastName?: string;
  email: string;
  avatar?: string;
}): AdminIdentity {
  return {
    username: admin.email,
    name: `${admin.firstName} ${admin.lastName ?? ""}`.trim(),
    avatar: admin.avatar,
  };
}

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "کنسول مدیریت",
  description: "مدیریت سفارش‌ها، محصولات و محتوای فروشگاه.",
  path: "/admin",
  noIndex: true,
});

const EMPTY_COUNTS: AdminNotifCounts = {
  freshOrders: 0,
  openTickets: 0,
  openChats: 0,
  pendingReviews: 0,
};

// 🛡️ Wraps `/admin/login` too — no redirect here (that would loop login).
// `requireAdmin()` is display-only; each protected `page.tsx` is the gate.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  const counts = admin ? await getAdminNotifCounts() : EMPTY_COUNTS;

  return (
    <div className="bg-fog dark:bg-navy-deep relative z-10 min-h-dvh">
      <AdminShell
        profile={admin ? toAdminIdentity(admin) : null}
        counts={counts}
      >
        {children}
      </AdminShell>
    </div>
  );
}
