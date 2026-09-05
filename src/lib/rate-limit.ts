import "server-only";

// 🚦 In-memory fixed-window limiter for routes Better Auth's own rateLimit doesn't cover.
// 🎯 Single-process by design; a multi-instance deployment would need a shared store instead.

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

export type RateLimitResult =
  { ok: true } | { ok: false; retryAfterSec: number };

// key should identify both caller and route (e.g. invoice:${userId}) so endpoints don't share a quota.
export function rateLimit(
  key: string,
  { windowMs, max }: { windowMs: number; max: number },
): RateLimitResult {
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
      retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }
  bucket.count += 1;
  return { ok: true };
}
