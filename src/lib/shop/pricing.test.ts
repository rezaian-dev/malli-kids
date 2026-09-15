import { describe, expect, it } from "vitest";
import { resolvePrice } from "./pricing";

const OFF = { active: false, percent: 0 };

describe("resolvePrice", () => {
  it("returns the plain price with no discount", () => {
    expect(resolvePrice({ price: 100_000 }, OFF)).toEqual({
      price: 100_000,
      source: "none",
    });
  });

  it("resolves a product markdown with a rounded percent", () => {
    expect(resolvePrice({ price: 80_000, old: 100_000 }, OFF)).toEqual({
      price: 80_000,
      original: 100_000,
      percent: 20,
      source: "product",
    });
  });

  it("ignores a non-discount old price", () => {
    expect(resolvePrice({ price: 100_000, old: 90_000 }, OFF)).toEqual({
      price: 100_000,
      source: "none",
    });
  });

  it("a festival campaign replaces the product markdown instead of stacking", () => {
    const resolved = resolvePrice(
      { price: 80_000, old: 100_000 },
      { active: true, percent: 10 },
    );
    expect(resolved.source).toBe("festival");
    expect(resolved.price).toBe(90_000);
    expect(resolved.original).toBe(100_000);
  });

  it("rounds festival prices to the thousand and drops no-op discounts", () => {
    expect(
      resolvePrice({ price: 100_000 }, { active: true, percent: 20 }),
    ).toEqual({ price: 80_000, original: 100_000, percent: 20, source: "festival" });
    // 1% off 1000 rounds back to 1000 — not a discount at all.
    expect(resolvePrice({ price: 1000 }, { active: true, percent: 1 })).toEqual({
      price: 1000,
      source: "none",
    });
  });
});
