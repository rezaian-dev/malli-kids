import "server-only";
import { Redis } from "@upstash/redis";
import { APIError } from "better-auth";
import type { SecondaryStorage } from "@better-auth/core/db";
import { SERVICE_RETRY_SECONDS, SERVICE_UNAVAILABLE_MESSAGE } from "@/lib/action-result";

function readEnv(name: string): string {
  return (process.env[name] ?? "").trim().replace(/^["']|["']$/g, "");
}

const url = readEnv("UPSTASH_REDIS_REST_URL");
const token = readEnv("UPSTASH_REDIS_REST_TOKEN");
// Both halves are required — a half-configured client can only throw at
// runtime, so report it as unconfigured (memory limits) and say so loudly.
export const redisConfigured = Boolean(url && token);
if (!redisConfigured && (url || token)) {
  console.error(
    "[redis] Partial configuration (URL or token missing) — using memory limits.",
  );
}
const KEY_PREFIX = "malli-kids:auth:";
let client: Redis | undefined;

export function redisUnavailable(): APIError {
  return new APIError(
    "SERVICE_UNAVAILABLE",
    {
      code: "SERVICE_UNAVAILABLE",
      message: SERVICE_UNAVAILABLE_MESSAGE,
      retryAfterSec: SERVICE_RETRY_SECONDS,
    },
    { "Retry-After": String(SERVICE_RETRY_SECONDS) },
  );
}

function getClient(): Redis {
  if (client) return client;
  let validUrl = false;
  try {
    const parsed = new URL(url);
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(parsed.hostname);
    validUrl =
      (parsed.protocol === "https:" || (local && parsed.protocol === "http:")) &&
      !parsed.username &&
      !parsed.password;
  } catch {
    // Report invalid configuration without logging credentials or endpoint URLs.
  }
  if (!validUrl || !token) {
    console.error("[redis] Invalid configuration; check the REST URL and token.");
    throw redisUnavailable();
  }
  client = new Redis({
    url,
    token,
    retry: false,
    signal: () => AbortSignal.timeout(3000),
  });
  return client;
}

// Configured Redis failures must not silently switch to unshared memory limits.
export async function withRedis<T>(run: (redis: Redis) => Promise<T>): Promise<T> {
  try {
    return await run(getClient());
  } catch (error) {
    if (!(error instanceof APIError)) {
      console.error(
        "[redis] Request failed:",
        error instanceof Error ? error.name : "unknown",
      );
    }
    throw redisUnavailable();
  }
}

// Increment and expiry must be atomic; repair old counters missing an expiry.
const INCREMENT_WINDOW = `
  local count = redis.call('INCR', KEYS[1])
  if count == 1 or redis.call('TTL', KEYS[1]) < 0 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
  end
  return count
`;

function makeSecondaryStorage(prefix: string): SecondaryStorage {
  return {
    get: (key) => withRedis((redis) => redis.get(prefix + key)),
    getAndDelete: (key) => withRedis((redis) => redis.getdel(prefix + key)),
    set: (key, value, ttl) =>
      withRedis((redis) =>
        ttl
          ? redis.set(prefix + key, value, { ex: ttl })
          : redis.set(prefix + key, value),
      ),
    delete: async (key) => {
      await withRedis((redis) => redis.del(prefix + key));
    },
    increment: (key, ttl) =>
      withRedis(async (redis) => {
        const count = await redis.eval<[number], number>(
          INCREMENT_WINDOW,
          [prefix + key],
          [ttl],
        );
        if (!Number.isSafeInteger(count) || count < 1)
          throw new Error("Invalid Redis counter");
        return count;
      }),
  };
}

export const authSecondaryStorage: SecondaryStorage | undefined = redisConfigured
  ? makeSecondaryStorage(KEY_PREFIX)
  : undefined;

// Separate prefix — admin and storefront limiters must never share counters.
export const adminAuthSecondaryStorage: SecondaryStorage | undefined =
  redisConfigured ? makeSecondaryStorage(`${KEY_PREFIX}admin:`) : undefined;
