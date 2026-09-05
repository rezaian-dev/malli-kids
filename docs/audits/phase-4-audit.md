# Malli Kids — Phase 4 Audit: Profile as an Account Experience

**Scope:** Profile (info/orders/wishlist/support), account/child/address forms, Chrome autofill, avatar
lifecycle, and the map location picker (UX intent, reliability, network, a11y, responsive). Read +
targeted fixes — unlike Phase 1, this phase *did* change code where a concrete, verifiable defect was
found. No architecture/folder changes; every fix is additive to the existing route-colocated pattern
(see `nextjs-app-router-colocation` decision from Phase 2/3).

**Headline finding:** the map, avatar, and autofill CSS were already in a mature, well-engineered state
going into this phase — comments in `address-map-field.tsx`, `leaflet-loader.ts`, `theme.css` and
`next.config.ts` show these were already root-caused and fixed in earlier (unlabeled) work. The real gaps
this phase found were elsewhere: **no visible "submitting" state on almost every form in the app** (a
double-click hazard, not just a polish gap) and **two structural autofill dead ends** (the city combobox,
the checkout dialog's contact fields).

---

## Profile issues

State sync across the seven listed areas, checked against `useStore()`/`getSessionUser()`:

- **Email, Name, Avatar, Children, Addresses** — all synced correctly. `getSessionUser()` →
  `buildUser()` merges Better Auth identity with the `Profile` Mongoose doc server-side on every request
  (`src/lib/auth/user.ts`), so `useStore().user` is complete on first paint — no "fields pop in a beat
  later" flash. Every mutating action (`updateAccountAction`, `updateChildAction`, `updateAvatarAction`,
  `removeAvatarAction`) returns a patch that `updateUser()` merges into the same client store, so the
  header, the form, and any other consumer re-render from one source of truth. No bug found.
- **Orders, Wishlist** — `ProfileOrdersPanel`/`ProfileWishlistPanel` poll (`usePolling`, 20s/on-demand)
  and re-fetch by id-list, respectively; both pause when there's no session. No bug found.
- **Support** — tickets poll every 8s while the tab is open. Found and fixed a **double-submit hazard**:
  neither "ثبت تیکت" (new ticket) nor a ticket's reply box disabled itself while its action was in
  flight, so a fast double-click/double-Enter could file the same ticket or reply twice. Fixed with a
  local `submitting`/`sending` guard in both `profile-support-panel.tsx` and `ticket-thread.tsx`.
- **Notifications** — there is **no Notifications section inside `/profile`**. The only notification
  surface in the app is the header's `notices-bell.tsx`, which is global chrome, not part of the profile
  page. Flagging this as a real gap against the brief rather than reviewing a component that doesn't
  exist: if a "Notifications" tab is actually wanted inside Profile, it needs to be scoped and built, not
  audited.

## Form issues

Checked the idle → editing → submitting → success/error machine across Profile, Address, Child,
Checkout, Auth, Admin.

- **Already correct:** the checkout dialog (`product-checkout-dialog.tsx`, `useTransition` + disabled
  buttons + "در حال ثبت…" label swap + an idempotency key so a retried submit can't double-order) and
  the admin login form (`admin-login-landing.tsx`, manual `pending` state, same pattern). These were the
  reference implementations for the fix below.
- **Found broken everywhere else:** every `<AppForm>`-based form (all of Profile's Account/Child forms,
  all four Auth panels — login, register, forgot-password, OTP) rendered a plain `<Button type="submit">`
  with no pending state at all. Nothing disabled the button or showed feedback while its Server Action was
  in flight, so a fast double-click fired the same submit twice, and the user had zero visual confirmation
  the form was doing anything between click and toast.
- **Root-cause fix, not a per-form patch:** added `components/form/submit-button.tsx`. It reads
  `useFormContext().formState.isSubmitting` — a value **react-hook-form already tracks automatically**
  around `form.handleSubmit`'s async callback, so this needed no new plumbing, no `useTransition`, and no
  timeout/polling of any kind. `<SubmitButton>` disables itself, sets `aria-busy`, and shows a spinner +
  optional `pendingLabel` for exactly as long as submission is in flight. Wired into `AccountForm`,
  `ChildForm`, and all four Auth panels (`auth-login-panel.tsx`, `auth-register-panel.tsx`,
  `auth-forgot-password-panel.tsx`, `auth-otp-panel.tsx` — both its phone and code steps).
- **Left as a known gap (not silently claimed fixed):** the same missing-pending-state pattern also
  exists in a handful of forms outside this phase's named scope — `collab-form.tsx`,
  `product-review-form.tsx`, `newsletter-form.tsx`, `tryon-notify-form.tsx`, and most `(admin)/**`
  content forms (articles/products/coupons/banners editors). They can adopt the same `<SubmitButton>`
  with no further plumbing; not touched here to keep this phase's diff scoped to Profile/Auth/Checkout.

## Autofill issue

Root-cause, not hack, per the brief's rule — no `setTimeout`/polling was added anywhere.

- **Confirmed already correct:** `theme.css`'s `:-webkit-autofill` handling is the right shape — it never
  fights Chromium's own fill (`transition: background-color 9999s` delays the yellow paint instead of
  fighting it with `!important` backgrounds), sets `-webkit-text-fill-color`/`caret-color` explicitly for
  both themes and for the `inset` skin (auth/checkout look) separately from the default skin, and there's
  a dedicated rule for `.newsletter-field` on a dark hero background. Every `TextField`/`TextareaField`
  correctly forwards `name` (from react-hook-form) + `autoComplete`, so Chrome's autofill fills them and
  the text stays legible in both themes — the exact "filled but invisible" failure mode named in the brief
  does not reproduce on any of these.
