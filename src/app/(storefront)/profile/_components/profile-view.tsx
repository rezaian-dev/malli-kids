"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/providers/store-provider";
import { ProfilePanelFallback } from "./profile-shared";
import { ProfileHeader } from "./profile-header";
import { ProfileTabs, type ProfileTab } from "./profile-tabs";

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
  () =>
    import("./profile-wishlist-panel").then((mod) => mod.ProfileWishlistPanel),
  {
    ssr: false,
    loading: () => <ProfilePanelFallback title="علاقه‌مندی‌ها" />,
  },
);
const ProfileSupportPanel = dynamic(
  () =>
    import("./profile-support-panel").then((mod) => mod.ProfileSupportPanel),
  {
    ssr: false,
    loading: () => <ProfilePanelFallback title="پشتیبانی" />,
  },
);

function readHashTab(): ProfileTab {
  if (typeof window === "undefined") return "info";
  const value = window.location.hash.replace("#", "");
  return value === "orders" ||
    value === "wishlist" ||
    value === "support" ||
    value === "info"
    ? value
    : "info";
}

// 👤 Profile shell stays light and loads each panel on demand.
export function ProfileView() {
  const { user, setAuthOpen } = useStore();
  const [tab, setTab] = useState<ProfileTab>("info");

  useEffect(() => {
    const sync = () => setTab(readHashTab());
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <UserRound className="text-gold mx-auto mb-4 h-10 w-10" />
        <h1 className="text-navy dark:text-linen mb-3 text-2xl font-black">
          حساب کاربری
        </h1>
        <p className="text-navy/70 mb-6">
          برای دیدن سفارش‌ها و اطلاعات حساب وارد شوید.
        </p>
        <Button
          type="button"
          variant="navy"
          size="pill"
          onClick={() => setAuthOpen(true)}
        >
          ورود | ثبت‌نام
        </Button>
      </div>
    );
  }

  function go(next: ProfileTab) {
    setTab(next);
    window.history.replaceState(
      null,
      "",
      next === "info" ? "/profile" : `/profile#${next}`,
    );
  }

  return (
    <div className="xs:px-4 container mx-auto w-full max-w-5xl min-w-0 px-3 pb-10 sm:px-5 lg:px-7">
      <ProfileHeader user={user} />
      <ProfileTabs active={tab} onChange={go} />

      {tab === "info" ? <ProfileInfoPanel /> : null}
      {tab === "orders" ? <ProfileOrdersPanel /> : null}
      {tab === "wishlist" ? <ProfileWishlistPanel /> : null}
      {tab === "support" ? <ProfileSupportPanel /> : null}
    </div>
  );
}
