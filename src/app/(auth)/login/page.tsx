import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthProvider } from "@/providers/auth-provider";
import { getSessionUser } from "@/lib/auth/session";
import { buildMetadata } from "@/lib/seo";
import { safeAuthReturnPath } from "@/lib/auth/redirect";
import { AuthBrandPanel } from "./_components/auth-brand-panel";
import { AuthPage } from "./_components/auth-page";

export const metadata: Metadata = buildMetadata({
  title: "ورود و ثبت‌نام",
  description: "ورود امن، ساخت حساب و بازیابی رمز عبور ملی‌کیدز.",
  path: "/login",
  noIndex: true,
});

type SearchParams = Promise<{
  next?: string;
  mode?: string;
}>;

export default async function LoginPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const next = safeAuthReturnPath(params.next);
  const user = await getSessionUser();

  if (user) redirect(next);

  const initialView = params.mode === "register" ? "register" : "login";

  return (
    <AuthProvider initialUser={null}>
      <main
        dir="ltr"
        className="relative isolate grid min-h-dvh bg-atelier dark:bg-navy-deep lg:grid-cols-[minmax(0,1.04fr)_minmax(28rem,.96fr)]"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(48%_44%_at_100%_0%,rgba(193,147,87,.14),transparent_70%),radial-gradient(40%_38%_at_0%_100%,rgba(14,42,71,.08),transparent_70%)] dark:bg-[radial-gradient(48%_44%_at_100%_0%,rgba(193,147,87,.16),transparent_70%),radial-gradient(40%_38%_at_0%_100%,rgba(44,86,128,.26),transparent_70%)]"
        />
        <AuthBrandPanel className="relative z-0 hidden lg:block" />
        <AuthPage initialView={initialView} />
      </main>
    </AuthProvider>
  );
}
