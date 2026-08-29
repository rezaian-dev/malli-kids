"use client";

import Image from "next/image";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Search, X } from "lucide-react";
import { useAdmin } from "@/features/admin";
import { CATS, SEASONS } from "@/lib/constants";
import { formatToman, toFaDigits } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { PageHead } from "@/features/admin";

const PER_PAGE = 6;

export default function AdminProducts() {
  const { db, removeProduct } = useAdmin();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("همه");
  const [season, setSeason] = useState("همه");

  const list = useMemo(
    () => db.products.filter((p) => (cat === "همه" || p.cat === cat) && (!q || p.name.includes(q) || p.cat.includes(q))),
    [db.products, q, cat],
  );
  const pg = usePagination(list, PER_PAGE, `${q}|${cat}|${season}`);

  return (
    <div>
      <PageHead
        kicker="CATALOG"
        title="محصولات"
        action={
          <Button asChild variant="navy">
            <Link href="/admin/products/new">
              <Plus className="size-4" /> محصول جدید
            </Link>
          </Button>
        }
      />
      <div className="mb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-gold" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی مدل…" className="h-11 rounded-2xl pe-10" />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {CATS.map((c) => {
            const on = cat === c;
            const count = c === "همه" ? db.products.length : db.products.filter((p) => p.cat === c).length;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-black transition ${
                  on
                    ? "bg-navy text-ivory dark:bg-gold dark:text-navy-deep"
                    : "border border-navy/12 bg-white text-navy/70 hover:border-gold/50 dark:border-gold/25 dark:bg-navy-mid dark:text-wheat"
                }`}
              >
                {c}
                <span className={`rounded-full px-1.5 text-[10px] ${on ? "bg-white/20" : "bg-navy/8 dark:bg-white/10"}`}>{toFaDigits(count)}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {["همه", ...SEASONS].map((sn) => {
            const on = season === sn;
            return (
              <button
                key={sn}
                type="button"
                onClick={() => setSeason(sn)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-black transition ${
                  on
                    ? "bg-gold text-navy-deep"
                    : "border border-navy/12 bg-white text-navy/70 hover:border-gold/50 dark:border-gold/25 dark:bg-navy-mid dark:text-wheat"
                }`}
              >
                {sn}
              </button>
            );
          })}
        </div>
      </div>
      <p className="mb-3 text-xs font-bold text-navy/45 dark:text-wheat">{toFaDigits(list.length)} مدل</p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {pg.pageItems.map((p) => (
          <article key={p.id} className="admin-card overflow-hidden">
            <div className="flex gap-3 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image src={p.img} alt="" width={80} height={80} className="size-20 shrink-0 rounded-2xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-black text-gold">{p.cat}{p.season ? ` · ${p.season}` : ""}</p>
                <h2 className="truncate text-sm font-black text-navy dark:text-ivory">{p.name}</h2>
                <p className="mt-1 text-xs font-black">{formatToman(p.price)} تومان</p>
                <p className={`mt-1 text-[11px] font-bold ${p.stock ? "text-navy/45 dark:text-wheat" : "text-rose"}`}>{p.stock ? `${toFaDigits(p.sold)} فروش` : "ناموجود"}</p>
              </div>
            </div>
            <div className="flex gap-2 border-t border-navy/5 px-3 py-2 dark:border-gold/15">
              <Button asChild className="h-9 flex-1 rounded-xl bg-navy text-[11px] text-ivory hover:bg-navy/90 dark:bg-gold dark:text-navy-deep dark:hover:bg-gold/90">
                <Link href={`/admin/products/${p.id}/edit`}>
                  <Pencil className="size-3.5" /> ویرایش
                </Link>
              </Button>
              <button type="button" className="grid size-9 place-items-center rounded-xl bg-rose-pale text-rose dark:bg-rose/15" onClick={() => removeProduct(p.id)} aria-label="حذف">
                <X className="size-4" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="admin-card mt-2 p-8 text-center text-sm font-bold text-navy/45 dark:text-wheat">موردی مطابق جستجو یافت نشد.</p>
      ) : (
        <Pagination pg={pg} unit="مدل" />
      )}
    </div>
  );
}
