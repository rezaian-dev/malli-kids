"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useState, type ChangeEvent } from "react";
import {
  Camera,
  Headphones,
  Heart,
  LogOut,
  Mail,
  Pencil,
  Phone,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/providers/store-provider";
import { fullName, givenName } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ProfilePanelFallback } from "./profile-shared";

type Tab = "info" | "orders" | "wishlist" | "support";

const ProfileInfoPanel = dynamic(
  () => import("./profile-info-panel").then((mod) => mod.ProfileInfoPanel),
  {
    ssr: false,
    loading: () => <ProfilePanelFallback title="اطلاعات حساب" />,
  },
);
const ProfileOrdersPanel = dynamic(
  () => import("./profile-orders-panel").then((mod) => mod.ProfileOrdersPanel),
  {
    ssr: false,
    loading: () => <ProfilePanelFallback title="سفارش‌های من" />,
  },
);
const ProfileWishlistPanel = dynamic(
  () => import("./profile-wishlist-panel").then((mod) => mod.ProfileWishlistPanel),
  {
    ssr: false,
    loading: () => <ProfilePanelFallback title="علاقه‌مندی‌ها" />,
  },
);
const ProfileSupportPanel = dynamic(
  () => import("./profile-support-panel").then((mod) => mod.ProfileSupportPanel),
  {
    ssr: false,
    loading: () => <ProfilePanelFallback title="پشتیبانی" />,
  },
);

const TABS = [
  { id: "orders", label: "سفارش‌های من", Icon: ShoppingBag },
  { id: "wishlist", label: "علاقه‌مندی‌ها", Icon: Heart },
  { id: "support", label: "پشتیبانی", Icon: Headphones },
  { id: "info", label: "اطلاعات حساب", Icon: Pencil },
] as const;

function readHashTab(): Tab {
  if (typeof window === "undefined") return "info";
  const value = window.location.hash.replace("#", "");
  return value === "orders" || value === "wishlist" || value === "support" || value === "info"
    ? value
    : "info";
}

// 👤 Profile shell stays light and loads each panel on demand.
export function ProfileView() {
  const { user, setAuthOpen, updateUser, logout } = useStore();
  const [tab, setTab] = useState<Tab>("info");
  const [avatarBusy, setAvatarBusy] = useState(false);

  useEffect(() => {
    const sync = () => setTab(readHashTab());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <UserRound className="mx-auto mb-4 h-10 w-10 text-gold" />
        <h1 className="mb-3 text-2xl font-black text-navy dark:text-linen">حساب کاربری</h1>
        <p className="mb-6 text-navy/60">برای دیدن سفارش‌ها و اطلاعات حساب وارد شوید.</p>
        <Button type="button" variant="navy" size="pill" onClick={() => setAuthOpen(true)}>
          ورود | ثبت‌نام
        </Button>
      </div>
    );
  }

  const nick = givenName(user.firstName);
  const name = fullName(user.firstName, user.lastName);

  function go(next: Tab) {
    setTab(next);
    window.history.replaceState(null, "", next === "info" ? "/profile" : `/profile#${next}`);
  }

  async function onAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarBusy(true);
    try {
      const [{ compressToDataUrl }, { toast }] = await Promise.all([
        import("@/components/ui/image-upload"),
        import("sonner"),
      ]);
      const url = await compressToDataUrl(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 512,
      });
      updateUser({ avatar: url });
      toast.success("عکس پروفایل به‌روز شد ✅");
    } catch {
      const { toast } = await import("sonner");
      toast.error("پردازش عکس ناموفق بود");
    } finally {
      setAvatarBusy(false);
      event.target.value = "";
    }
  }

  return (
    <div className="container mx-auto w-full max-w-5xl min-w-0 px-4 pb-10 sm:px-5 lg:px-7">
      <section className="overflow-hidden rounded-[28px] bg-linear-to-br from-navy via-navy-mid to-navy-light">
        <div className="flex flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:px-8 sm:py-9">
          <div className="relative self-start">
            <span className="relative inline-flex size-19 items-center justify-center overflow-hidden rounded-full bg-navy text-[28px] font-black text-gold-soft ring-[3px] ring-gold/45 sm:size-24 sm:text-[34px]">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                nick.charAt(0)
              )}
            </span>
            <label
              className={cn(
                "absolute -bottom-1 -left-1 flex size-9 cursor-pointer items-center justify-center rounded-full bg-gold text-navy-deep",
                avatarBusy && "animate-pulse opacity-70",
              )}
            >
              <Camera className="h-4 w-4" />
              <span className="sr-only">تغییر عکس پروفایل</span>
              <input type="file" accept="image/*" className="sr-only" onChange={onAvatar} />
            </label>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black tracking-[0.22em] text-gold">MEMBER</p>
            <h1 className="mt-1 text-xl font-black text-white sm:text-3xl">{name}</h1>
            <div className="mt-2 flex flex-col gap-1 text-[12px] text-white/75 sm:flex-row sm:gap-4">
              <span className="inline-flex items-center gap-1.5 truncate">
                <Mail className="h-3.5 w-3.5 text-gold" />
                <span dir="ltr">{user.email}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-gold" />
                <span dir="ltr">{user.phone?.trim() || "—"}</span>
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-full border-white/30 bg-white/10 text-white"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" /> خروج
          </Button>
        </div>
      </section>

      <nav className="mt-6 flex flex-wrap gap-1.5 rounded-[18px] bg-sand p-1.5 dark:bg-dusk-mid" aria-label="بخش‌های پنل کاربری">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => go(id)}
            aria-pressed={tab === id}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-[13px] font-extrabold text-navy dark:text-linen",
              tab === id &&
                "bg-navy text-ivory dark:bg-gold dark:text-navy-deep",
            )}
          >
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </nav>

      {tab === "info" ? <ProfileInfoPanel /> : null}
      {tab === "orders" ? <ProfileOrdersPanel /> : null}
      {tab === "wishlist" ? <ProfileWishlistPanel /> : null}
      {tab === "support" ? <ProfileSupportPanel /> : null}
    </div>
  );
}
