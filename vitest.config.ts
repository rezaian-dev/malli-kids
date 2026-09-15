import path from "node:path";
import { defineConfig } from "vitest/config";

// Unit tests for pure modules only (no DB/Redis/browser). Async Server
// Components and commerce flows are covered by E2E where infrastructure
// permits — see the Phase 4 report. Single runner: vitest.
export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
