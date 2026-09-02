"use client";

import Image from "next/image";
import { useState, type ChangeEvent } from "react";
import { Camera, LogOut, Mail, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/providers/store-provider";
import { fullName, givenName } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

/** 🪪 Avatar (with upload), name/contact, and the logout button. */
export function ProfileHeader({ user }: { user: User }) {
  const { updateUser, logout } = useStore();
  const [avatarBusy, setAvatarBusy] = useState(false);

  const nick = givenName(user.firstName);
  const name = fullName(user.firstName, user.lastName);

  async function onAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarBusy(true);
    try {
      const [{ compressToDataUrl }, { toast }] = await Promise.all([
        import("@/components/ui/image-upload"),
        import("@/lib/toast"),
      ]);
      const url = await compressToDataUrl(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 512,
      });
      updateUser({ avatar: url });
      toast.success("عکس پروفایل به‌روز شد ✅");
    } catch {
      const { toast } = await import("@/lib/toast");
      toast.error("پردازش عکس ناموفق بود");
    } finally {
      setAvatarBusy(false);
      event.target.value = "";
    }
  }

  return (
    <section
      className={cn(
        "overflow-hidden rounded-[28px]",
        "from-navy via-navy-mid to-navy-light bg-linear-to-br",
      )}
    >
      <div className="flex flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:px-8 sm:py-9">
        <div className="relative self-start">
          <span
            className={cn(
              "relative inline-flex size-19 items-center justify-center overflow-hidden rounded-full ring-3 sm:size-24",
              "bg-navy text-gold-soft ring-gold/45 text-[28px] font-black sm:text-[34px]",
            )}
          >
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
              "bg-gold text-navy-deep absolute -bottom-1 -left-1 flex size-9 cursor-pointer items-center justify-center rounded-full",
              avatarBusy && "animate-pulse opacity-70",
            )}
          >
            <Camera className="h-4 w-4" />
            <span className="sr-only">تغییر عکس پروفایل</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={onAvatar}
            />
          </label>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-gold text-[10px] font-black tracking-[0.22em]">
            MEMBER
          </p>
          <h1 className="mt-1 text-xl font-black text-white sm:text-3xl">
            {name}
          </h1>
          <div className="mt-2 flex flex-col gap-1 text-xs text-white/75 sm:flex-row sm:gap-4">
            <span className="inline-flex items-center gap-1.5 truncate">
              <Mail className="text-gold h-3.5 w-3.5" />
              <span dir="ltr">{user.email}</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Phone className="text-gold h-3.5 w-3.5" />
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
  );
}
