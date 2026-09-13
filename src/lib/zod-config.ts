import { z } from "zod";

// Disable Zod JIT before validation to respect the Content Security Policy.
z.config({ jitless: true });
