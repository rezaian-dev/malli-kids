import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const SIZE_TABLE = [
  ["۸۰", "۷۵–۸۰", "۹–۱۲ ماه", "۴۸"],
  ["۸۶", "۸۱–۸۶", "۱۲–۱۸ ماه", "۵۰"],
  ["۹۲", "۸۷–۹۲", "۱۸–۲۴ ماه", "۵۲"],
  ["۹۸", "۹۳–۹۸", "۲–۳ سال", "۵۴"],
  ["۱۰۴", "۹۹–۱۰۴", "۳–۴ سال", "۵۶"],
  ["۱۱۰", "۱۰۵–۱۱۰", "۴–۵ سال", "۵۸"],
  ["۱۱۶", "۱۱۱–۱۱۶", "۵–۶ سال", "۶۰"],
  ["۱۲۲", "۱۱۷–۱۲۲", "۶–۷ سال", "۶۲"],
];

const HEADS = ["سایز", "قد کودک (سانتی‌متر)", "سن تقریبی", "دور سینه"];

export function ProductSizeTable() {
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1fr_280px]">
      <div className="border-navy/10 dark:border-gold/30 dark:bg-slate overflow-x-auto rounded-[28px] border bg-white/92 shadow-[0_18px_40px_-28px_rgba(14,42,71,.3)]">
        <Table className="min-w-130 text-right text-sm">
          <TableHeader>
            <TableRow className="bg-navy hover:bg-navy border-0 text-[11px]">
              {HEADS.map((h, i) => (
                <TableHead
                  key={h}
                  className={cn(
                    "text-cream h-auto p-4 text-right",
                    i === 0 ? "font-black" : "font-bold",
                  )}
                >
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="text-navy/75 dark:text-wheat">
            {SIZE_TABLE.map((r, i) => (
              <TableRow
                key={r[0]}
                className={cn(
                  "border-navy/5",
                  r[0] === "۹۸"
                    ? "bg-gold-pale"
                    : i % 2
                      ? "bg-sand"
                      : "bg-white",
                )}
              >
                <TableCell className="text-navy dark:text-ivory p-4 font-black">
                  {r[0]}
                  {r[0] === "۹۸" ? (
                    <Badge className="bg-gold/20 text-gold ms-1 rounded-full border-0 text-[10px] font-bold">
                      پیشنهادی
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell className="p-4">{r[1]}</TableCell>
                <TableCell className="p-4">{r[2]}</TableCell>
                <TableCell className="p-4">{r[3]}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <aside className="bg-navy text-cream ring-gold/25 rounded-[28px] p-5 ring-1 sm:p-6">
        <p className="text-gold-light text-[11px] font-bold tracking-[0.18em]">
          SIZE NOTES
        </p>
        <p className="mt-2 text-sm font-black">چطور اندازه بگیریم؟</p>
        <ul className="text-cream/75 mt-4 space-y-3 text-[13px] leading-6">
          <li>قد را بدون کفش، از فرق سر تا کف پا بگیرید.</li>
          <li>دور سینه را از پهن‌ترین قسمت با متر نرم اندازه بزنید.</li>
          <li>اگر بین دو سایز بودید، سایز بزرگ‌تر را انتخاب کنید.</li>
        </ul>
      </aside>
    </div>
  );
}
