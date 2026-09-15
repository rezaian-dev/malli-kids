import { describe, expect, it } from "vitest";
import { mobile, otpCode, strongPassword } from "./forms";

describe("mobile", () => {
  it("accepts canonical mobiles and normalizes +98 input", () => {
    expect(mobile().safeParse("09121234567").success).toBe(true);
    const parsed = mobile().safeParse("+989121234567");
    expect(parsed.success && parsed.data).toBe("09121234567");
  });

  it("rejects non-mobiles", () => {
    expect(mobile().safeParse("12345").success).toBe(false);
    expect(mobile().safeParse("").success).toBe(false);
  });
});

describe("otpCode", () => {
  it("accepts an exact-length code, including Persian digits", () => {
    expect(otpCode().safeParse("12345").success).toBe(true);
    const parsed = otpCode().safeParse("۱۲۳۴۵");
    expect(parsed.success && parsed.data).toBe("12345");
  });

  it("rejects short and long codes", () => {
    expect(otpCode().safeParse("1234").success).toBe(false);
    expect(otpCode().safeParse("123456").success).toBe(false);
  });
});

describe("strongPassword", () => {
  it("requires length, a letter and a digit", () => {
    expect(strongPassword().safeParse("abc12345").success).toBe(true);
    expect(strongPassword().safeParse("abcdefgh").success).toBe(false);
    expect(strongPassword().safeParse("12345678").success).toBe(false);
    expect(strongPassword().safeParse("ab12").success).toBe(false);
  });
});
