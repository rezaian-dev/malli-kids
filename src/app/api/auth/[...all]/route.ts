import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth/auth";

// 🔌 Standard Better Auth mount point. The storefront itself talks to auth
// through Server Actions (see `@/lib/auth/actions`), not this route —
// this exists because Better Auth expects it (email links, CLI tooling,
// future OAuth) even when nothing in this app fetches it directly.
export const { GET, POST } = toNextJsHandler(auth);
