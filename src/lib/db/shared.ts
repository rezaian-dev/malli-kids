export const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/malli-kids";

/** 🔒 Caches one in-flight/resolved connection promise per `key` on
 *  `globalThis`, so dev-mode HMR and serverless route reuse never open a
 *  second connection. Shared by `mongoose.ts` and `mongo-client.ts`. */
export function cached<T>(key: string, create: () => Promise<T>): () => Promise<T> {
  const store = globalThis as unknown as Record<string, Promise<T> | undefined>;
  return () => (store[key] ??= create());
}
