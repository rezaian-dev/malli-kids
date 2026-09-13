import { toNextJsHandler } from "better-auth/next-js";
import { adminAuth } from "@/lib/auth/admin-auth";

export const { GET, POST } = toNextJsHandler(adminAuth);
