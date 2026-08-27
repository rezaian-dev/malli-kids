"use client";

import { useAdmin } from "@/features/admin";
import { formatToman, toFaDigits } from "@/lib/format";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { PageHead } from "@/features/admin";

const PER_PAGE = 6;

export default function AdminInventory() {
  const { db, upsertProduct } = useAdmin();
  const low = db.products.filter((p) => !p.stock);
  const pg = usePagination(db.products, PER_PAGE);

  return (
    <div>
      <PageHead kicker="STOCK" title="موجودی انبار" />
      {low.length ? (
        <p className="mb-4 rounded-2xl border border-rose/30 bg-rose-pale px-4 py-3 text-sm font-bold text-rose">
          {toFaDigits(low.length)} مدل ناموجود است و در فروشگاه نمایش خاکستری می‌شود.
        </p>
      ) : null}
      <div className="overflow-x-auto lux-card">
        <Table className="min-w-[40rem] text-sm">
          <TableHeader className="bg-sand text-[11px] dark:bg-navy-mid">
            <TableRow className="border-0 hover:bg-transparent">
              {["کالا", "دسته", "فروش", "قیمت", "موجودی"].map((h) => (
                <TableHead key={h} className="h-auto px-4 py-3 text-right font-black text-navy/50 dark:text-wheat">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pg.pageItems.map((p) => (
              <TableRow key={p.id} className="border-navy/5 dark:border-gold/15">
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.img} alt="" className="size-10 rounded-xl object-cover" />
                    <span className="max-w-48 truncate font-bold">{p.name}</span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3">{p.cat}</TableCell>
                <TableCell className="px-4 py-3">{toFaDigits(p.sold)}</TableCell>
                <TableCell className="px-4 py-3 font-black">{formatToman(p.price)}</TableCell>
                <TableCell className="px-4 py-3">
                  <Switch checked={p.stock} onCheckedChange={(v) => upsertProduct({ ...p, stock: v })} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <Pagination pg={pg} unit="کالا" />
    </div>
  );
}