- **Found and fixed — structurally impossible autofill on two fields:**
  1. **City field** (`ComboboxField`/`Combobox`, used for `city` in `AccountForm`): the underlying
     `<input>` hardcoded `autoComplete="off"` and never received a `name` at all. Chrome had no attribute
     to match this field against a saved address, so of the four address-group fields (postal code,
     **city**, street address, phone), city alone could never autofill — a real, silent inconsistency a
     user filling the form via autofill would hit immediately. Fixed by adding `name`/`autoComplete`
     props through `ComboboxField` → `Combobox` (defaulting to the previous `"off"` for other call sites,
     since this is the only one), and setting `autoComplete="address-level2"` where it's used for city.
     The custom type-ahead filtering is untouched — the attribute only affects whether Chrome can
     correlate/offer this field, not how the list behaves.
  2. **Checkout dialog** (`product-checkout-dialog.tsx`): phone/city/address/postal-code inputs had
     `autoComplete` hints but no `name` attribute, and were not inside a `<form>` element at all (a plain
     div with an `onClick` submit button) — both weaken Chrome's ability to treat them as one address
     record, and the missing `<form>` meant Enter did nothing in any field but the coupon box. Fixed by
     wrapping the fields in a real `<form onSubmit>` (Enter now submits the order, matching every other
     form in the app) and giving each input a `name` (`tel`, `address-level2`, `street-address`,
     `postal-code`).

## Avatar

Upload → replace → delete → display → session → header, all checked:

- **Upload/replace:** client-side size gate (1MB) before compression, then `compressToDataUrl` (Web
  Worker, CSP already allow-lists `worker-src blob:` for it), then `updateAvatarAction` persists to the
  `Profile` doc and returns the patch that `updateUser()` merges — header photo and the info panel's
  implicit "has avatar" state update in the same render, no refresh needed.
- **Delete:** already correctly root-caused — `removeAvatarAction` does `$unset` (not `$set: {avatar:
  undefined}`, which Mongoose's driver just drops as a no-op) so the field is actually removed
  server-side, and the client explicitly calls `updateUser({ avatar: undefined })` rather than trusting the
  action's round-tripped `data` (a Server Action return value doesn't reliably carry an explicit `undefined`
  key back across the RSC boundary — it just arrives absent, and a naive `{...current, ...patch}` merge
  would then silently keep showing the old photo despite a successful server-side delete). This is exactly
  the "must sync without a browser refresh" requirement in the brief, and it already works. No bug found.
- **Session:** avatar is read from the merged `Profile` doc on every request via `buildUser()`, so a
  fresh sign-in / page reload always shows the persisted photo, not a stale client value.

## Address

- Single free-text `address` field + city combobox + postal code + the map picker, no duplicated
  information shown (map's own "آدرس یافت‌شده" preview only appears inside the (collapsible) map card,
  and only becomes the form's real `address` value once "تأیید" is pressed — it doesn't render twice).
