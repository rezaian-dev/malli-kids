"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, LogOut, Mail, MapPin, Package, Pencil, Phone, UserRound } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { fullName, givenName } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppForm, SelectField, TextField, useAppForm } from "@/components/form";
import { phoneDigits } from "@/lib/forms";
import { cn } from "@/lib/utils";
import { compressToDataUrl } from "@/components/ui/image-upload";
import { accountDefaults, accountSchema, childDefaults, childSchema, type AccountValues, type ChildValues } from "./schema";

type Tab = "info" | "orders";

const CARD = "mt-5 rounded-[24px] border border-navy/10 bg-white p-5 space-y-5 dark:border-gold/35 dark:bg-dusk sm:p-7";

/**
 * بخش «ویرایش حساب» و «اطلاعات کوچولو» — دو فرمِ مستقل با react-hook-form + zod.
 * اعتبارسنجی: نام و ایمیل الزامی، کد ملی با کنترل‌شماره، موبایل ۰۹، و
 * قاعدهٔ «آدرس بدونِ شهر» مجاز نیست.
 */
export function Profile() {
  const { user, setAuthOpen, updateUser, logout } = useStore();
  const [tab, setTab] = useState<Tab>("info");
  const [avatarBusy, setAvatarBusy] = useState(false);

  const account = useAppForm({ schema: accountSchema, defaultValues: accountDefaults });
  const child = useAppForm({ schema: childSchema, defaultValues: childDefaults });

  // مقدارها از حسابِ کاربر پر می‌شوند (یک‌بار به‌ازایِ هر تغییرِ user)
  useEffect(() => {
    if (!user) return;
    account.reset({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      nationalId: user.nationalId || "",
      city: user.city || "",
      address: user.address || "",
      phone: user.phone || "",
      email: user.email || "",
    });
    const gender = user.childGender?.trim();
    child.reset({
      childName: user.childName || "",
      childAge: user.childAge || "",
      // مقدارهای قدیمیِ ذخیره‌شده که درِ لیست نیستند، خالی خوانده می‌شوند
      childGender: gender === "دختر" || gender === "پسر" ? gender : "",
    });
  }, [user, account, child]);

  useEffect(() => {
    const apply = () => {
      const h = window.location.hash.replace("#", "");
      if (h === "orders" || h === "info") setTab(h);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
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

  function saveAccount(v: AccountValues) {
    updateUser({
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim() || undefined,
      nationalId: v.nationalId.trim() || undefined,
      city: v.city.trim() || undefined,
      address: v.address.trim() || undefined,
      phone: (phoneDigits(v.phone) || "").trim() || undefined,
      email: v.email.trim(),
    });
    toast.success("اطلاعات حساب ذخیره شد ✅");
  }

  function saveChild(v: ChildValues) {
    updateUser({
      childName: v.childName.trim() || undefined,
      childAge: v.childAge.trim() || undefined,
      childGender: v.childGender.trim() || undefined,
    });
    toast.success("اطلاعات کوچولو ذخیره شد ✅");
  }

  async function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarBusy(true);
    try {
      const url = await compressToDataUrl(file, { maxSizeMB: 0.3, maxWidthOrHeight: 512 });
      updateUser({ avatar: url });
      toast.success("عکس پروفایل به‌روز شد ✅");
    } catch {
      toast.error("پردازش عکس ناموفق بود");
    } finally {
      setAvatarBusy(false);
    }
  }

  return (
    <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7 max-w-5xl min-w-0 pb-10">
      <section className="overflow-hidden rounded-[28px] bg-linear-to-br from-navy via-navy-mid to-navy-light">
        <div className="flex flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:px-8 sm:py-9">
          <div className="relative self-start">
            <span className="inline-flex size-19 items-center justify-center overflow-hidden rounded-full bg-navy text-[28px] font-black text-gold-soft ring-[3px] ring-gold/45 sm:size-24 sm:text-[34px]">
              {user.avatar ? <img src={user.avatar} alt="" className="size-full object-cover" /> : nick.charAt(0)}
            </span>
            <label className={cn("absolute -bottom-1 -left-1 flex size-9 cursor-pointer items-center justify-center rounded-full bg-gold text-navy-deep", avatarBusy && "animate-pulse opacity-70")}>
              <Camera className="h-4 w-4" />
              <span className="sr-only">تغییر عکس پروفایل</span>
              <input type="file" accept="image/*" className="sr-only" onChange={onAvatar} />
            </label>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black tracking-[0.22em] text-gold">MEMBER</p>
            <h1 className="mt-1 text-xl font-black text-white sm:text-3xl">{name}</h1>
            <div className="mt-2 flex flex-col gap-1 text-[12px] text-white/75 sm:flex-row sm:gap-4">
              <span className="inline-flex items-center gap-1.5 truncate"><Mail className="h-3.5 w-3.5 text-gold" /><span dir="ltr">{user.email}</span></span>
              <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-gold" /><span dir="ltr">{user.phone?.trim() || "—"}</span></span>
            </div>
          </div>
          <Button type="button" variant="outline" className="h-10 rounded-full border-white/30 bg-white/10 text-white" onClick={logout}>
            <LogOut className="h-4 w-4" /> خروج
          </Button>
        </div>
      </section>

      <Tabs value={tab} onValueChange={(v) => go(v as Tab)} dir="rtl" className="mt-6 gap-0">
        <TabsList className="h-auto w-full justify-start gap-1.5 overflow-x-auto rounded-[18px] bg-sand p-1.5 dark:bg-dusk-mid">
          {(
            [
              ["info", "اطلاعات", Pencil],
              ["orders", "سفارش‌ها", Package],
            ] as const
          ).map(([id, label, Icon]) => (
            <TabsTrigger
              key={id}
              value={id}
              className={cn(
                "inline-flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-[13px] font-extrabold text-navy dark:text-linen",
                "data-[state=active]:bg-navy data-[state=active]:text-ivory",
                "dark:data-[state=active]:bg-gold dark:data-[state=active]:text-navy-deep",
              )}
            >
              <Icon className="h-4 w-4" /> {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="info">
          <AppForm form={account} onSubmit={saveAccount} ariaLabel="ویرایش حساب" className={CARD} notify>
            <h2 className="text-lg font-black text-navy dark:text-linen">ویرایش حساب</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField name="firstName" label="نام" skin="soft" maxLength={40} required autoComplete="given-name" />
              <TextField name="lastName" label="نام خانوادگی" skin="soft" maxLength={40} autoComplete="family-name" />
              <TextField
                name="nationalId"
                label="کد ملی"
                skin="soft"
                dir="ltr"
                inputMode="numeric"
                maxLength={10}
                placeholder="0123456789"
                inputClassName="tabular-nums"
                hint="۱۰ رقم؛ سالم بودنِ رقمِ کنترل هم بررسی می‌شود"
              />
              <TextField name="city" label="شهر" skin="soft" maxLength={40} placeholder="تهران" autoComplete="address-level2" />
              <TextField name="address" label="آدرس" skin="soft" className="sm:col-span-2" maxLength={160} autoComplete="street-address" />
              <TextField name="phone" label="شماره موبایل" skin="soft" type="tel" dir="ltr" inputMode="tel" placeholder="0912 345 6789" autoComplete="tel-national" />
              <TextField name="email" label="ایمیل" skin="soft" type="email" dir="ltr" autoComplete="email" required />
            </div>
            <Button type="submit" variant="navy" className="h-11 px-7">
              ذخیره حساب
            </Button>
          </AppForm>

          <AppForm form={child} onSubmit={saveChild} ariaLabel="اطلاعات کوچولو" className={CARD} notify>
            <h2 className="text-lg font-black text-navy dark:text-linen">اطلاعات کوچولو</h2>
            <p className="-mt-3 text-xs text-navy/50 dark:text-wheat">اختیاری است؛ اگر پرش کنید، ما سایزِ دقیق‌تری پیشنهاد می‌دهیم.</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <TextField name="childName" label="نام کوچولو" skin="soft" maxLength={40} placeholder="نیلو" />
              <TextField name="childAge" label="سن تقریبی" skin="soft" placeholder="مثلاً ۳ سال" hint="عدد + «سال» یا «ماه»" />
              <SelectField name="childGender" label="جنسیت" skin="soft" options={["دختر", "پسر"]} placeholder="انتخاب کنید" />
            </div>
            <Button type="submit" variant="gold" className="h-11 px-7">
              ذخیره اطلاعات کودک
            </Button>
          </AppForm>
        </TabsContent>

        <TabsContent value="orders">
          <Empty
            icon={<MapPin className="mx-auto mb-3 h-10 w-10 text-gold" />}
            title="هنوز سفارشی نیست"
            desc="پس از خرید، پیگیری سفارش اینجا دیده می‌شود."
            href="/shop"
            cta="رفتن به فروشگاه"
            gold
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Empty({ icon, title, desc, href, cta, gold }: { icon: React.ReactNode; title: string; desc: string; href: string; cta: string; gold?: boolean }) {
  return (
    <div className={`${CARD} p-10 text-center`}>
      {icon}
      <h2 className="text-lg font-black text-navy dark:text-linen">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-navy/50">{desc}</p>
      <Button asChild variant={gold ? "gold" : "navy"} className="mt-5 h-11 px-6">
        <Link href={href}>{cta}</Link>
      </Button>
    </div>
  );
}
