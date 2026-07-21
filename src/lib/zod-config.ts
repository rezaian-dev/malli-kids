import { z } from "zod";

// ♿️🔐 Zod v4 probes for `new Function(...)` support (a JIT fast path) by
// calling it in a try/catch — with the strict CSP in `next.config.ts`
// (`script-src 'self'`, no `'unsafe-eval'` in production), the browser
// still reports that probe as a blocked eval, logged as a DevTools "Issue"
// (a real, if harmless, Lighthouse Best Practices hit) even though the
// throw is caught and Zod falls back correctly on its own. `jitless: true`
// skips the probe entirely — see the comment above `allowsEval` in
// `node_modules/zod/v4/core/util.js`, which documents this exact case.
// Imported once, for this side effect, from `store-provider.tsx` (the
// outermost client boundary) so it runs before any schema in the app
// validates anything in the browser; on the server this is a no-op (no CSP
// there), so it's harmless to have evaluated there too.
z.config({ jitless: true });
