export default function Loading() {
  return (
    <main className="min-h-dvh bg-atelier px-3 py-3 sm:px-6 sm:py-6 lg:px-8 dark:bg-navy-deep">
      <div className="mx-auto grid min-h-[calc(100dvh-1.5rem)] max-w-6xl overflow-hidden rounded-[30px] border border-navy/10 bg-paper shadow-[0_24px_70px_-34px_rgba(4,20,39,.55)] sm:min-h-[calc(100dvh-3rem)] lg:grid-cols-[minmax(0,1.04fr)_minmax(25rem,.96fr)] dark:border-gold/25 dark:bg-dusk">
        <div className="hidden bg-navy/10 dark:bg-navy-mid/35 lg:block" />
        <section className="flex min-w-0 flex-col gap-8 px-5 py-6 sm:px-10 sm:py-9 lg:px-12 lg:py-10">
          <div className="h-8 w-28 animate-pulse rounded-full bg-sand dark:bg-dusk-soft" />
          <div className="mx-auto w-full max-w-md space-y-4 pt-8">
            <div className="h-3 w-44 animate-pulse rounded-full bg-sand dark:bg-dusk-soft" />
            <div className="h-10 w-56 animate-pulse rounded-2xl bg-sand dark:bg-dusk-soft" />
            <div className="h-5 w-full animate-pulse rounded-full bg-sand dark:bg-dusk-soft" />
            <div className="h-12 w-full animate-pulse rounded-2xl bg-sand dark:bg-dusk-soft" />
            <div className="h-48 w-full animate-pulse rounded-2xl bg-sand dark:bg-dusk-soft" />
          </div>
        </section>
      </div>
    </main>
  );
}
