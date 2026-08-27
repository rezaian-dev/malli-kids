import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

/** جدول راهنمای سایز — کاملاً ایستا، پس Server Component. */
export function SizeTable() {
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[1fr_280px]">
      <div className="overflow-x-auto rounded-[28px] border border-navy/8 bg-white dark:border-gold/30 dark:bg-slate">
        <Table className="min-w-130 text-right text-sm">
          <TableHeader>
            <TableRow className="border-0 bg-navy text-[11px] hover:bg-navy">
              {HEADS.map((h, i) => (
                <TableHead key={h} className={cn("h-auto p-4 text-right text-cream", i === 0 ? "font-black" : "font-bold")}>
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="text-navy/75 dark:text-wheat">
            {SIZE_TABLE.map((r, i) => (
              <TableRow
                key={r[0]}
                className={cn("border-navy/5", r[0] === "۹۸" ? "bg-gold-pale" : i % 2 ? "bg-sand" : "bg-white")}
              >
                <TableCell className="p-4 font-black text-navy dark:text-ivory">
                  {r[0]}
                  {r[0] === "۹۸" ? (
                    <Badge className="ms-1 rounded-full border-0 bg-gold/20 text-[10px] font-bold text-gold">پیشنهادی</Badge>
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

      <aside className="rounded-[28px] bg-navy p-5 text-cream sm:p-6">
        <p className="text-xs font-bold text-gold-light">چطور اندازه بگیریم؟</p>
        <ul className="mt-4 space-y-3 text-[13px] leading-6 text-cream/75">
          <li>قد را بدون کفش، از فرق سر تا کف پا بگیرید.</li>
          <li>دور سینه را از پهن‌ترین قسمت با متر نرم اندازه بزنید.</li>
          <li>اگر بین دو سایز بودید، سایز بزرگ‌تر را انتخاب کنید.</li>
        </ul>
      </aside>
    </div>
  );
}
