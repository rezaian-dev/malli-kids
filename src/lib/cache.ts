/** 🧊 How pages render — one place a teammate can read.
 *
 *  SSG   `dynamic = "force-static"`  about, terms, FAQ, policies (HTML at build)
 *  ISR   `revalidate` below          catalog / merch / magazine
 *  SSR   `dynamic = "force-dynamic"`  cart account, admin
 *
 *  Catalog 60s is the usual fashion-shop window (stock + price). */
export const REVALIDATE = {
  catalog: 60,
  merch: 300,
  editorial: 3600,
} as const;
