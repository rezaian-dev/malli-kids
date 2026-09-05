# Malli Kids — Phase 1 Architecture Audit

**Scope:** Full-codebase review (storefront, admin, auth, commerce, DB, caching, SEO, security). Read-only — no application code or architecture was changed in this phase.
**Stack confirmed from repo:** Next.js 16.3.3 (App Router), React 19.2.8, Mongoose 9 + MongoDB driver 7 (separate client for Better Auth), Better Auth 1.7, Tailwind 4, Zod 4.

---

## Executive Summary

The codebase is more mature than a typical audit target: route-colocated `_components`/`_lib`, tag-based `unstable_cache` on all public reads with matching `revalidateTag` on admin writes, consistent `requireAdmin()`/`requireAdminPage()` gating on every admin mutation and page, solid SEO layer (JSON-LD, canonical, sitemap, robots), documented rate-limiting and auth session tradeoffs. **No critical/must-fix-now security bug was found**, so per the Phase 1 rule, no code was changed.

The real risk is **commerce-logic correctness**, not security: the cart UI is fully functional but has no path to checkout (checkout is a separate single-item "Buy Now" flow), and every order is marked as paid at creation regardless of the store's actual cash-on-delivery model. Product stock is a boolean, not a quantity — several standard commerce/admin features (per-size availability, real low-stock alerts) are architecturally impossible until that changes.

---

## Critical Findings

