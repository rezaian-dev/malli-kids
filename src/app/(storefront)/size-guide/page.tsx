import Link from "next/link";
import { Intro } from "@/components/shared/intro";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SIZE_ROWS } from "@/lib/data/pages";
import { buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = buildMetadata({
  title: "راهنمای سایز",
  description:
    "جدول سایز پوشاک کودک ملی کیدز بر اساس قد و سن، همراه با نکته‌های انتخاب سایز دقیق‌تر.",
  path: "/size-guide",
  keywords: ["راهنمای سایز کودک", "جدول سایز لباس بچه", "سایز پوشاک کودک"],
});

export default function SizeGuidePage() {
  return (
    <>
      <Intro
        crumb="راهنمای سایز"
        kicker="FIT GUIDE"
        title="راهنمای سایز"
        lead="قد را بدون کفش بگیرید. عددها به سانتی‌متر است. اگر بین دو سایز بودید، برای لباس رویی سایز بزرگ‌تر را بردارید."
        path="/size-guide"
      />
      <div className="container mx-auto w-full max-w-4xl px-3 xs:px-4 sm:px-5 lg:px-7">
        <div className="border-navy/10 dark:border-gold/35 dark:bg-dusk overflow-x-auto rounded-3xl border bg-white shadow-sm">
          <Table className="min-w-130 text-sm">
            <TableHeader>
              <TableRow className="bg-navy hover:bg-navy border-0">
                {["سایز", "قد", "سن تقریبی", "سینه", "کمر"].map((h) => (
                  <TableHead
                    key={h}
                    className="text-cream h-auto p-3.5 text-start font-black"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {SIZE_ROWS.map((r, i) => (
                <TableRow
                  key={r[0]}
                  className={cn(
                    "border-0",
                    i % 2
                      ? "bg-sand dark:bg-dusk-mid"
                      : "dark:bg-slate bg-white",
                  )}
                >
                  {r.map((c, j) => (
                    <TableCell
                      key={c}
                      className={cn(
                        "p-3.5",
                        j === 0
                          ? "text-navy dark:text-linen font-black"
                          : "text-navy/70 dark:text-khaki",
                      )}
                    >
                      {c}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            { t: "قد", d: "بدون کفش، پشت به دیوار بایستد." },
            { t: "سینه", d: "متر را از پهن‌ترین نقطه ببندید." },
            { t: "شک", d: "پرو مجازی سایز پیشنهادی می‌دهد." },
          ].map((x) => (
            <div
              key={x.t}
              className="border-navy/8 hover:border-gold/40 dark:border-gold/30 dark:bg-dusk rounded-2xl border bg-white p-4 transition-all hover:-translate-y-0.5"
            >
              <p className="text-navy dark:text-linen text-sm font-black">
                {x.t}
              </p>
              <p className="text-navy/55 dark:text-khaki mt-1.5 text-xs leading-6">
                {x.d}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/tryon"
            className="bg-navy text-cream inline-flex rounded-full px-6 py-3 font-black transition-transform hover:-translate-y-0.5"
          >
            پرو مجازی
          </Link>
          <Link
            href="/shop"
            className="border-gold text-gold hover:bg-gold hover:text-navy-deep inline-flex rounded-full border-2 px-6 py-3 font-black transition-colors"
          >
            فروشگاه
          </Link>
        </div>
      </div>
    </>
  );
}