- RTL: the address textarea, labels, and map card all render correctly in the app's RTL context;
  Persian text reveal in the map's address preview is word-level (not per-character) specifically because
  per-character `<span>`s would break Arabic-script glyph joining — a real, previously-solved RTL
  correctness issue documented in `address-map-field.tsx`.
- Mobile: map card is `h-72`/`sm:h-80`, buttons and the GPS control stay reachable and are not clipped at
  narrow widths; the whole account form uses a responsive 1↔2 column grid.
- City autofill gap fixed — see Autofill section above.

## Map implementation

Already built to (and largely exceeding) the brief before this phase started:

- **Fixed center-selector overlay**, exactly as requested: the pin is plain React/CSS
  (`pointer-events-none`, absolutely centered), never a Leaflet marker. The map pans underneath it; on
  every `moveend` (drag, GPS `flyTo`, keyboard arrow-pan, or tap-to-recenter — all funnel through the
  same handler) the code reads `map.getCenter()`, never a marker's own coordinates, and that becomes the
  *candidate* location.
- **Candidate vs. saved distinction** is real, not cosmetic: `picked` (the map's last-settled center) is
  local component state, separate from the react-hook-form `lat`/`lng` fields. Only "تأیید و استفاده از
  این آدرس" copies `picked` into the form (`shouldDirty: true`), and that form value is only truly
  persisted once "ذخیره حساب" submits — so a user who opens the map, pans around, and closes without
  confirming changes nothing. The toast on confirm explicitly says "برای ذخیرهٔ نهایی «ذخیره حساب» را
  بزنید" so the user is never told something is saved before it is.
- **Loading state:** on-brand skeleton (pulsing pin + "در حال بارگذاری نقشه…" on the brand gradient), no
  layout shift — the map card's box has a fixed height before Leaflet mounts, and the map fades in via
  opacity on a *wrapper* div, never by toggling Leaflet's own `className` (that would race Leaflet's own
  DOM writes and could wipe its classes — documented and already avoided in the code).

## Why this map interaction was selected

Not re-litigated this phase — it's already the right call and already implemented: a fixed center
overlay reads unambiguously as "the map's current center is what I'm choosing," matches the mental model
users already have from Google Maps/Airbnb's own pin-drop picker, and needs no extra instruction beyond
the one line of help text under the map. The alternative (a real draggable marker kept visually pinned to
the viewport center via a `move`-tick re-read) was already tried and reverted per the code comments — it
fought the browser's compositor-driven pan and read as laggy. A plain overlay that only *reacts* to
`movestart`/`moveend` is both simpler and smoother, and it's also what makes the keyboard-pan path free:
Leaflet's own arrow-key handling already fires `moveend`, so no separate keyboard affordance had to be
built.

## Network

- **No duplicate map instances / tile requests:** exactly one `AddressMapField` can ever be mounted (it's
  a `-mt-2` block inside `AccountForm`, itself only rendered when the "info" tab is active — switching
  tabs unmounts it entirely rather than hiding it) and its own effect builds one `L.Map` on open and
  `.remove()`s it on close/unmount, keyed only on `[open]`.
- **No duplicate geocoding:** `handleSettle` debounces 600ms before calling `reverseGeocodeAction`, and
  the server side rate-limits it per-user (20/min) on top of that — a flurry of small pans/keyboard
  repeats can't turn into a burst of Nominatim requests.
- **No effect loops / polling:** the map-building `useEffect` intentionally depends only on `[open]`
  (documented `eslint-disable` with the reasoning inline) so it never re-runs on unrelated re-renders; a
  `ResizeObserver` (not a timed `invalidateSize()` guess) keeps Leaflet's internal size in sync with the
  card's own expand animation.
- Reviewed CSP (`next.config.ts`) against actual network calls: `img-src` allow-lists
  `server.arcgisonline.com` for tile images, reverse geocoding happens **server-side** in
  `reverseGeocodeAction` so it needs no `connect-src` entry, and `worker-src blob:` covers the avatar
  compressor's Web Worker. No CSP-caused silent failures found.

## Accessibility

- The Leaflet container carries `role="group"` and a full-sentence `aria-label` describing the
  drag/tap/keyboard interaction model in Persian — a screen-reader user gets the same mental model a
  sighted user gets from the overlay, without needing sight to infer it.
- Keyboard: Leaflet's native arrow-key panning plus this app's own `focus-visible` ring on the map
  container; the GPS button, address textarea, "تأیید"/"انصراف" buttons are all real, natively focusable
  elements in normal tab order — nothing here relies on hover or mouse-only affordances.
