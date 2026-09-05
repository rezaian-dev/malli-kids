"use client";

import dynamic from "next/dynamic";

// 🍞 sonner rides a deferred chunk; tiny client mount because ssr:false
// can't sit directly in a server layout
const Toaster = dynamic(() => import("./sonner").then((m) => m.Toaster), {
  ssr: false,
});

export function ToasterMount() {
  return <Toaster />;
}
