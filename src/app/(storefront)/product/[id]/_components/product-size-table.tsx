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

const HEADS = [
  { short: "سایز", full: "سایز" },
  { short: "قد", full: "قد کودک (سانتی‌متر)" },
  { short: "سن", full: "سن تقریبی" },
  { short: "سینه", full: "دور سینه" },
];

export function ProductSizeTable() {
  return (
    <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_16.5rem] lg:gap-5">
      <div className="border-navy/10 dark:border-gold/30 dark:bg-navy-deep/55 min-w-0 overflow-hidden rounded-[22px] border bg-white/92 shadow-[0_18px_40px_-28px_rgba(14,42,71,.3)] sm:rounded-[28px]">
        <Table className="w-full min-w-0 text-right text-[11px] sm:text-sm">
          <TableHeader>
            <TableRow className="bg-navy hover:bg-navy border-0 text-[10px] sm:text-[11px]">
              {HEADS.map((h, i) => (
                <TableHead
                  key={h.full}
                  className={cn(
                    "text-cream h-auto px-2 py-2.5 text-right whitespace-normal sm:p-4 sm:whitespace-nowrap",
                    i === 0 ? "font-black" : "font-bold",
                  )}
                >
                  <span className="sm:hidden">{h.short}</span>
                  <span className="hidden sm:inline">{h.full}</span>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="text-navy/80 dark:text-ivory/90">
            {SIZE_TABLE.map((r, i) => (
              <TableRow
                key={r[0]}
                className={cn(
                  "border-navy/5 dark:border-gold/15",
                  r[0] === "۹۸"
                    ? "bg-gold-pale dark:bg-gold/20"
                    : i % 2
                      ? "bg-sand dark:bg-navy-mid/55"
                      : "bg-white dark:bg-navy-deep/35",
                )}
              >
                <TableCell className="text-navy dark:text-ivory px-2 py-2.5 font-black whitespace-nowrap sm:p-4">
                  {r[0]}
                  {r[0] === "۹۸" ? (
                    <Badge className="bg-gold/20 text-gold ms-1 hidden rounded-full border-0 text-[10px] font-bold min-[380px]:inline-flex">
                      پیشنهادی
                    </Badge>
                  ) : null}
                </TableCell>
                <TableCell className="px-2 py-2.5 whitespace-nowrap sm:p-4">
                  {r[1]}
                </TableCell>
                <TableCell className="px-2 py-2.5 whitespace-nowrap sm:p-4">
                  {r[2]}
                </TableCell>
                <TableCell className="px-2 py-2.5 whitespace-nowrap sm:p-4">
                  {r[3]}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <aside className="bg-navy text-cream ring-gold/25 min-w-0 rounded-[22px] p-4 ring-1 sm:rounded-[28px] sm:p-6">
        <p className="text-gold-light text-[11px] font-bold tracking-[0.18em]">
          SIZE NOTES
        </p>
        <p className="mt-2 text-sm font-black">چطور اندازه بگیریم؟</p>
        <ul className="text-cream/80 mt-4 space-y-3 text-[13px] leading-6">
          <li>قد را بدون کفش، از فرق سر تا کف پا بگیرید.</li>
          <li>دور سینه را از پهن‌ترین قسمت با متر نرم اندازه بزنید.</li>
          <li>اگر بین دو سایز بودید، سایز بزرگ‌تر را انتخاب کنید.</li>
        </ul>
      </aside>
    </div>
  );
}
