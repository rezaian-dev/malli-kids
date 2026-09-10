import "server-only";

export const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/malli-kids";

export const hasMongooseEnv = !!process.env.MONGODB_URI;

// 🔗 cPanel/Pars host creates users like mallikid_mrezaian for DB mallikid_mallkidsDB.
// The driver needs ?authSource=<db> or it may try "admin" and fail with code 18 AuthenticationFailed.
// If the URI has user:pass and a db but no authSource, we append it automatically so
//   mongodb://user:pass@localhost:27017/mydb  ->  .../mydb?authSource=mydb
export function getMongooseUri(): string {
  const raw = MONGODB_URI;
  if (raw.includes("authSource=")) return raw;
  try {
    const u = new URL(raw);
    if (u.username && u.pathname && u.pathname !== "/" && u.pathname.length > 1) {
      const dbName = u.pathname.slice(1).split("?")[0].split("/")[0];
      if (dbName) {
        // Keep original encoding; just add param
        const sep = raw.includes("?") ? "&" : "?";
        return `${raw}${sep}authSource=${encodeURIComponent(dbName)}`;
      }
    }
  } catch {
    // Fallback: raw may not be a valid URL (e.g. mongodb+srv) — return as-is
  }
  return raw;
}

// 🔒 Caches one connection promise per key on globalThis, so HMR/serverless reuse never opens a second connection.
// ♻️ On failure the cached promise is cleared so a retry (e.g. next ISR hit after env fixed) can succeed.
export function cached<T>(
  key: string,
  create: () => Promise<T>,
): () => Promise<T> {
  const store = globalThis as unknown as Record<string, Promise<T> | undefined>;
  return () => {
    const existing = store[key];
    if (existing) return existing;
    const promise = create().catch((err) => {
      delete store[key];
      throw err;
    });
    store[key] = promise;
    return promise;
  };
}
