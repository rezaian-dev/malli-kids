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

// 🛟 Rate limiting is a defense layer, not core functionality — a wrong URL, a
// deleted database, or a transient Upstash outage must never take down sign-in
// or sign-up. Every call below fails OPEN (degrades to "not rate-limited")
// instead of throwing, so a broken Redis config only weakens throttling, it
// doesn't 500 every auth request. Errors are logged, but throttled to avoid
// flooding the log when Redis is down for a while.
let lastErrorLogAt = 0;
function logRedisError(op: string, err: unknown) {
  const now = Date.now();
  if (now - lastErrorLogAt < 30_000) return;
  lastErrorLogAt = now;
  const reason = err instanceof Error ? err.message : String(err);
  console.error(
    `[redis] ${op} failed — rate limiting degraded to fail-open until this clears. ${reason}`,
  );
}

// 🧮 Feeds Better Auth's own rate limiter (`rateLimit.storage: "secondary-storage"`
// in `auth.ts`) so the phone-OTP endpoints — the ones that actually cost money per
// send — are throttled across every serverless instance, not just whichever one
// happened to handle a given request.
export const authSecondaryStorage: SecondaryStorage | undefined = redis
  ? {
      async get(key) {
        try {
          return await redis.get(KEY_PREFIX + key);
        } catch (err) {
          logRedisError("get", err);
          return null;
        }
      },
      async getAndDelete(key) {
        try {
          return await redis.getdel(KEY_PREFIX + key);
        } catch (err) {
          logRedisError("getAndDelete", err);
          return null;
        }
      },
      async set(key, value, ttl) {
        try {
          if (ttl) await redis.set(KEY_PREFIX + key, value, { ex: ttl });
          else await redis.set(KEY_PREFIX + key, value);
        } catch (err) {
          logRedisError("set", err);
        }
      },
      async delete(key) {
        try {
          await redis.del(KEY_PREFIX + key);
        } catch (err) {
          logRedisError("delete", err);
        }
      },
      // ⚛️ Fixed-window counter: TTL is only armed on the key's first hit (INCR
      // returning 1), so later increments never push the window back out —
      // exactly the contract Better Auth's rate limiter documents needing.
      async increment(key, ttl) {
        try {
          const value = await redis.incr(KEY_PREFIX + key);
          if (value === 1) await redis.expire(KEY_PREFIX + key, ttl);
          return value;
        } catch (err) {
          logRedisError("increment", err);
          return 1; // 🔓 fail-open: looks like a fresh first hit, never blocks
        }
      },
    }
  : undefined;
