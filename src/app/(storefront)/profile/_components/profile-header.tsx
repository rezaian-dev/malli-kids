"use client";

import Image from "next/image";
import { useState, type ChangeEvent } from "react";
import { Camera, LogOut, Mail, Phone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/providers/store-provider";
import { fullName, givenName } from "@/lib/text/name";
import { cn } from "@/lib/utils";
import { removeAvatarAction, updateAvatarAction } from "../_lib/actions";
import { AVATAR_MAX_BYTES } from "../_lib/schemas";
import type { User } from "@/types";

/** 🪪 Avatar (with upload + remove), name/contact, and the logout button. */
export function ProfileHeader({ user }: { user: User }) {
  const { updateUser, logout } = useStore();
  const [avatarBusy, setAvatarBusy] = useState(false);

  const nick = givenName(user.firstName);
  const name = fullName(user.firstName, user.lastName);

  async function onAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const { toast } = await import("@/lib/toast");
    if (file.size > AVATAR_MAX_BYTES) {
      toast.error("حجمِ عکس نباید بیشتر از ۱ مگابایت باشد.");
      return;
    }

    setAvatarBusy(true);
    try {
      const { compressToDataUrl } = await import("@/components/ui/image-upload");
      const url = await compressToDataUrl(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 512,
      });
      const result = await updateAvatarAction(url);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      updateUser(result.data);
      toast.success("عکس پروفایل به‌روز شد ✅");
    } catch {
      toast.error("پردازش عکس ناموفق بود");
    } finally {
      setAvatarBusy(false);
    }
  }

  async function onRemoveAvatar() {
    const { toast } = await import("@/lib/toast");
    setAvatarBusy(true);
    try {
      const result = await removeAvatarAction();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      // 🩹 Not `updateUser(result.data)` — a Server Action's return value
      // doesn't reliably carry an explicit `avatar: undefined` back across
      // the server/client boundary (it arrives with the key simply absent,
      // which `{...current, ...patch}` then merges as a no-op, leaving the
      // old picture on screen despite the delete having actually succeeded
      // server-side). We already know locally what "removed" means, so set
      // it directly instead of trusting the round-tripped value for it.
      updateUser({ avatar: undefined });
      toast.success("عکس پروفایل حذف شد ✅");
    } finally {
      setAvatarBusy(false);
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
                alt={`تصویر پروفایل ${nick}`}
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
              disabled={avatarBusy}
              onChange={onAvatar}
            />
          </label>

          {user.avatar ? (
            <button
              type="button"
              onClick={onRemoveAvatar}
              disabled={avatarBusy}
              className={cn(
                "bg-rose absolute -top-1 -left-1 flex size-7 items-center justify-center rounded-full text-white",
                "ring-navy-deep ring-2",
                avatarBusy && "pointer-events-none opacity-70",
              )}
            >
              <X className="h-3.5 w-3.5" />
              <span className="sr-only">حذف عکس پروفایل</span>
            </button>
          ) : null}
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
