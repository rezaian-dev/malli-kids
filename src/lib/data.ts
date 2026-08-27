import { seedAdminDb } from "@/lib/admin-data";
import type { AdminDb } from "@/types";

/**
 * Central data seam for the app.
 *
 * Today these return static sample data so the UI has something to render.
 * When the backend is ready, replace each body with `await fetch('/api/...')`
 * (and make the callers await) — no component needs to change shape.
 */
const db: AdminDb = seedAdminDb();

export const getAdminDb = (): AdminDb => db;
export const getProducts = () => db.products;
export const getOrders = () => db.orders;
export const getCustomers = () => db.customers;
export const getReviews = () => db.reviews;
export const getCoupons = () => db.coupons;
export const getBanners = () => db.banners;
export const getArticles = () => db.articles;
export const getMessages = () => db.messages;
export const getSettings = () => db.settings;
