"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  History,
  Headphones,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { useWallet } from "@/hooks/use-wallet";
import { formatToman, toFaDigits } from "@/lib/locale/fa";
import { announceProfileTab, profileTabHref } from "@/lib/profile-nav";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProfileWalletPanel() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useWallet(page);
  const [copied, setCopied] = useState<string | null>(null);

  async function copy(reference: string) {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(reference);
      toast.success("شماره پیگیری کپی شد.");
    } catch {
      toast.error("کپی انجام نشد؛ شماره پیگیری را انتخاب و کپی کنید.");
    }
  }

  return (
    <section
      className="mt-5 min-w-0 space-y-5 pb-10 sm:pb-6"
      aria-labelledby="wallet-heading"
      aria-busy={loading}
    >
      <div className="flex items-start justify-between gap-3 px-1">
        <div>
          <p className="text-gold-deep dark:text-gold text-[10px] font-black tracking-[0.22em]">
            MALLI WALLET
          </p>
          <h2
            id="wallet-heading"
            className="text-navy dark:text-ivory mt-1 text-xl font-black sm:text-2xl"
          >
            کیف پول من
          </h2>
          <p className="text-navy/70 dark:text-wheat mt-1 text-xs leading-6">
            اعتبار شما، با یک مسیر روشن برای هر بازگشت وجه.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-navy dark:text-ivory shrink-0 rounded-full"
          onClick={() => void reload()}
          disabled={loading}
          aria-label="به‌روزرسانی کیف پول"
        >
          <RefreshCw className={cn("size-4", loading && "motion-safe:animate-spin")} />
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="relative isolate min-w-0 overflow-hidden rounded-[28px] border border-gold/25 bg-navy p-6 text-ivory shadow-[0_20px_45px_-30px_rgba(6,23,40,.8)] sm:p-8 dark:bg-navy-mid">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 -left-20 size-72 rounded-full border border-gold/20 bg-radial from-gold/16 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-30 left-0 size-72 rounded-full border border-gold/12"
          />
          <div className="relative flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-gold-soft">
              <WalletCards className="size-5" /> موجودی کیف پول
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-bold tracking-[0.15em]">
              MALLI KIDS
            </span>
          </div>
          <div className="relative my-8 min-h-12" aria-live="polite">
            {data ? (
              <p className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                <b
                  data-testid="wallet-balance"
                  className="break-all text-[clamp(1.8rem,5vw,3.2rem)] leading-none font-black tracking-tight"
                >
                  {formatToman(data.balance)}
                </b>
                <span className="text-sm font-bold text-gold-soft">تومان</span>
              </p>
            ) : loading ? (
              <div
                className="h-10 w-48 max-w-full rounded-xl bg-white/10 motion-safe:animate-pulse"
                aria-label="در حال دریافت موجودی"
              />
            ) : (
              <p className="text-lg font-bold">موجودی قابل نمایش نیست</p>
            )}
          </div>
          <div className="relative flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-4 text-[10px] leading-5 text-ivory/65">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-gold-soft" /> فقط مبالغ تأییدشده
            </span>
            <span>
              {data
                ? `${toFaDigits(data.count)} بازگشت وجه ثبت‌شده`
                : "گردش حساب اختصاصی شما"}
            </span>
          </div>
        </div>

        <div className="border-navy/10 bg-white/65 dark:border-gold/15 dark:bg-white/3 flex min-w-0 flex-col justify-between gap-5 rounded-[28px] border p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="bg-gold/12 text-gold-deep dark:text-gold grid size-10 shrink-0 place-items-center rounded-2xl">
              <LockKeyhole className="size-4.5" />
            </span>
            <div>
              <h3 className="text-navy dark:text-ivory text-sm font-black">
                درگاه پرداخت، مرحلهٔ بعد
              </h3>
              <p className="text-navy/70 dark:text-wheat mt-2 text-xs leading-7">
                فعلاً موجودی و بازگشت وجه فعال‌اند. شارژ آنلاین، برداشت و پرداخت خرید با
                کیف پول هنوز در دسترس نیستند.
              </p>
            </div>
          </div>
          <div>
            <Button
              type="button"
              disabled
              className="h-11 w-full rounded-2xl border border-navy/10 bg-navy/5 text-navy/70 opacity-100! dark:border-white/10 dark:bg-white/5 dark:text-white/40"
            >
              <LockKeyhole className="size-3.5" /> شارژ آنلاین؛ به‌زودی
            </Button>
            <p className="text-navy/70 dark:text-wheat/70 mt-2 text-center text-[10px] leading-5">
              سفارش لغوشده بدون پرداخت، اعتباری ایجاد نمی‌کند.
            </p>
          </div>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="border-rose/20 bg-rose/5 text-rose flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-xs leading-6"
        >
          <span>{error}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => void reload()}
            disabled={loading}
          >
            تلاش مجدد
          </Button>
        </div>
      ) : null}

      <div className="border-navy/10 bg-white/65 dark:border-gold/15 dark:bg-white/3 overflow-hidden rounded-[26px] border">
        <div className="border-navy/8 dark:border-gold/12 flex items-center justify-between gap-3 border-b px-5 py-4 sm:px-6">
          <h3 className="text-navy dark:text-ivory inline-flex items-center gap-2 text-sm font-black">
            <History className="text-gold-deep dark:text-gold size-4" /> گردش کیف پول
          </h3>
          <span className="text-navy/70 dark:text-wheat/70 text-[10px]">
            جدیدترین تراکنش‌ها
          </span>
        </div>
        {!data && loading ? (
          <div className="space-y-4 p-6" aria-label="در حال دریافت گردش حساب">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="h-12 rounded-xl bg-navy/4 motion-safe:animate-pulse dark:bg-white/5"
              />
            ))}
          </div>
        ) : data?.count === 0 ? (
          <div className="px-5 py-10 text-center sm:py-12">
            <div
              aria-hidden
              className="relative mx-auto grid size-20 place-items-center rounded-[24px] border border-gold/25 bg-gold/8"
            >
              <WalletCards className="text-gold-deep dark:text-gold size-8" />
              <span className="absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full border-4 border-paper bg-navy text-gold dark:border-dusk">
                <ArrowDownLeft className="size-3" />
              </span>
            </div>
            <h4 className="text-navy dark:text-ivory mt-5 text-sm font-black">
              اولین بازگشت وجه، همین‌جا ثبت می‌شود
            </h4>
            <p className="text-navy/70 dark:text-wheat mx-auto mt-2 max-w-sm text-xs leading-7">
              اگر سفارش پرداخت‌شده را قبل از ارسال لغو کنید، مبلغ تأییدشده همراه با شماره
              پیگیری به این بخش اضافه می‌شود.
            </p>
            <Button
              asChild
              variant="outline"
              className="mt-5 rounded-full border-gold/30 text-navy dark:text-ivory"
            >
              <Link
                href={profileTabHref("orders")}
                onClick={() => announceProfileTab("orders")}
              >
                سفارش‌های من <ArrowLeft className="size-3.5" />
              </Link>
            </Button>
          </div>
        ) : data ? (
          <ul className="divide-navy/7 dark:divide-gold/10 divide-y">
            {data.entries.map((entry) => (
              <li
                key={entry.id}
                className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-3 px-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:px-6"
              >
                <span className="grid size-10 place-items-center rounded-2xl bg-emerald-500/8 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                  <ArrowDownLeft className="size-4.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-navy dark:text-ivory text-xs font-black">
                    بازگشت وجه لغو سفارش
                  </p>
                  <p className="text-navy/70 dark:text-wheat mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[10px] leading-5">
                    <bdi>{entry.orderId}</bdi>
                    <span>·</span>
                    <span>{entry.date}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => void copy(entry.reference)}
                    className="text-navy/70 hover:text-navy dark:text-wheat/70 dark:hover:text-ivory mt-1 inline-flex max-w-full items-center gap-1.5 text-[10px]"
                    title={entry.reference}
                    aria-label={`کپی شماره پیگیری ${entry.reference}`}
                  >
                    {copied === entry.reference ? (
                      <Check className="size-3 shrink-0" />
                    ) : (
                      <Copy className="size-3 shrink-0" />
                    )}
                    <bdi className="truncate">{entry.reference}</bdi>
                  </button>
                </div>
                <div className="col-start-2 flex flex-wrap items-center gap-2 sm:col-auto sm:flex-col sm:items-end sm:justify-center">
                  <b className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                    <bdi>+{formatToman(entry.amount)}</bdi>{" "}
                    <span className="text-[9px] font-bold">تومان</span>
                  </b>
                  <span className="rounded-full bg-emerald-500/8 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">
                    واریز به کیف پول
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-navy/70 dark:text-wheat px-6 py-8 text-center text-xs">
            گردش حساب فعلاً قابل دریافت نیست.
          </p>
        )}
        {data && (page > 1 || data.hasMore) ? (
          <div className="border-navy/8 dark:border-gold/12 flex items-center justify-between border-t px-5 py-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={page === 1 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              <ArrowRight className="size-3.5" /> قبلی
            </Button>
            <span className="text-navy/70 dark:text-wheat text-[11px]">
              صفحهٔ {toFaDigits(page)}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!data.hasMore || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              بعدی <ArrowLeft className="size-3.5" />
            </Button>
          </div>
        ) : null}
      </div>
      <div className="border-gold/15 bg-gold/4 text-navy dark:text-ivory flex flex-wrap items-center justify-between gap-3 rounded-2xl border px-4 py-3">
        <p className="text-[11px] leading-6">دربارهٔ بازگشت وجه پرسشی دارید؟</p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 rounded-full text-[11px] font-bold"
          onClick={() => window.dispatchEvent(new Event("support:open"))}
        >
          <Headphones className="size-3.5 text-gold-deep dark:text-gold" /> گفتگو با
          پشتیبانی
        </Button>
      </div>
    </section>
  );
}
