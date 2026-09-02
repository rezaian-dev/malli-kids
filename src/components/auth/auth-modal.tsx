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
import { OtpPanel } from "./auth-otp-panel";
import { RegisterPanel } from "./auth-register-panel";

const TAB_TRIGGER = cn(
  "min-w-0 rounded-xl py-2.5 text-[13px] font-extrabold transition-colors",
  "text-navy/70 hover:text-navy dark:text-linen/70 dark:hover:text-ivory",
  "data-[state=active]:bg-navy data-[state=active]:text-ivory data-[state=active]:shadow-sm",
  "dark:data-[state=active]:bg-gold dark:data-[state=active]:text-navy-deep dark:data-[state=active]:shadow-[0_2px_10px_-2px] dark:data-[state=active]:shadow-gold/50",
);

const TITLES = {
  login: "ورود به حساب",
  otp: "ورود با پیامک",
  register: "ساخت حساب",
} as const;
type Tab = keyof typeof TITLES;

// 🔐 Auth dialog with clear tab-based flows.
export function AuthModal() {
  const { authOpen, setAuthOpen } = useStore();
  const [tab, setTab] = useState<Tab>("login");

  return (
    <Dialog open={authOpen} onOpenChange={setAuthOpen}>
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
              {TITLES[tab]}
            </DialogTitle>
          </div>

          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as Tab)}
            dir="rtl"
            className="min-h-0 flex-1 gap-0"
          >
            <TabsList className="bg-sand ring-navy/5 dark:bg-navy-deep/70 grid h-auto w-full min-w-0 shrink-0 grid-cols-3 gap-1 rounded-2xl p-1 ring-1 dark:ring-white/10">
              <TabsTrigger value="login" className={TAB_TRIGGER}>
                ورود
              </TabsTrigger>
              <TabsTrigger value="otp" className={TAB_TRIGGER}>
                پیامک
              </TabsTrigger>
              <TabsTrigger value="register" className={TAB_TRIGGER}>
                ثبت‌نام
              </TabsTrigger>
            </TabsList>

            <div className="auth-fields -mx-2 min-h-0 flex-1 scrollbar-thin overflow-x-clip overflow-y-auto overscroll-contain px-2">
              <TabsContent value="login" className="mt-5">
                <LoginPanel onOtp={() => setTab("otp")} />
              </TabsContent>
              <TabsContent value="otp" className="mt-5">
                <OtpPanel />
              </TabsContent>
              <TabsContent value="register" className="mt-4">
                <RegisterPanel />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
