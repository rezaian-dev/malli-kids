import "server-only";

export const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/malli-kids";

export const hasMongooseEnv = !!process.env.MONGODB_URI;

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
