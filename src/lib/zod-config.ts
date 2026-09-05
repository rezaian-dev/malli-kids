import { z } from "zod";

// 🩹 Zod v4 probes new Function(...) for a JIT fast path, which the strict CSP (no unsafe-eval)
// logs as a blocked-eval DevTools issue even though Zod catches it fine. jitless: true skips the probe.
// Imported once from auth-provider.tsx so it runs before any schema validates in the browser.
z.config({ jitless: true });
