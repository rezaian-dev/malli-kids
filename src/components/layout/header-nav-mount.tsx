"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { NAV_MAIN } from "@/lib/data/nav";
import { NAV_LINK } from "./header-styles";

function DesktopNavFallback() {
  return (
    <nav className="mx-auto hidden max-w-none min-w-0 flex-1 justify-center md:flex">
      <div className="flex items-center gap-0.5 lg:gap-1">
        {NAV_MAIN.map((item) => (
          <Link key={item.href} href={item.href} prefetch={false} className={NAV_LINK}>
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

const DesktopNav = dynamic(() => import("./desktop-nav").then((mod) => mod.DesktopNav), {
  ssr: false,
  loading: () => <DesktopNavFallback />,
});

// 🧭 Hydrate the full desktop nav after the first paint.
export function HeaderNavMount() {
  return <DesktopNav />;
}
