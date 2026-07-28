import { connectMongoose } from "./mongoose";
import { cached } from "./shared";
import { ProductModel } from "./models/product";
import { ArticleModel } from "./models/article";
import { FestiveBannerModel } from "./models/festive-banner";
import { CouponModel } from "./models/coupon";
import { CORE_PRODUCTS } from "@/lib/data/products";
import { ARTICLES } from "@/lib/data/pages";
import { seedBanners } from "@/lib/festive/occasions";

// 🌱 One-time content seed: the catalog copy, magazine articles and occasion
// banners are real, hand-written content worth keeping as the app's initial
// data — not fabricated activity. Deliberately excludes orders, reviews,
// tickets and collab requests: those represent real customer activity, so a
// fresh install starts them honestly empty instead of pre-loaded with
// fictional people.
//
// The promo codes referenced by the seeded banners' own copy ("۲۰٪ با کد
// NOWRUZ20"…) are seeded as real coupons too — otherwise the site would be
// advertising codes that don't work, which is a correctness bug, not fake
// data.
const SEED_COUPONS = [
  { code: "NOWRUZ20", title: "تخفیف نوروز", rate: 0.2 },
  { code: "SUMMER15", title: "تخفیف تابستانه", rate: 0.15 },
  { code: "MALLI10", title: "تخفیف عضویت", rate: 0.1 },
  { code: "MEHR10", title: "تخفیف بازگشایی مدارس", rate: 0.1 },
  { code: "FALL15", title: "تخفیف پاییزه", rate: 0.15 },
  { code: "YALDA20", title: "تخفیف شب یلدا", rate: 0.2 },
  { code: "ESFAND25", title: "تخفیف حراج پایان سال", rate: 0.25 },
].map((c) => ({
  ...c,
  used: 0,
  cap: 500,
  active: true,
  min: 0,
  until: "۱۴۰۶/۱۲/۲۹",
}));

async function seedIfEmpty() {
  const mongoose = await connectMongoose();

  // 🔒 A real database-level lock, not just the in-process cache below —
  // every MongoDB collection already has a unique index on `_id` for free,
  // so whoever's `insertOne` wins this race actually seeds; every other
  // caller (a second server instance starting cold at the same moment,
  // e.g. serverless) gets a duplicate-key error and skips. Without this,
  // two processes can both read "0 documents" a moment apart and both
  // insert — real double-seeded data, not a hypothetical.
  try {
    await mongoose.connection.collection("_seed_lock").insertOne({
      _id: "content-seed-v1" as unknown as never,
    });
  } catch {
    return;
  }

  await Promise.all([
    ProductModel.insertMany(CORE_PRODUCTS),
    ArticleModel.insertMany(ARTICLES),
    // 🪶 `seedBanners()`'s `id` isn't in `FestiveBannerModel`'s schema —
    // Mongoose's default strict mode drops unknown fields on insert.
    FestiveBannerModel.insertMany(seedBanners()),
    CouponModel.insertMany(SEED_COUPONS),
  ]);
}

/** 🚪 Call once from the root layout. Memoized per process via the same
 *  `cached()` helper `connectMongoose()` uses — cheap on every later
 *  request in a process that already seeded; the lock above is what makes
 *  it safe across processes too. */
export const ensureSeeded = cached("_seeded", seedIfEmpty);
