import { describe, expect, it } from "vitest";
import { isSafeHref } from "./utils";

describe("isSafeHref", () => {
  it("allows same-site paths", () => {
    expect(isSafeHref("/shop")).toBe(true);
    expect(isSafeHref("/")).toBe(true);
    expect(isSafeHref("/product/5-gold-thread?x=1")).toBe(true);
  });

  it("allows absolute http(s) URLs", () => {
    expect(isSafeHref("https://example.com/sale")).toBe(true);
    expect(isSafeHref("http://example.com")).toBe(true);
  });

  it("rejects executable and protocol-relative targets", () => {
    expect(isSafeHref("javascript:alert(1)")).toBe(false);
    expect(isSafeHref("JaVaScRiPt:alert(1)")).toBe(false);
    expect(isSafeHref("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isSafeHref("//evil.example.com/x")).toBe(false);
    expect(isSafeHref("")).toBe(false);
  });
});
