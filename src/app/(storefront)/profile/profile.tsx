"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, LogOut, Mail, MapPin, Package, Pencil, Phone, UserRound } from "lucide-react";
import { useStore } from "@/lib/store";
import { fullName, givenName } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { compressToDataUrl } from "@/components/ui/image-upload";

type Tab = "info" | "orders";

const IN = "h-[46px] rounded-2xl border-gold/40 bg-white px-4 text-sm font-semibold dark:bg-dusk-mid dark:text-linen";
const CARD = "mt-5 rounded-[24px] border border-navy/10 bg-white p-5 space-y-5 dark:border-gold/35 dark:bg-dusk sm:p-7";

export function Profile() {
  const { user, setAuthOpen, updateUser, logout, showToast } = useStore();
  const [tab, setTab] = useState<Tab>("info");
  const [form, setForm] = useState({
    firstName: "", lastName: "", nationalId: "", city: "", address: "", phone: "", email: "",
    childName: "", childAge: "", childGender: "",
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      firstName: user.firstName || "", lastName: user.lastName || "", nationalId: user.nationalId || "",
      city: user.city || "", address: user.address || "", phone: user.phone || "", email: user.email || "",
      childName: user.childName || "", childAge: user.childAge || "", childGender: user.childGender || "",
    });
  }, [user]);

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
        <Button type="button" variant="navy" size="pill" onClick={() => setAuthOpen(true)}>ورود | ثبت‌نام</Button>
      </div>
    );
  }

  const nick = givenName(user.firstName);
  const name = fullName(user.firstName, user.lastName);

  function set<K extends keyof typeof form>(key: K, v: string) {
    setForm((s) => ({ ...s, [key]: v }));
  }

  function go(next: Tab) {
    setTab(next);
    window.history.replaceState(null, "", next === "info" ? "/profile" : `/profile#${next}`);
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName.trim() || !form.email.trim()) return showToast("نام و ایمیل لازم است");
    updateUser({
      firstName: form.firstName.trim(), lastName: form.lastName.trim() || undefined,
      nationalId: form.nationalId.trim() || undefined, city: form.city.trim() || undefined,
      address: form.address.trim() || undefined, phone: form.phone.trim() || undefined, email: form.email.trim(),
    });
    showToast("اطلاعات حساب ذخیره شد");
  }

  function saveChild(e: React.FormEvent) {
    e.preventDefault();
    updateUser({
      childName: form.childName.trim() || undefined,
      childAge: form.childAge.trim() || undefined,
      childGender: form.childGender.trim() || undefined,
    });
    showToast("اطلاعات کوچولو ذخیره شد");
  }

  async function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await compressToDataUrl(file, { maxSizeMB: 0.3, maxWidthOrHeight: 512 });
      updateUser({ avatar: url });
      showToast("عکس پروفایل به‌روز شد");
    } catch {
      showToast("پردازش عکس ناموفق بود");
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
            <label className="absolute -bottom-1 -left-1 flex size-9 cursor-pointer items-center justify-center rounded-full bg-gold text-navy-deep">
              <Camera className="h-4 w-4" />
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
          {([["info", "اطلاعات", Pencil], ["orders", "سفارش‌ها", Package]] as const).map(([id, label, Icon]) => (
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
          <form onSubmit={save} className={CARD}>
            <h2 className="text-lg font-black text-navy dark:text-linen">ویرایش حساب</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="نام"><Input value={form.firstName} onChange={(e) => set("firstName", e.target.value)} className={IN} required /></Field>
              <Field label="نام خانوادگی"><Input value={form.lastName} onChange={(e) => set("lastName", e.target.value)} className={IN} /></Field>
              <Field label="کد ملی"><Input inputMode="numeric" dir="ltr" maxLength={10} placeholder="0123456789" value={form.nationalId} onChange={(e) => set("nationalId", e.target.value.replace(/\D/g, "").slice(0, 10))} className={`${IN} text-left`} /></Field>
              <Field label="شهر"><Input value={form.city} onChange={(e) => set("city", e.target.value)} className={IN} placeholder="تهران" /></Field>
              <div className="sm:col-span-2"><Field label="آدرس"><Input value={form.address} onChange={(e) => set("address", e.target.value)} className={IN} /></Field></div>
              <Field label="شماره موبایل"><Input type="tel" dir="ltr" placeholder="0912 345 6789" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={`${IN} text-left`} /></Field>
              <Field label="ایمیل"><Input type="email" dir="ltr" value={form.email} onChange={(e) => set("email", e.target.value)} className={`${IN} text-left`} required /></Field>
            </div>
            <Button type="submit" variant="navy" className="h-11 px-7">ذخیره حساب</Button>
          </form>
          <form onSubmit={saveChild} className={CARD}>
            <h2 className="text-lg font-black text-navy dark:text-linen">اطلاعات کوچولو</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="نام کوچولو"><Input value={form.childName} onChange={(e) => set("childName", e.target.value)} className={IN} /></Field>
              <Field label="سن تقریبی"><Input value={form.childAge} onChange={(e) => set("childAge", e.target.value)} className={IN} placeholder="مثلاً ۳ سال" /></Field>
              <Field label="جنسیت"><Input value={form.childGender} onChange={(e) => set("childGender", e.target.value)} className={IN} placeholder="دختر / پسر" /></Field>
            </div>
            <Button type="submit" variant="gold" className="h-11 px-7">ذخیره اطلاعات کودک</Button>
          </form>
        </TabsContent>

        <TabsContent value="orders">
          <Empty icon={<MapPin className="mx-auto mb-3 h-10 w-10 text-gold" />} title="هنوز سفارشی نیست" desc="پس از خرید، پیگیری سفارش اینجا دیده می‌شود." href="/shop" cta="رفتن به فروشگاه" gold />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0 space-y-1.5">
      <Label className="text-sm font-bold text-navy dark:text-linen">{label}</Label>
      {children}
    </label>
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
