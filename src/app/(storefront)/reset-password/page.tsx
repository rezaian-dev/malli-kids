import { buildMetadata } from "@/lib/seo";
import { ResetPasswordView } from "./_components/reset-password-view";

export const metadata = buildMetadata({
  title: "بازنشانی رمز عبور",
  description: "رمز عبور جدید حساب‌تان را تعیین کنید.",
  path: "/reset-password",
  noIndex: true,
});

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;
  return <ResetPasswordView token={token} invalid={Boolean(error)} />;
}
