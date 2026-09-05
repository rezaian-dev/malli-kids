import { z } from "zod";

// 🩹 Zod's JIT Function() probe trips strict CSP; jitless skips it.
// Imported once, before any schema validates
z.config({ jitless: true });
