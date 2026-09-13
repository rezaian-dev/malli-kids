import "server-only";
import { Redis } from "@upstash/redis";
import type { SecondaryStorage } from "@better-auth/core/db";

// Redis is optional; consumers have in-process fallbacks.
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = url && token ? new Redis({ url, token }) : null;

// Namespace keys so shared Redis databases cannot mix applications.
const KEY_PREFIX = "malli-kids:auth:";

// Share Better Auth rate limits across application instances.
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
      // Set expiry only on the first increment so the window does not slide.
      async increment(key, ttl) {
        const value = await redis.incr(KEY_PREFIX + key);
        if (value === 1) await redis.expire(KEY_PREFIX + key, ttl);
        return value;
      },
    }
  : undefined;
