import { describe, expect, it } from "vitest";
import { parseFaNumber, phoneDigits } from "./digits";

describe("parseFaNumber", () => {
  it("parses Persian digits", () => {
    expect(parseFaNumber("۱۲۳")).toBe(123);
  });

  it("strips grouping separators", () => {
    expect(parseFaNumber("1,234")).toBe(1234);
  });

  it("passes numbers through", () => {
    expect(parseFaNumber(42)).toBe(42);
  });

  it("rejects malformed input as NaN", () => {
    expect(parseFaNumber("12a")).toBeNaN();
    expect(parseFaNumber("")).toBeNaN();
    expect(parseFaNumber(null)).toBeNaN();
    expect(parseFaNumber(undefined)).toBeNaN();
  });
});

describe("phoneDigits", () => {
  it("normalizes +98 and 0098 prefixes to local digits", () => {
    expect(phoneDigits("+989121234567")).toBe("09121234567");
    expect(phoneDigits("00989121234567")).toBe("09121234567");
  });

  it("strips spacing and punctuation", () => {
    expect(phoneDigits("0912 123 4567")).toBe("09121234567");
    expect(phoneDigits("(0912)123-4567")).toBe("09121234567");
  });

  it("converts Persian digits", () => {
    expect(phoneDigits("۰۹۱۲۱۲۳۴۵۶۷")).toBe("09121234567");
  });
});
