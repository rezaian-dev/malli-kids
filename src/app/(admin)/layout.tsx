import type { ReactNode } from "react";

// 🎛️ This route group only paints the admin backdrop.
export default function AdminSectionLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="bg-fog dark:bg-navy-deep relative z-10 min-h-dvh">
      {children}
    </div>
  );
}
