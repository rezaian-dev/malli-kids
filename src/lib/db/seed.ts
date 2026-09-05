import { connectMongoose } from "./mongoose";
import { cached } from "./shared";
import { ProductModel } from "./models/product";
import { ArticleModel } from "./models/article";
import { FestiveBannerModel } from "./models/festive-banner";
import { CouponModel } from "./models/coupon";
import { CORE_PRODUCTS } from "@/lib/data/products";
import { seedBanners } from "@/lib/festive/occasions";

// 🌱 One-time seed for catalog/articles/banners; customer-activity collections
// stay empty. Coupons match the banner copy. 📰 Inlined — only read here
const ARTICLES = [
  {
    slug: "size",
    tag: "اندازه",
    title: "راهنمای سایز بدون اشتباه",
    excerpt: "قد بدون کفش، دور سینه و انتخاب بین دو سایز.",
    body: "این راهنما را کنار جدول سایز و صفحه محصول بخوانید تا سفارش اول برنگردد. اگر بین دو سایز هستید معمولاً سایز بزرگ‌تر راحت‌تر است؛ به‌خصوص برای پالتو و لباس رویی.",
  },
  {
    slug: "fabric",
    tag: "مراقبت",
    title: "پارچه مناسب پوست حساس",
    excerpt: "پنبه ارگانیک، شست‌وشوی ۳۰ درجه و اتوی ملایم.",
    body: "پنبه ارگانیک، شست‌وشوی ۳۰ درجه و اتوی ملایم. این راهنما را کنار جدول سایز و صفحه محصول بخوانید تا سفارش اول برنگردد.",
  },
  {
    slug: "party",
    tag: "استایل",
    title: "استایل جشن تولد دخترانه",
    excerpt: "پیراهن، تل، کفش و جوراب را چطور هماهنگ کنید.",
    body: "پیراهن، تل، کفش و جوراب را چطور هماهنگ کنید. برای دیدن مدل‌ها به فروشگاه بروید یا از پرو مجازی سایز پیشنهادی بگیرید.",
  },
];

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

  // 🔒 Real database-level lock via the _id unique index — prevents two cold-starting processes from both seeding.
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
    // 🪶 seedBanners()'s id isn't in the schema — Mongoose's strict mode drops it on insert.
    FestiveBannerModel.insertMany(seedBanners()),
    CouponModel.insertMany(SEED_COUPONS),
  ]);
}

// 🚪 Call once from the root layout; memoized per process, and the lock above makes it safe across processes.
export const ensureSeeded = cached("_seeded", seedIfEmpty);
