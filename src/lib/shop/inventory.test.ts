import { describe, expect, it } from "vitest";
import { deriveStock, variantStockStatus } from "./inventory";

describe("deriveStock", () => {
  it("preserves the legacy flag for variant-less products", () => {
    expect(deriveStock([], true)).toBe(true);
    expect(deriveStock([], false)).toBe(false);
  });

  it("is out of stock when every variant is zero", () => {
    expect(deriveStock([{ size: "M", stock: 0 }], true)).toBe(false);
  });

  it("treats the last available unit as in stock", () => {
    expect(deriveStock([{ size: "M", stock: 1 }], false)).toBe(true);
  });

  it("clamps negative variant counts instead of cancelling real stock", () => {
    expect(
      deriveStock(
        [
          { size: "S", stock: -4 },
          { size: "M", stock: 2 },
        ],
        false,
      ),
    ).toBe(true);
    expect(deriveStock([{ size: "S", stock: -4 }], false)).toBe(false);
  });
});

describe("variantStockStatus", () => {
  it("maps zero and negative to out-of-stock", () => {
    expect(variantStockStatus(0)).toBe("out-of-stock");
    expect(variantStockStatus(-2)).toBe("out-of-stock");
  });

  it("maps a few remaining units to low-stock", () => {
    expect(variantStockStatus(1)).toBe("low-stock");
    expect(variantStockStatus(3)).toBe("low-stock");
  });

  it("maps healthy quantities to in-stock", () => {
    expect(variantStockStatus(4)).toBe("in-stock");
    expect(variantStockStatus(100)).toBe("in-stock");
  });
});
