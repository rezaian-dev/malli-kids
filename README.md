<p align="center">
  <img src="public/og.jpg" alt="Malli Kids — children's atelier" width="100%" />
</p>

<p align="center">
  <img src="public/brand/logo.png" alt="Malli Kids" height="68" />
</p>

<h1 align="center">Malli Kids</h1>

<p align="center">
  Children’s atelier<br />
  <em>Storefront · Account · Admin</em>
</p>

<p align="center">
  <img src="public/brand/stack.png" alt="Next.js, React, TypeScript, Tailwind, MongoDB, Zod" width="100%" />
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js 16" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-087EA4?style=for-the-badge&logo=react&logoColor=white" alt="React 19" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind-v4-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
  <a href="https://www.mongodb.com"><img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" /></a>
  <img src="https://img.shields.io/badge/Better%20Auth-1.7-111111?style=for-the-badge" alt="Better Auth" />
</p>

---

## About

Malli Kids is a working children’s atelier — not a theme, not a demo store. A garment here is meant to become a childhood memory, so the product has to feel like a studio: quiet luxury, Persian-first copy, and operations a real team can run every day.

This repository is that studio on the web. One **Next.js 16** application holds three surfaces:

| Surface | What it does |
| --- | --- |
| **Storefront** | Home, catalog, product, journal, virtual try-on, trust pages |
| **Account** | Sign-in, profile, children, mapped addresses, orders, wishlist, support |
| **Admin** | Catalog, inventory, orders, Jalali coupons, banners, TipTap magazine, chat, audit |

The default is a Server Component. Client components exist only where the interface must move. Static stories are **SSG**; the catalog is **ISR** so price and stock stay honest; anything behind a session is **SSR**.

Engineering follows the brand: RTL with logical CSS, Persian digits, Jalali **calendar days** (not clock timestamps) for coupon expiry, live inventory locks at checkout, and JSON-LD that matches what the shopper actually sees.

> Malli Kids is not only a children’s clothing label. We stay with the small, unforgettable days.

---

## Features

**Commerce**  
Filterable shop, product gallery, size chart, complete-the-look, verified reviews, back-in-stock, wishlist, cart, coupons, free-shipping threshold, official Playwright PDF invoices.

**Identity**  
Better Auth (password, OTP, reset), admin role, rate-limited mail.

**Operations**  
Sales dashboard, stock matrix, Jalali coupon editor, festive banners, collab intake, live chat + canned replies, review queue, audit log.

**Content & SEO**  
About, FAQ, shipping, size guide, privacy, terms as SSG. Magazine with TipTap. Metadata, sitemap, robots, Organization / Product / FAQ JSON-LD.

**Try-on**  
`/tryon` studio with a dedicated API route.

---

## Rendering

| Routes | Strategy |
| --- | --- |
| About, terms, privacy, FAQ, shipping, size guide | **SSG** `force-static` |
| Home, `/shop`, `/product/*` | **ISR** 60s |
| Collab, contact | **ISR** 5 min |
| Journal | **ISR** 1 hour |
| Profile, try-on, reset, `/admin/*` | **SSR** |

Defined in `src/lib/cache.ts`.

---

## Architecture

```
src/app/(storefront)/   storefront
src/app/admin/          console
src/app/api/            auth · invoice · try-on
src/components/         UI, forms, chat, cart
src/lib/db/             Mongoose models
src/lib/shop/           commerce domain
src/lib/auth/           session & roles
src/proxy.ts            Next.js 16 proxy
```

Layers stay separate: persistence in `lib/db`, domain in `lib/shop` and `lib/auth`, presentation in route groups.

---

## Stack

| Layer | Choice |
| --- | --- |
| App | Next.js 16 · React 19 · TypeScript 5.9 |
| Style | Tailwind CSS v4 · Radix · CVA |
| Data | MongoDB · Mongoose |
| Forms | React Hook Form · Zod 4 |
| Auth | Better Auth · Nodemailer |
| Editorial | TipTap |
| Dates | react-multi-date-picker (Jalali) |
| Maps | Leaflet |
| Invoices | Playwright |
| Carousel | Embla |

---

## Setup

Node 22+ and MongoDB.

```bash
npm install
npm run dev
```

```bash
npm run build && npm start
npm run lint
npm run format:check
```

Playwright is used only to print invoice PDFs — there is no e2e suite in this repo.

---

<p align="center">
  <img src="public/brand/logo.png" alt="" height="40" /><br />
  <sub>Malli Kids · All rights reserved</sub>
</p>
