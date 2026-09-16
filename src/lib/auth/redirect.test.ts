import { describe, expect, it } from "vitest";
import { authHref, safeAuthReturnPath } from "./redirect";

describe("auth redirects", () => {
  it("keeps internal return paths and encodes them in the login link", () => {
    const next = "/product/42?size=4#details";

    expect(safeAuthReturnPath(next)).toBe(next);
    expect(authHref(next)).toBe(
      "/login?next=%2Fproduct%2F42%3Fsize%3D4%23details",
    );
  });

  it("rejects external, ambiguous, and login-loop destinations", () => {
    expect(safeAuthReturnPath("https://example.com")).toBe("/");
    expect(safeAuthReturnPath("//example.com")).toBe("/");
    expect(safeAuthReturnPath("/\\example.com")).toBe("/");
    expect(safeAuthReturnPath("/login")).toBe("/");
    expect(safeAuthReturnPath("/login?next=%2Fshop")).toBe("/");
    expect(safeAuthReturnPath(undefined)).toBe("/");
  });
});
