import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const storefront = join(process.cwd(), "src/app/(storefront)");
function pages(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? pages(join(dir, entry.name)) :
      entry.name === "page.tsx" ? [join(dir, entry.name)] : [],
  );
}

describe("request-aware storefront route contract", () => {
  it.each(pages(storefront))("%s must not erase the parent layout's request cookies", (file) => {
    // In the non-Cache-Components model, this overrides the whole route,
    // including the parent auth/cart layout. A pure child page is not exempt.
    expect(readFileSync(file, "utf8")).not.toMatch(/export\s+const\s+dynamic\s*=\s*["']force-static["']/);
  });
  it("keeps request session lookup outside shared persistent caches", () => {
    const session = readFileSync("src/lib/auth/session.ts", "utf8");
    expect(session).toContain('from "react"');
    expect(session).toContain("headers: await headers()");
    expect(session).not.toMatch(/unstable_cache|["']use cache["']/);
  });
});
