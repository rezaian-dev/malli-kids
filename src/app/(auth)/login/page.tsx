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
      <main className="relative isolate min-h-dvh overflow-x-hidden bg-atelier px-3 py-3 sm:px-6 sm:py-6 lg:px-8 dark:bg-navy-deep">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(48%_44%_at_100%_0%,rgba(193,147,87,.14),transparent_70%),radial-gradient(40%_38%_at_0%_100%,rgba(14,42,71,.08),transparent_70%)] dark:bg-[radial-gradient(48%_44%_at_100%_0%,rgba(193,147,87,.16),transparent_70%),radial-gradient(40%_38%_at_0%_100%,rgba(44,86,128,.26),transparent_70%)]"
        />
        <div
          dir="ltr"
          className="relative mx-auto grid min-h-[calc(100dvh-1.5rem)] max-w-6xl overflow-hidden rounded-[30px] border border-navy/10 bg-paper shadow-[0_24px_70px_-34px_rgba(4,20,39,.55)] sm:min-h-[calc(100dvh-3rem)] lg:grid-cols-[minmax(0,1.04fr)_minmax(25rem,.96fr)] dark:border-gold/25 dark:bg-dusk"
        >
          <AuthBrandPanel className="hidden lg:block" />
          <AuthPage initialView={initialView} />
        </div>
      </main>
    </AuthProvider>
  );
}
