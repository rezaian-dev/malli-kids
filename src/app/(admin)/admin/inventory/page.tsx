"use client";

import Image from "next/image";

import { useAdmin } from "@/features/admin";
import { AdminTable, type AdminCol } from "@/features/admin/components/admin-table";
import { formatToman, toFaDigits } from "@/lib/format";
import { Switch } from "@/components/ui/switch";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { PageHead } from "@/features/admin";
import type { Product } from "@/types";

const PER_PAGE = 6;

export default function AdminInventory() {
  const { db, upsertProduct } = useAdmin();
  const low = db.products.filter((p) => !p.stock);
  const pg = usePagination(db.products, PER_PAGE);

  const cols: AdminCol<Product>[] = [
    {
      key: "name",
      title: "کالا",
      width: "2.2fr",
      render: (p) => (
        <div className="flex items-center gap-3">
          <Image src={p.img} alt="" width={40} height={40} className="size-10 shrink-0 rounded-xl object-cover" />
          <span className="truncate">{p.name}</span>
        </div>
      ),
    },
    { key: "cat", title: "دسته", width: "1.1fr", render: (p) => <span className="font-semibold text-navy/60 dark:text-wheat">{p.cat}</span> },
    { key: "sold", title: "فروش", width: "5.5rem", align: "center", render: (p) => toFaDigits(p.sold) },
    {
      key: "price",
      title: "قیمت",
      width: "8.5rem",
      align: "center",
      render: (p) => <span className="whitespace-nowrap font-black text-gold-deep dark:text-gold-soft">{formatToman(p.price)}</span>,
    },
    {
      key: "stock",
      title: "موجودی",
      width: "6rem",
      align: "center",
      render: (p) => <Switch checked={p.stock} onCheckedChange={(v) => upsertProduct({ ...p, stock: v })} aria-label={`موجودی ${p.name}`} />,
    },
  ];

  return (
    <div>
      <PageHead kicker="STOCK" title="موجودی انبار" />
      {low.length ? (
        <p className="mb-4 rounded-2xl border border-rose/30 bg-rose-pale px-4 py-3 text-sm font-bold text-rose">
          {toFaDigits(low.length)} مدل ناموجود است و در فروشگاه نمایش خاکستری می‌شود.
        </p>
      ) : null}
      <AdminTable cols={cols} rows={pg.pageItems} minWidth="52rem" />
      <Pagination pg={pg} unit="کالا" />
    </div>
  );
}
