import Link from "next/link";

export function Intro({
  crumb,
  kicker,
  title,
  lead,
}: {
  crumb: string;
  kicker?: string;
  title: string;
  lead?: string;
}) {
  return (
    <header className="relative mb-10 sm:mb-14">
      <div className="container mx-auto w-full max-w-5xl px-3 xs:px-4 sm:px-5 lg:px-7">
        <div className="overflow-hidden rounded-[28px] border border-gold/30 bg-white/90 px-5 py-7 shadow-[0_18px_40px_-28px_rgba(14,42,71,.28)] dark:border-gold/35 dark:bg-slate/50 sm:px-8 sm:py-9">
          <nav aria-label="مسیر صفحه" className="text-xs font-bold text-navy/45 dark:text-wheat">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li>
                <Link href="/" className="hover:text-gold">
                  خانه
                </Link>
              </li>
              <li aria-hidden className="text-gold">
                /
              </li>
              <li className="text-navy/60 dark:text-ivory/80">{crumb}</li>
            </ol>
          </nav>
          {kicker ? <p className="mt-5 text-[11px] font-black tracking-[0.22em] text-gold">{kicker}</p> : null}
          <h1 className="mt-2 text-[clamp(1.6rem,4.5vw,2.6rem)] font-black leading-snug text-navy dark:text-ivory">{title}</h1>
          <span className="mt-4 block h-px w-16 bg-linear-to-l from-gold to-transparent" aria-hidden />
          {lead ? <p className="mt-4 max-w-2xl text-sm leading-8 text-navy/55 dark:text-wheat sm:text-base">{lead}</p> : null}
        </div>
      </div>
    </header>
  );
}
