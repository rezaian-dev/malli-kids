"use client";

import { useMemo, useState } from "react";
import { CORE_PRODUCTS } from "@/lib/data/products";
import { Card } from "@/components/product/product-card";
import { OrnStar } from "@/components/home/ornaments";

const TABS = ["همه", "دخترانه", "پسرانه", "سیسمونی"];

export function Styles() {
  const [tab, setTab] = useState("همه");
  const [wave, setWave] = useState(0);
  const items = useMemo(() => (tab === "همه" ? CORE_PRODUCTS : CORE_PRODUCTS.filter((p) => p.cat === tab)), [tab]);

  function changeTab(name: string) {
    if (name === tab) return;
    setTab(name);
    setWave((w) => w + 1);
  }

  return (
    <section id="styles" className="bg-transparent py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7">
        <div className="mb-10 flex flex-col justify-between gap-5 transition-all duration-700 ease-out sm:mb-12 sm:gap-6 lg:flex-row lg:items-end">
          <div>
            <span className="text-sm font-bold tracking-wide text-gold">انتخاب سردبیر</span>
            <h2 className="mt-2 text-[clamp(1.5rem,5.5vw,2.625rem)] font-black leading-snug text-navy dark:text-ivory">
              استایل‌های{" "}
              <span className="relative inline-block text-gold">
                منتخب
                <OrnStar className="absolute -top-3 -left-4 h-4 w-4" />
              </span>
            </h2>
          </div>
          <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            <div className="flex w-max gap-1 rounded-full border border-navy/5 bg-white p-1.5 shadow-sm dark:border-gold/20 dark:bg-dusk-alt sm:gap-1.5">
              {TABS.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => changeTab(name)}
                  className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-extrabold sm:px-5 sm:py-2.5 sm:text-sm ${
                    tab === name ? "bg-navy text-ivory shadow-md dark:bg-gold dark:text-navy-deep" : "text-navy/55 dark:text-khaki"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div key={wave} id="stylesGrid" className="grid grid-cols-2 gap-3 min-[420px]:gap-4 sm:gap-6 lg:grid-cols-4">
          {items.map((p, i) => (
            <div key={`${wave}-${p.id}`} className="animate-style-in" style={{ animationDelay: `${i * 72}ms` }}>
              <Card p={p} view="grid" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
