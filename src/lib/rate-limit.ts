import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { redisConfigured, withRedis } from "@/lib/redis";
import type { Redis } from "@upstash/redis";
import {
  SERVICE_RETRY_SECONDS,
  serviceUnavailable,
  type ActionResult,
} from "@/lib/action-result";

// Use Redis for shared limits; memory fallback applies to one process only.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();

// Piggybacks cleanup on normal traffic instead of running a separate timer.
function sweepExpired(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

function memoryLimit(key: string, windowMs: number, max: number): RateLimitResult {
  const now = Date.now();
  sweepExpired(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (bucket.count >= max) {
    return {
      ok: false,
      reason: "limited",
      retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }
  bucket.count += 1;
  return { ok: true };
}

// Reuse a limiter for each window and maximum.
const limiters = new Map<string, Ratelimit>();

function redisLimiter(redis: Redis, windowMs: number, max: number): Ratelimit {
  const cacheKey = `${max}:${windowMs}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      // Disable the SDK timeout fallback, which would otherwise allow the request.
      timeout: 0,
      ephemeralCache: false,
      limiter: Ratelimit.fixedWindow(max, `${windowMs} ms`),
      prefix: "malli-kids:rl",
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

export type RateLimitResult =
  { ok: true } | { ok: false; reason: "limited" | "unavailable"; retryAfterSec: number };

export function rateLimitError(
  result: Extract<RateLimitResult, { ok: false }>,
  message: string,
): Extract<ActionResult, { ok: false }> {
  return result.reason === "unavailable"
    ? serviceUnavailable()
    : { ok: false, error: message, retryAfterSec: result.retryAfterSec };
}

// Include the caller and route in each rate-limit key.
export async function rateLimit(
  key: string,
  { windowMs, max }: { windowMs: number; max: number },
): Promise<RateLimitResult> {
  if (!redisConfigured) return memoryLimit(key, windowMs, max);
  try {
    const result = await withRedis((redis) =>
      redisLimiter(redis, windowMs, max).limit(key),
    );
    if (
      result.reason === "timeout" ||
      !Number.isFinite(result.reset) ||
      !Number.isFinite(result.remaining)
    ) {
      return { ok: false, reason: "unavailable", retryAfterSec: SERVICE_RETRY_SECONDS };
    }
    if (result.success) return { ok: true };
    return {
      ok: false,
      reason: "limited",
      retryAfterSec: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)),
    };
  } catch {
    return { ok: false, reason: "unavailable", retryAfterSec: SERVICE_RETRY_SECONDS };
  }
}
