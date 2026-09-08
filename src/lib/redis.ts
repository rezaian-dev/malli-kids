import "server-only";
import { Redis } from "@upstash/redis";
import type { SecondaryStorage } from "@better-auth/core/db";

// 🔴 Upstash — HTTP-based, so it's a plain fetch under the hood: no TCP pool to
// exhaust or warm up across serverless invocations, unlike `ioredis`/`redis`.
// That's what makes it the standard pick for rate limiting on Vercel functions
// (the same platform `src/lib/sms.ts` is already worked around IP-blocking for).
// Optional by design: every consumer below degrades to an in-memory fallback
// when these env vars are unset, so local dev needs no Redis at all.
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = url && token ? new Redis({ url, token }) : null;

// 🏷️ This Upstash database may be shared with other, unrelated apps (one free
// instance reused across side projects) — every key this app writes is
// namespaced so it can never collide with another project's keys on the same DB.
const KEY_PREFIX = "malli-kids:auth:";

// 🧮 Feeds Better Auth's own rate limiter (`rateLimit.storage: "secondary-storage"`
// in `auth.ts`) so the phone-OTP endpoints — the ones that actually cost money per
// send — are throttled across every serverless instance, not just whichever one
// happened to handle a given request.
export const authSecondaryStorage: SecondaryStorage | undefined = redis
  ? {
      get: (key) => redis.get(KEY_PREFIX + key),
      getAndDelete: (key) => redis.getdel(KEY_PREFIX + key),
      set: (key, value, ttl) =>
        ttl
          ? redis.set(KEY_PREFIX + key, value, { ex: ttl })
          : redis.set(KEY_PREFIX + key, value),
      delete: async (key) => {
        await redis.del(KEY_PREFIX + key);
      },
      // ⚛️ Fixed-window counter: TTL is only armed on the key's first hit (INCR
      // returning 1), so later increments never push the window back out —
      // exactly the contract Better Auth's rate limiter documents needing.
      async increment(key, ttl) {
        const value = await redis.incr(KEY_PREFIX + key);
        if (value === 1) await redis.expire(KEY_PREFIX + key, ttl);
        return value;
      },
    }
  : undefined;
