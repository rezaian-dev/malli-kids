import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth/auth";

// 🔌 Standard Better Auth mount — the app talks via Server Actions; this
// serves email links, CLI tooling, future OAuth
export const { GET, POST } = toNextJsHandler(auth);
