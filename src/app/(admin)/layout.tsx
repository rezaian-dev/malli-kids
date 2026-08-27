import type { ReactNode } from "react";

// Admin section canvas. The nested `admin/layout.tsx` mounts the store, gate and
// shell; this route-group layout only provides the section background.
export default function AdminSectionLayout({ children }: { children: ReactNode }) {
  return <div className="relative z-10 min-h-dvh bg-fog dark:bg-navy-deep">{children}</div>;
}