1. **Order `pay` status is always `"پرداخت‌شده"` (Paid) at creation, regardless of COD.**
   `createOrder()` ([src/lib/shop/orders.ts:100](../../src/lib/shop/orders.ts#L100)) hardcodes `pay: "پرداخت‌شده"`. The type/enum also defines `"در انتظار"` (pending) and `"ناموفق"` (failed), but **no code path anywhere ever sets these** — dead states. Since checkout copy explicitly says payment happens on delivery (`پرداخت هنگام تحویل`), every order is mislabeled as collected the instant it's placed.
   - **Downstream impact:** the invoice route (`/api/orders/[id]/invoice`) gates PDF generation on `pay === "پرداخت‌شده"`, and the admin sales chart / dashboard revenue figure (`src/lib/admin/sales.ts`, `dashboard-landing.tsx`) both filter on the same field — so "revenue" and "paid order" reporting is not actually tracking real payment collection.

2. **The cart has no checkout path — it is a functional dead end.**
   `addToCart`/qty/remove are fully wired (cookie + localStorage, `store-provider.tsx`), and the cart badge/sheet work. But `CartSheet` ([src/components/layout/cart-sheet.tsx](../../src/components/layout/cart-sheet.tsx)) has no submit/checkout action — its only CTA links to `/shop`, and its own subtitle reads "خرید آنلاین به‌زودی" (online purchase coming soon). The only real purchase flow is a separate single-product "Buy Now" dialog (`product-checkout-dialog.tsx`) opened directly from the product page, bypassing the cart entirely. Users can build a multi-item cart that can never become an order.

3. **Product stock is boolean, not quantity.**
   `ProductDoc.stock: boolean` ([src/lib/db/models/product.ts](../../src/lib/db/models/product.ts)) — no per-unit count, no per-size availability. The size selector on the product page (`SIZES` in `product-buy-panel.tsx`) is a hardcoded list identical for every product, unconnected to any real inventory field. This blocks real "low stock" admin reporting and per-size sellout handling.

None of the above are security vulnerabilities requiring an emergency fix; they are commerce-correctness/data-integrity gaps and are listed as P0 for Phase 2.

---

## Priority Issues

### P0 (Phase 2 — commerce correctness)
- Wire cart to a real (multi-item) checkout, or remove/relabel "Add to Cart" until it's wired, so the UI stops promising a purchase path that doesn't exist.
- Give `pay` a real lifecycle (`در انتظار` at creation for COD → `پرداخت‌شده`/`ناموفق` set by admin on delivery outcome); fix sales/dashboard/invoice filters to match.
- Move product stock from boolean to a real quantity (ideally per-size) model.

### P1 (Phase 3 — hardening)
- `checkCouponAction` ([src/app/(storefront)/product/[id]/_lib/actions.ts](../../src/app/(storefront)/product/[id]/_lib/actions.ts)) has no session requirement and no rate limit — every other cost/abuse-sensitive action in the app (invoice, tryon, auth) is rate-limited; this one was missed, allowing coupon-code enumeration.
- `incrementCouponUsage` ([src/lib/shop/coupons.ts](../../src/lib/shop/coupons.ts)) is a read-then-write (`used >= cap` check, then separate `$inc`) — not atomic, so concurrent checkouts can push usage past `cap`. Fix: single `findOneAndUpdate` with the cap condition in the filter.
- `getProductsByIdsAction` ([src/lib/shop/products-actions.ts](../../src/lib/shop/products-actions.ts)) accepts an unbounded/unvalidated `ids` array sourced from a client-controlled cookie — add a length/type guard.
- Add an order tracking timeline to the profile "My Orders" panel (status field already exists and is admin-settable; UI-only gap).

### P2 (Phase 4+)
- Real per-viewport responsive verification (320–1536px) via Playwright — Phase 1 was a code read, not a rendered check; Tailwind usage looks disciplined (`sm:`/`xl:` prefixes, `hideTablet`, `truncate`/`min-w-0`) but this is unverified visually.
- Differentiation features (see table below).

---

## Architecture Decisions / Recommendations

- **No folder/module restructuring recommended.** Route-colocated `_components`/`_lib` under `(storefront)`/`(admin)`, shared `lib/`/`components/`/`providers/` split — all already match App Router conventions and this repo's own established pattern. Do not move files in Phase 2+ unless a change specifically requires it.
- **Root layout stays dynamic.** It awaits `cookies()`/session/campaign/banner per request by design; this is intentional, not a caching bug — do not attempt to force static rendering there.
- **The one architectural change actually warranted:** extend `ProductDoc` with real stock quantity (and ideally per-size availability) — this is a schema change, not a folder change, and should be scoped as its own migration-aware task in Phase 2.

---

## Security Concerns

No critical/blocking vulnerability found. Confirmed solid:
- Admin authorization: `requireAdmin()` (Server Actions) / `requireAdminPage()` (pages) consistently applied across all 9 `admin/*/_lib/actions.ts` files and every `/admin/**` page.
- Session/ownership boundaries: order lookup (`getOrderForRequester`) never leaks existence of another user's order; invoice route re-checks session + ownership + `pay` status + rate limit server-side.
- `/api/tryon`: real-session gate, per-user rate limit, and an explicit SSRF guard (rejects any client-supplied absolute URL not matching the request's own origin).
- Auth: Better Auth with documented rate-limit rules on `/sign-in/email`, `/request-password-reset`, `/reset-password`; bootstrap-admin-to-real-role sync is server-only and well isolated; ban-propagation-vs-cookie-cache tradeoff is explicitly documented as an accepted 30s window, not an oversight.

Non-critical gaps carried to P1 above: unrated coupon-check endpoint, non-atomic coupon usage increment, unvalidated `ids` array in a products-by-id action.

---

## Commerce Risks

- Cart → checkout disconnect (Critical Finding #2) is the primary conversion risk: any "Add to Cart" traffic currently cannot convert through the cart.
- `pay` status bug (Critical Finding #1) means admin-facing revenue/paid-order figures do not reflect real COD collection — a financial reporting risk, not just a UI label issue.
- Boolean stock (Critical Finding #3) prevents partial-availability (per-size) selling and real low-stock operations, both called out as expected e-commerce/admin baseline functionality.
- Coupon cap race condition (P1) is a low-volume-tolerable but real overspend risk on discount codes.

---

## Performance / SEO Findings

- **Performance:** nothing critical found. Local variable-weight fonts (no Google Fonts network fetch), `next/image` with AVIF/WebP, `compress: false` is a deliberate, documented tradeoff (avoids a known Gzip-stream listener leak under concurrent requests; compression is expected to happen at the host/CDN layer instead), `usePolling` pauses when the tab is hidden and only polls admin/profile "live" lists.
- **Caching:** public reads (products, articles, banners, campaign settings) are tag-cached via `unstable_cache` with `revalidate: 3600` and are actively busted by `revalidateTag` on every relevant admin write — this is the exact "dynamic layout + cached public data" pattern the audit brief asked to verify, and it's already correctly implemented.
- **SEO:** mature — canonical URLs, JSON-LD for Organization/WebSite/Product/Article/Breadcrumb/FAQ, `aggregateRating` sourced only from real visible reviews (never the marketing `rate` field), sitemap includes shop facet routes with real `lastModified` timestamps, robots.txt correctly excludes `/admin`, `/profile`, `/api`. No issues found.

---

## UX / Accessibility Findings

- Primary UX problem is Critical Finding #2 (cart dead end) — it creates two competing, inconsistently-surfaced purchase mechanisms ("Add to Cart" that goes nowhere vs. "Buy Now — pay on delivery" that is the real flow), which is confusing and undermines trust in the cart UI.
- Product size selector is not connected to real per-product data (hardcoded list) — see Critical Finding #3.
- No accessibility-specific defects were identified during this read-only pass; a real per-viewport/keyboard/screen-reader pass (Phase 4, P2) is still needed since Phase 1 did not include rendered/browser testing.

---

## Dependencies / Blockers Between Phases

- **Phase 2 must land before Phase 3's coupon-atomicity fix is meaningfully testable end-to-end** — both touch the checkout path, so sequence: cart→checkout wiring first, then pay-status lifecycle, then stock model (stock model can be parallelized with the other two if scoped carefully, since it only affects the buy panel's stock check, not order creation itself).
- **`pay` lifecycle fix (P0) blocks the P2 dashboard "COD-collected vs COD-pending" reporting feature** — that feature has no valid data source until `pay` actually transitions states.
- **Cart→checkout wiring (P0) blocks the P1 "Wishlist → Cart quick-add" and any future multi-item order UX** — no value in speeding up entry into a cart that still can't check out.
- **Responsive/Playwright verification (P2, Phase 4) has no blocking dependency** on the P0/P1 items above and can run in parallel at any time.
- No external/environment blockers were identified in Phase 1 (no third-party service, credential, or infra gap prevented any finding from being verified in code).