- The reverse-geocoded address updates inside an `aria-live="polite"` region, once per geocode (the
  letter/word reveal is a decorative CSS-only overlay on top of an unchanging `value`, so this never
  floods a screen reader with per-letter updates).
- Fixed this phase: every `<AppForm>` submit button now sets `aria-busy` while submitting, so
  assistive tech gets the same "something is happening" signal sighted users get from the new spinner.

## Responsive

Reviewed at mobile/tablet/desktop breakpoints in code (Tailwind `sm:`/`lg:` usage, no fixed pixel widths
on the map card or its controls): map card scales `h-72 → sm:h-80`, the account form grid collapses to a
single column below `sm:`, the checkout dialog is a `max-w-md` sheet that fits mobile viewports without
horizontal scroll. No responsive-specific defect found in this pass (a rendered/visual Playwright check
across 320–1536px, called out as still-needed in the Phase 1 audit's P2, remains outstanding — this phase
was still a code-level review of layout rules, not a rendered one).

## Tests

Verified by reading the actual code paths for the section 14 scenario end-to-end (open profile → map
loads → move map → candidate coordinates → confirm → saved address → reload → persists):

1. `ProfileInfoPanel` is client-only (`dynamic(..., { ssr: false })`) so Leaflet never runs during SSR.
2. `AddressMapField`'s effect builds the map on open, seeding from the form's existing `lat`/`lng` (or
   `BRAND.map` default) — confirmed via `getValues()`, not stale closure state.
3. `moveend` → `handleSettle` → `picked` state + debounced `reverseGeocodeAction` → typewriter reveal —
   confirmed single code path for drag/GPS/keyboard/tap.
4. "تأیید" copies `picked`/`preview` into the react-hook-form fields (dirty, not yet submitted).
5. "ذخیره حساب" submits `AccountForm` → `updateAccountAction` → `Profile.updateOne($set)` → returns the
   patch → `updateUser()` merges it into the client store.
6. A reload re-runs `getSessionUser()` → `buildUser()` → `Profile.findOne()`, which includes `lat`/`lng`/
   `address` — so the picked location is genuinely present after a hard reload, not just in client state.

No automated test suite exists for this flow in the repo (no Playwright/e2e harness was found under
`d:\malli-kids`); the above is a verified code-path trace, not a screenshot/browser run. Also
build-verified this phase's actual changes: `tsc --noEmit`, `eslint` (scoped to changed files), and a full
`next build` all pass clean with the new `SubmitButton`, the combobox/checkout autofill fixes, and the
support-panel double-submit guards in place.

---

## Files changed this phase

- `src/components/form/submit-button.tsx` (new) — shared idle/submitting-aware submit button
- `src/components/form/index.ts` — export it
- `src/app/(storefront)/profile/_components/account-form.tsx` — `SubmitButton`, city `autoComplete`
- `src/app/(storefront)/profile/_components/child-form.tsx` — `SubmitButton`
- `src/components/auth/auth-login-panel.tsx` / `auth-register-panel.tsx` /
  `auth-forgot-password-panel.tsx` / `auth-otp-panel.tsx` — `SubmitButton`
- `src/components/form/combobox-field.tsx`, `src/components/ui/combobox.tsx` — `name`/`autoComplete`
  passthrough (root-cause city-autofill fix)
- `src/app/(storefront)/product/[id]/_components/product-checkout-dialog.tsx` — real `<form>`, `name`
  attributes on every field
- `src/app/(storefront)/profile/_components/profile-support-panel.tsx`,
  `ticket-thread.tsx` — double-submit guards

## Carried forward (not this phase's scope, not silently fixed)

- Missing-pending-state pattern in `collab-form.tsx`, `product-review-form.tsx`, `newsletter-form.tsx`,
  `tryon-notify-form.tsx`, and `(admin)/**` content-editor forms — same `<SubmitButton>` fix applies,
  intentionally not touched here to keep the diff scoped to Profile/Auth/Checkout.
- No "Notifications" section exists inside `/profile` — only the global header bell. Needs a scoping
  decision, not an audit finding, if it's actually wanted there.
- Real per-viewport/browser (Playwright) responsive + a11y verification, called out as outstanding since
  Phase 1's P2 — this phase's Map/Responsive/Accessibility sections remain a code-level review.
