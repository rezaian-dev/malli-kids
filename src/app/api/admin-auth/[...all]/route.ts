import { toNextJsHandler } from "better-auth/next-js";
import { adminAuth } from "@/lib/auth/admin-auth";

// 🔌 Standard Better Auth mount for the admin-only instance — mirrors
// src/app/api/auth/[...all]/route.ts, just pointed at `adminAuth`.
export const { GET, POST } = toNextJsHandler(adminAuth);
