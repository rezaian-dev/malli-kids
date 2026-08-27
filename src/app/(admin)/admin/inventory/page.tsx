"use client";

import { useAdmin } from "@/lib/admin-store";
import { formatToman, toFaDigits } from "@/lib/format";
import { Switch } from "@/components/ui/switch";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/lib/use-pagination";
import { PageHead } from "@/components/admin/shell";

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
        <table className="w-full min-w-[40rem] text-sm">
          <thead className="bg-sand text-[11px] font-black text-navy/50 dark:bg-navy-mid dark:text-wheat">
            <tr>
              <th className="px-4 py-3 text-right">کالا</th>
              <th className="px-4 py-3 text-right">دسته</th>
              <th className="px-4 py-3 text-right">فروش</th>
              <th className="px-4 py-3 text-right">قیمت</th>
              <th className="px-4 py-3 text-right">موجودی</th>
            </tr>
          </thead>
          <tbody>
            {pg.pageItems.map((p) => (
              <tr key={p.id} className="border-t border-navy/5 dark:border-gold/15">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <img src={p.img} alt="" className="size-10 rounded-xl object-cover" />
                    <span className="max-w-48 truncate font-bold">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">{p.cat}</td>
                <td className="px-4 py-3">{toFaDigits(p.sold)}</td>
                <td className="px-4 py-3 font-black">{formatToman(p.price)}</td>
                <td className="px-4 py-3">
                  <Switch checked={p.stock} onCheckedChange={(v) => upsertProduct({ ...p, stock: v })} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination pg={pg} unit="کالا" />
    </div>
  );
}
