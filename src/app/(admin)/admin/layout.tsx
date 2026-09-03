import type { ReactNode } from "react";
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

export const metadata = buildMetadata({
  title: "کنسول مدیریت",
  description: "مدیریت سفارش‌ها، محصولات و محتوای فروشگاه.",
  path: "/admin",
  noIndex: true,
});

const EMPTY_COUNTS: AdminNotifCounts = {
  freshOrders: 0,
  openTickets: 0,
  pendingReviews: 0,
};

// 🪶 This layout also wraps `/admin/login`, so it deliberately does NOT
// redirect here (that would loop the login page itself). It only checks
// `requireAdmin()` to hand the real identity down for display — `null` on
// `/admin/login` is expected and fine. The actual access-control boundary
// lives in each protected `page.tsx` (see `requireAdmin()` there).
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  const counts = admin ? await getAdminNotifCounts() : EMPTY_COUNTS;

  return (
    <AdminShell
      profile={admin ? toAdminIdentity(admin) : null}
      counts={counts}
    >
      {children}
    </AdminShell>
  );
}
