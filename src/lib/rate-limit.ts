import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

// 🚦 Fixed-window limiter shared by every non-Better-Auth route in the app
// (OTP requests, geocoding, invoice PDFs, chat sends/typing — see call sites).
// Backed by Upstash Redis when configured (`UPSTASH_REDIS_REST_URL`/`_TOKEN`)
// so the limit is real across Vercel's many serverless instances; falls back
// to an in-memory map for local dev, where a single process is all there is.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();

// 🧹 Piggybacks cleanup on normal traffic instead of running a separate timer.
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

// 📇 One Ratelimit instance per distinct (max, windowMs) pair — Upstash is HTTP
// under the hood so there's no connection to reuse, but the instance itself is
// cheap to keep around rather than rebuild on every call.
const limiters = new Map<string, Ratelimit>();

function redisLimiter(windowMs: number, max: number): Ratelimit {
  const cacheKey = `${max}:${windowMs}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    // ⚛️ redis is non-null whenever this function runs — see the `redis ??` guard below.
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

// 🛟 Same fail-open contract as `redis.ts`'s Better Auth adapter: this is a
// defense layer, not core functionality. A bad Redis URL or an outage falls
// back to the in-memory limiter (still real protection, just per-instance)
// instead of throwing and breaking whatever action called it. Throttled so a
// persistently-down Redis logs once every 30s, not once per request.
let lastErrorLogAt = 0;
function logRedisError(err: unknown) {
  const now = Date.now();
  if (now - lastErrorLogAt < 30_000) return;
  lastErrorLogAt = now;
  const reason = err instanceof Error ? err.message : String(err);
  console.error(`[rateLimit] Redis unreachable — falling back to in-memory. ${reason}`);
}

// key should identify both caller and route (e.g. invoice:${userId}) so endpoints don't share a quota.
export async function rateLimit(
  key: string,
  { windowMs, max }: { windowMs: number; max: number },
): Promise<RateLimitResult> {
  if (!redis) return memoryLimit(key, windowMs, max);

  try {
    const { success, reset } = await redisLimiter(windowMs, max).limit(key);
    if (success) return { ok: true };
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((reset - Date.now()) / 1000)) };
  } catch (err) {
    logRedisError(err);
    return memoryLimit(key, windowMs, max);
  }
}
