import { describe, expect, it } from "vitest";
import {
  parseProductRouteId,
  pdpHref,
  productRouteParam,
} from "./products";

describe("parseProductRouteId", () => {
  it("reads the leading number and ignores the cosmetic slug", () => {
    expect(parseProductRouteId("5-gold-thread")).toBe(5);
    expect(parseProductRouteId("42")).toBe(42);
  });

  it("rejects routes without a leading number", () => {
    expect(parseProductRouteId("gold-thread")).toBeNaN();
    expect(parseProductRouteId("")).toBeNaN();
  });
});

describe("pdpHref", () => {
  it("builds a canonical href that round-trips through the parser", () => {
    expect(pdpHref(5)).toBe("/product/5-gold-thread");
    const param = productRouteParam(320);
    expect(pdpHref(320)).toBe(`/product/${param}`);
    expect(parseProductRouteId(param)).toBe(320);
  });
});
