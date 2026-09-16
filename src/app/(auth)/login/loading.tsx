export default function Loading() {
  return (
    <main
      dir="ltr"
      className="grid min-h-dvh bg-atelier dark:bg-navy-deep lg:grid-cols-[minmax(0,1.04fr)_minmax(28rem,.96fr)]"
    >
      <div className="hidden min-h-dvh bg-navy/10 dark:bg-navy-mid/35 lg:block" />
      <section className="bg-paper flex min-h-dvh min-w-0 flex-col px-5 py-2 sm:px-8 sm:py-5 lg:px-10 lg:py-2 xl:px-12 dark:bg-dusk">
        <div className="h-8 w-28 animate-pulse rounded-full bg-sand dark:bg-dusk-soft" />
        <div className="mx-auto w-full max-w-md flex-1 space-y-3 pt-4 sm:pt-5 lg:pt-2">
          <div className="h-3 w-44 animate-pulse rounded-full bg-sand dark:bg-dusk-soft" />
          <div className="h-10 w-56 animate-pulse rounded-2xl bg-sand dark:bg-dusk-soft" />
          <div className="h-5 w-full animate-pulse rounded-full bg-sand dark:bg-dusk-soft" />
          <div className="h-12 w-full animate-pulse rounded-2xl bg-sand dark:bg-dusk-soft" />
          <div className="h-48 w-full animate-pulse rounded-2xl bg-sand dark:bg-dusk-soft" />
        </div>
      </section>
    </main>
  );
}
