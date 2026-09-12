import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { AuthProvider, useAuth } from "@/providers/auth-provider";
import { AuthModal } from "@/components/auth/auth-modal";
import { Toaster } from "@/components/ui/sonner";
import { RecoveryPhoneForm } from "@/app/(storefront)/profile/_components/recovery-phone-form";

function Harness() {
  const { user, setAuthOpen, logout } = useAuth();
  return (
    <main className="mx-auto max-w-3xl p-5" dir="rtl">
      <h1 className="mb-4 text-lg font-bold">
        آزمون فرم‌های ملی‌کیدز — داده‌های آزمایشی
      </h1>
      <button
        className="bg-navy text-ivory rounded-xl px-5 py-3"
        onClick={() => setAuthOpen(true)}
      >
        باز کردن فرم ورود
      </button>
      <button
        className="mx-3 p-3"
        onClick={() => document.documentElement.classList.toggle("dark")}
      >
        تغییر تم
      </button>
      {user ? (
        <section data-testid="signed-in">
          <p className="mt-4">{user.email}</p>
          <bdi dir="ltr" data-testid="recovery-phone">
            {user.recoveryPhone}
          </bdi>
          <button className="m-3 rounded-xl border p-3" onClick={logout}>
            خروج از حساب
          </button>
          <RecoveryPhoneForm />
        </section>
      ) : null}
      <AuthModal />
      <Toaster />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
    <AuthProvider initialUser={null}>
      <Harness />
    </AuthProvider>
  </ThemeProvider>,
);
