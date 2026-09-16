import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AuthProvider } from "./auth-provider";
import { UserMenu } from "@/components/layout/user-menu";
import type { User } from "@/types";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/lib/auth/actions", () => ({ signOutAction: vi.fn() }));
vi.mock("@/lib/shop/wallet-actions", () => ({ getWalletAction: vi.fn() }));

function render(user: User | null) {
  return renderToString(createElement(AuthProvider, {
    initialUser: user,
    children: createElement(UserMenu),
  }));
}

describe("account first HTML (real provider and trigger)", () => {
  it("renders login immediately for a server-confirmed guest", () => {
    const html = render(null);
    expect(html).toContain("ثبت‌نام");
    expect(html).not.toContain('aria-label="حساب کاربری"');
  });
  it("renders an interactive account trigger, not guest or lazy fallback, for a session", () => {
    const html = render({ id: "test", email: "test@example.com", firstName: "آزمایش" });
    expect(html).toContain('aria-label="حساب کاربری"');
    expect(html).toContain('aria-haspopup="menu"');
    expect(html).not.toContain("ثبت‌نام");
    expect(html).not.toContain("pointer-events-none flex items-center justify-center");
  });
  it("does not leak one render's identity into the next request", () => {
    render({ id: "test", email: "test@example.com", firstName: "آزمایش" });
    expect(render(null)).toContain("ثبت‌نام");
  });
});
