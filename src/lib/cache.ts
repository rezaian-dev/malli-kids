// 🧊 How pages render — one place a teammate can read.
// SSG force-static: about/terms/FAQ/policies · ISR revalidate: catalog/merch/magazine
// SSR force-dynamic: cart/account/admin. Catalog 60s = stock + price window.
export const REVALIDATE = {
  catalog: 60,
  merch: 300,
  editorial: 3600,
} as const;
