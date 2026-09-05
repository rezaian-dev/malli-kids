import "server-only";

export const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/malli-kids";

// 🔒 Caches one connection promise per key on globalThis, so HMR/serverless reuse never opens a second connection.
export function cached<T>(
  key: string,
  create: () => Promise<T>,
): () => Promise<T> {
  const store = globalThis as unknown as Record<string, Promise<T> | undefined>;
  return () => (store[key] ??= create());
}
