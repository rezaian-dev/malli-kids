import "server-only";

// 🚦 Small in-memory fixed-window rate limiter for Route Handlers and Server
// Actions that Better Auth's own `rateLimit.customRules` (see
// `src/lib/auth/auth.ts`) doesn't cover — e.g. `/api/tryon` (burns paid
// third-party API credits per call) and `reverseGeocodeAction` (Neshan quota).
//
// Deliberately simple: a `Map` keyed by caller-supplied string, single
// process. Good enough for this app's current one-instance deployment; if it
// ever runs behind multiple instances/a load balancer, this would need a
// shared store (Redis/Upstash) instead — each instance would otherwise
// enforce its own independent limit.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastSweep = Date.now();

// 🧹 Piggy-back a cleanup of expired buckets onto normal traffic instead of
// running a separate timer — avoids the whole map growing forever.
function sweepExpired(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult =
  { ok: true } | { ok: false; retryAfterSec: number };

/** `key` should already identify the caller *and* the route (e.g.
 *  `` `tryon:${userId}` ``) — one shared bucket per raw user/IP would let
 *  different endpoints exhaust each other's quota. */
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

/** 🌐 Best-effort caller IP from proxy headers, for rate-limiting requests
 *  that might not have a session yet. Never trust this for authorization —
 *  only for throttling (a spoofed header just makes the limiter useless for
 *  that one bucket, not a security bypass of anything else). */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") || "unknown";
}
