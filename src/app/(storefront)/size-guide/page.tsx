import Link from "next/link";
import { Intro } from "@/components/shared/intro";
import { SIZE_ROWS } from "@/lib/data/pages";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";


export default function SizeGuidePage() {
  return (
    <>
<Intro crumb="راهنمای سایز" kicker="FIT GUIDE" title="راهنمای سایز" lead="قد را بدون کفش بگیرید. عددها به سانتی‌متر است. اگر بین دو سایز بودید، برای لباس رویی سایز بزرگ‌تر را بردارید." />
        <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7 max-w-4xl">
          <div className="overflow-x-auto rounded-3xl border border-navy/10 dark:border-gold/35 bg-white dark:bg-dusk shadow-sm">
            <Table className="min-w-130 text-sm">
              <TableHeader>
                <TableRow className="border-0 bg-navy hover:bg-navy">
                  {["سایز", "قد", "سن تقریبی", "سینه", "کمر"].map((h) => (
                    <TableHead key={h} className="h-auto p-3.5 text-start font-black text-cream">
                      {h}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {SIZE_ROWS.map((r, i) => (
                  <TableRow key={r[0]} className={cn("border-0", i % 2 ? "bg-sand dark:bg-dusk-mid" : "bg-white dark:bg-slate")}>
                    {r.map((c, j) => (
                      <TableCell
                        key={c}
                        className={cn("p-3.5", j === 0 ? "font-black text-navy dark:text-linen" : "text-navy/70 dark:text-khaki")}
                      >
                        {c}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mt-6">
            {[
              { t: "قد", d: "بدون کفش، پشت به دیوار بایستد." },
              { t: "سینه", d: "متر را از پهن‌ترین نقطه ببندید." },
              { t: "شک", d: "پرو مجازی سایز پیشنهادی می‌دهد." },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl border border-navy/8 dark:border-gold/30 bg-white dark:bg-dusk p-4 hover:-translate-y-0.5 hover:border-gold/40 transition-all">
                <p className="font-black text-navy dark:text-linen text-sm">{x.t}</p>
                <p className="text-xs text-navy/55 dark:text-khaki mt-1.5 leading-6">{x.d}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/tryon" className="inline-flex bg-navy text-cream font-black px-6 py-3 rounded-full hover:-translate-y-0.5 transition-transform">
              پرو مجازی
            </Link>
            <Link href="/shop" className="inline-flex border-2 border-gold text-gold font-black px-6 py-3 rounded-full hover:bg-gold hover:text-navy-deep transition-colors">
              فروشگاه
            </Link>
          </div>
        </div>
    </>
        );
}
