import "server-only";

export const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/malli-kids";
export const hasMongooseEnv = !!process.env.MONGODB_URI;

// Default credentialed URIs to their own database's authSource.
export function getMongooseUri(): string {
  if (MONGODB_URI.includes("authSource=")) return MONGODB_URI;
  try {
    const uri = new URL(MONGODB_URI);
    const database = uri.pathname.split("/")[1];
    if (uri.username && database) {
      const separator = MONGODB_URI.includes("?") ? "&" : "?";
      return `${MONGODB_URI}${separator}authSource=${encodeURIComponent(database)}`;
    }
  } catch {
    // Leave driver-specific URI formats unchanged.
  }
  return MONGODB_URI;
}

export function requireBuildDatabase(): void {
  if (process.env.NEXT_PHASE === "phase-production-build" && !process.env.MONGODB_URI) {
    console.warn("[db] No build-time database; use the runtime fallback.");
    throw new Error("MONGODB_URI not configured during build");
  }
}

export function rethrowMongoError(error: unknown): never {
  const code = (error as { code?: number } | null)?.code;
  const message = error instanceof Error ? error.message : "";
  if (code === 18 || message.includes("Authentication failed")) {
    console.error("[db] Authentication failed; check credentials and authSource.");
  }
  throw error;
}

// Reuse connection promises; clear failures so later requests can retry.
export function cached<T>(key: string, create: () => Promise<T>): () => Promise<T> {
  const store = globalThis as unknown as Record<string, Promise<T> | undefined>;
  return () =>
    (store[key] ??= create().catch((error) => {
      delete store[key];
      throw error;
    }));
}
