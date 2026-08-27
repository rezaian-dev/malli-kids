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
          <p className="text-xs font-bold text-navy/45 dark:text-wheat">
            <Link href="/" className="hover:text-gold">
              خانه
            </Link>
            <span className="mx-1.5 text-gold">/</span>
            {crumb}
          </p>
          {kicker ? <p className="lux-kicker mt-5">{kicker}</p> : null}
          <h1 className="lux-title mt-2 text-[clamp(1.6rem,4.5vw,2.6rem)]">{title}</h1>
          <span className="mt-4 block h-px w-16 bg-linear-to-l from-gold to-transparent" aria-hidden />
          {lead ? <p className="lux-muted mt-4 max-w-2xl text-sm leading-8 sm:text-base">{lead}</p> : null}
        </div>
      </div>
    </header>
  );
}
