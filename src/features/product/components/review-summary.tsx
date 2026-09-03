import { toFaDigits } from "@/lib/locale/fa";
import { cn } from "@/lib/utils";
import { pdpKicker, pdpWell } from "./product-chrome";
import { ReviewStars } from "./review-stars";

function distFromAvg(avg: number) {
  const five = Math.round(Math.min(92, Math.max(48, (avg - 3.2) * 38)));
  const four = Math.round((100 - five) * 0.62);
  const three = Math.round((100 - five - four) * 0.7);
  const two = Math.max(0, Math.round((100 - five - four - three) * 0.55));
  const one = Math.max(0, 100 - five - four - three - two);
  return [five, four, three, two, one];
}

/** 📊 Average score, per-star distribution, and the "would recommend"
 *  donut + stat grid. */
export function ReviewSummary({
  avg,
  count,
  recommend,
}: {
  avg: number;
  count: number;
  recommend: number;
}) {
  const bars = distFromAvg(avg);

  return (
    <div className={`${pdpWell} overflow-hidden p-4 sm:p-6`}>
      <p className={pdpKicker}>BUYER NOTES</p>
      <div className="mt-3 grid min-w-0 items-center gap-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-6">
        <div className="text-center sm:text-right">
          <p
            className={cn(
              "text-[2.75rem] leading-none font-black",
              "text-navy",
              "dark:text-ivory",
            )}
          >
            {toFaDigits(avg.toFixed(1))}
          </p>
          <div className="mt-2 flex justify-center sm:justify-start">
            <ReviewStars n={Math.round(avg)} className="size-4" />
          </div>
          <p className="text-navy/70 dark:text-wheat mt-2 text-[11px] font-bold">
            از {toFaDigits(count)} نظر تأییدشده
          </p>
        </div>

        <ul className="min-w-0 space-y-1.5" aria-label="توزیع امتیاز">
          {bars.map((pct, i) => {
            const star = 5 - i;
            return (
              <li key={star} className="flex items-center gap-2">
                <span className="text-navy/70 dark:text-wheat w-3 text-[11px] font-black">
                  {toFaDigits(star)}
                </span>
                <span
                  className={cn(
                    "h-1.5 min-w-0 flex-1 overflow-hidden rounded-full",
                    "bg-navy/10",
                    "dark:bg-ivory/10",
                  )}
                >
                  <span
                    className="bg-gold block h-full rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </span>
                <span
                  className={cn(
                    "w-8 text-end text-[10px] font-bold",
                    "text-navy/70",
                    "dark:text-wheat/80",
                  )}
                >
                  {toFaDigits(pct)}٪
                </span>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center justify-center gap-3 sm:flex-col">
          <div
            className="grid size-20 shrink-0 place-items-center rounded-full"
            style={{
              background: `conic-gradient(var(--color-gold) ${recommend}%, color-mix(in srgb, var(--color-navy) 14%, transparent) 0)`,
            }}
            aria-hidden
          >
            <span
              className={cn(
                "grid size-14 place-items-center rounded-full text-sm font-black",
                "text-navy bg-white",
                "dark:bg-dusk dark:text-ivory",
              )}
            >
              {toFaDigits(recommend)}٪
            </span>
          </div>
          <p
            className={cn(
              "max-w-28 text-center text-[11px] leading-5 font-black sm:max-w-none",
              "text-navy",
              "dark:text-ivory",
            )}
          >
            پیشنهاد می‌کنند
          </p>
        </div>
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-2 min-[480px]:grid-cols-4">
        {[
          ["پیشنهاد خرید", `${toFaDigits(recommend)}٪`],
          ["تطبیق سایز", `${toFaDigits(Math.max(88, recommend - 3))}٪`],
          ["کیفیت دوخت", `${toFaDigits(Math.min(99, recommend + 1))}٪`],
          ["خرید مجدد", `${toFaDigits(Math.max(84, recommend - 6))}٪`],
        ].map(([label, val]) => (
          <li
            key={label}
            className={cn(
              "rounded-2xl border px-3 py-3 text-center",
              "border-navy/8 bg-white/80",
              "dark:border-gold/20 dark:bg-navy-deep/40",
            )}
          >
            <p className="text-navy dark:text-ivory text-base font-black">
              {val}
            </p>
            <p className="text-navy/70 dark:text-wheat mt-1 text-[10px] font-bold">
              {label}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
