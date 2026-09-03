"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useStore } from "@/providers/store-provider";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AuthAside } from "./auth-aside";
import { LoginPanel } from "./auth-login-panel";
import { RegisterPanel } from "./auth-register-panel";
import { ForgotPasswordPanel } from "./auth-forgot-password-panel";

const TAB_TRIGGER = cn(
  "min-w-0 rounded-xl py-2.5 text-[13px] font-extrabold transition-colors",
  "text-navy/70 hover:text-navy dark:text-linen/70 dark:hover:text-ivory",
  "data-[state=active]:bg-navy data-[state=active]:text-ivory data-[state=active]:shadow-sm",
  "dark:data-[state=active]:bg-gold dark:data-[state=active]:text-navy-deep dark:data-[state=active]:shadow-[0_2px_10px_-2px] dark:data-[state=active]:shadow-gold/50",
);

const TITLES = {
  login: "ورود به حساب",
  register: "ساخت حساب",
  forgot: "بازیابیِ رمز عبور",
} as const;
type View = keyof typeof TITLES;

// 🔐 Auth dialog: login/register tabs, plus a "forgot password" step that
// swaps in over the login tab (not a third tab — it isn't a sign-in method).
export function AuthModal() {
  const { authOpen, setAuthOpen } = useStore();
  const [view, setView] = useState<View>("login");

  function onOpenChange(next: boolean) {
    setAuthOpen(next);
    if (!next) setView("login");
  }

  return (
    <Dialog open={authOpen} onOpenChange={onOpenChange}>
      <DialogContent
        dir="rtl"
        showCloseButton={false}
        className={cn(
          "z-100 block max-h-[94dvh] w-[calc(100%-1.5rem)] max-w-104 gap-0 overflow-x-hidden overflow-y-auto overscroll-contain p-0 sm:max-w-104",
          "bg-paper text-navy rounded-[28px] ring-0",
          "border-gold/35 border shadow-[0_28px_80px_-20px_rgba(4,20,39,.55)]",
          "dark:border-gold/40 dark:bg-dusk dark:text-ivory",
          "lg:flex lg:max-w-216 lg:flex-row-reverse",
        )}
      >
        {}
        <DialogClose
          className={cn(
            "absolute inset-s-4 top-4 z-20 inline-flex size-9 items-center justify-center rounded-full",
            "text-navy/70 hover:bg-sand hover:text-navy transition-colors",
            "focus-visible:ring-gold focus-visible:ring-2 focus-visible:outline-none",
            "dark:text-ivory/70 dark:hover:bg-dusk-mid dark:hover:text-ivory",
          )}
        >
          <X className="size-5" />
          <span className="sr-only">بستن</span>
        </DialogClose>

        <AuthAside />

        <div className="bg-paper dark:bg-dusk flex max-h-[94dvh] min-h-0 min-w-0 flex-1 flex-col overflow-hidden p-5 pt-14 sm:p-7 sm:pt-14">
          <div className="mb-4 shrink-0">
            <p className="text-gold text-[11px] font-black tracking-[0.2em]">
              MALLI KIDS
            </p>
            <DialogTitle className="mt-1 text-lg font-black">
              {TITLES[view]}
            </DialogTitle>
          </div>

          {view === "forgot" ? (
            <div className="auth-fields -mx-2 min-h-0 flex-1 scrollbar-thin overflow-x-clip overflow-y-auto overscroll-contain px-2">
              <ForgotPasswordPanel onBack={() => setView("login")} />
            </div>
          ) : (
            <Tabs
              value={view}
              onValueChange={(v) => setView(v as View)}
              dir="rtl"
              className="min-h-0 flex-1 gap-0"
            >
              <TabsList className="bg-sand ring-navy/5 dark:bg-navy-deep/70 grid h-auto w-full min-w-0 shrink-0 grid-cols-2 gap-1 rounded-2xl p-1 ring-1 dark:ring-white/10">
                <TabsTrigger value="login" className={TAB_TRIGGER}>
                  ورود
                </TabsTrigger>
                <TabsTrigger value="register" className={TAB_TRIGGER}>
                  ثبت‌نام
                </TabsTrigger>
              </TabsList>

              <div className="auth-fields -mx-2 min-h-0 flex-1 scrollbar-thin overflow-x-clip overflow-y-auto overscroll-contain px-2">
                <TabsContent value="login" className="mt-5">
                  <LoginPanel onForgot={() => setView("forgot")} />
                </TabsContent>
                <TabsContent value="register" className="mt-4">
                  <RegisterPanel />
                </TabsContent>
              </div>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
