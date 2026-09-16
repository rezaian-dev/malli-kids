import Image from "next/image";

export default function Loading() {
  return (
    <main
      dir="ltr"
      className="grid min-h-dvh bg-atelier dark:bg-navy-deep lg:grid-cols-[minmax(0,1.04fr)_minmax(28rem,.96fr)]"
    >
      <div className="hidden min-h-dvh bg-navy/10 dark:bg-navy-mid/35 lg:block" />
      <section className="bg-paper flex min-h-dvh min-w-0 flex-col px-5 py-2 sm:px-8 sm:py-5 lg:px-10 lg:py-2 xl:px-12 dark:bg-dusk">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/brand/logo.png"
              alt=""
              width={44}
              height={44}
              sizes="44px"
              loading="eager"
              className="size-10 object-contain dark:brightness-0 dark:invert"
            />
            <span className="font-display leading-none">
              <span className="block text-sm font-bold tracking-[0.2em]">MALLI</span>
              <span className="text-gold-deep dark:text-gold-light mt-1 block text-[10px] tracking-[0.38em]">
                KIDS
              </span>
            </span>
          </div>
          <div className="flex items-center gap-1" aria-hidden>
            <div className="size-10 motion-safe:animate-pulse rounded-full bg-sand dark:bg-dusk-soft" />
            <div className="h-10 w-28 motion-safe:animate-pulse rounded-full bg-sand dark:bg-dusk-soft" />
          </div>
        </header>
        <div className="mx-auto w-full max-w-md flex-1 space-y-3 pt-4 sm:pt-5 lg:pt-2">
          <div className="h-3 w-44 motion-safe:animate-pulse rounded-full bg-sand dark:bg-dusk-soft" />
          <div className="h-10 w-56 motion-safe:animate-pulse rounded-2xl bg-sand dark:bg-dusk-soft" />
          <div className="h-5 w-full motion-safe:animate-pulse rounded-full bg-sand dark:bg-dusk-soft" />
          <div className="h-12 w-full motion-safe:animate-pulse rounded-2xl bg-sand dark:bg-dusk-soft" />
          <div className="h-48 w-full motion-safe:animate-pulse rounded-2xl bg-sand dark:bg-dusk-soft" />
        </div>
      </section>
    </main>
  );
}
