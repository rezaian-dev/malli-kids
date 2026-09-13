import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

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
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { ok: true };
}

// Reuse a limiter for each window and maximum.
const limiters = new Map<string, Ratelimit>();

function redisLimiter(windowMs: number, max: number): Ratelimit {
  const cacheKey = `${max}:${windowMs}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    // redis is non-null whenever this function runs — see the `redis ??` guard below.
    limiter = new Ratelimit({
      redis: redis!,
      limiter: Ratelimit.fixedWindow(max, `${windowMs} ms`),
      prefix: "malli-kids:rl",
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

export type RateLimitResult =
  { ok: true } | { ok: false; retryAfterSec: number };

// Include the caller and route in each rate-limit key.
export async function rateLimit(
  key: string,
  { windowMs, max }: { windowMs: number; max: number },
): Promise<RateLimitResult> {
  if (!redis) return memoryLimit(key, windowMs, max);

  const { success, reset } = await redisLimiter(windowMs, max).limit(key);
  if (success) return { ok: true };
  return { ok: false, retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)) };
}
