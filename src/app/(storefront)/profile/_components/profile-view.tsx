"use client";

import Image from "next/image";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, Headphones, Heart, Home, LogOut, Mail, Package, Pencil, Phone, Plus, Send, ShoppingBag, Truck, UserRound, Wallet } from "lucide-react";
import { toast } from "sonner";
import type { OrderStatus } from "@/types";
import { useStore } from "@/providers/store-provider";
import { fullName, formatToman, givenName, toFaDigits } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { AppForm, SelectField, TextField, TextareaField, useAppForm } from "@/components/form";
import { phoneDigits } from "@/lib/forms";
import { cn } from "@/lib/utils";
import { compressToDataUrl } from "@/components/ui/image-upload";
import { createTicket, replyTicket, useTickets, type Ticket, type TicketStatus } from "@/lib/tickets";
import { ORDER_FLOW, ORDER_STAGES, stageIndex, useOrders, type Order } from "@/lib/orders";
import { useFavorites } from "@/lib/favorites";
import { ProductCard } from "@/components/product";
import { CATALOG } from "@/lib/data/products";
import { accountDefaults, accountSchema, childDefaults, childSchema, ticketDefaults, ticketSchema, type AccountValues, type ChildValues, type TicketValues } from "../_lib/profile-schema";

type Tab = "info" | "orders" | "wishlist" | "support";

const CARD = "mt-5 rounded-[24px] border border-navy/10 bg-white p-5 space-y-5 dark:border-gold/35 dark:bg-dusk sm:p-7";

// 👤 Profile tabs with small, form-based sections.
export function ProfileView() {
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
      if (h === "orders" || h === "info" || h === "support" || h === "wishlist") setTab(h);
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
            <span className="relative inline-flex size-19 items-center justify-center overflow-hidden rounded-full bg-navy text-[28px] font-black text-gold-soft ring-[3px] ring-gold/45 sm:size-24 sm:text-[34px]">
              {user.avatar ? <Image src={user.avatar} alt="" fill unoptimized className="object-cover" /> : nick.charAt(0)}
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
              ["orders", "سفارش‌های من", ShoppingBag],
              ["wishlist", "علاقه‌مندی‌ها", Heart],
              ["support", "پشتیبانی", Headphones],
              ["info", "اطلاعات حساب", Pencil],
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
              <TextField
                name="phone"
                label="شماره موبایل"
                skin="soft"
                type="tel"
                dir="ltr"
                inputMode="tel"
                placeholder="0912…"
                autoComplete="tel-national"
                hint="فقط برای تماس در صورت نیاز؛ پشتیبانی فقط از طریق تیکت در سایت است."
              />
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
              <TextField name="childAge" label="سن تقریبی" skin="soft" placeholder="۳ سال" hint="عدد + «سال» یا «ماه»" />
              <SelectField name="childGender" label="جنسیت" skin="soft" options={["دختر", "پسر"]} placeholder="انتخاب کنید" />
            </div>
            <Button type="submit" variant="gold" className="h-11 px-7">
              ذخیره اطلاعات کودک
            </Button>
          </AppForm>
        </TabsContent>

        <TabsContent value="orders">
          <OrdersPanel />
        </TabsContent>

        <TabsContent value="wishlist">
          <WishlistPanel />
        </TabsContent>

        <TabsContent value="support">
          <SupportPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}

/* ─────────────── تبِ سفارش‌ها: آمار، فیلتر و خطِ زمانی ─────────────── */

const ORDER_TONE: Record<OrderStatus, string> = {
  جدید: "bg-gold/15 text-gold dark:bg-gold/20 dark:text-gold-light",
  "در حال آماده‌سازی": "bg-sky-500/10 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
  "ارسال‌شده": "bg-indigo-500/10 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300",
  "تحویل‌شده": "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  مرجوعی: "bg-rose/10 text-rose",
};

const STAGE_ICONS = [Wallet, Package, Truck, Home] as const;

function OrdersPanel() {
  const { user } = useStore();
  const owner = user?.email || user?.phone || "";
  const orders = useOrders(owner);
  const favs = useFavorites();
  const [filter, setFilter] = useState<"همه" | OrderStatus>("همه");

  if (!user) return null;

  const list = filter === "همه" ? orders : orders.filter((o) => o.status === filter);
  const paid = orders.filter((o) => o.status !== "مرجوعی").reduce((s, o) => s + o.total, 0);
  const active = orders.filter((o) => {
    const i = stageIndex(o.status);
    return i >= 0 && i < 3;
  }).length;

  const stats = [
    { Icon: ShoppingBag, k: "سفارش‌ها", v: toFaDigits(orders.length) },
    { Icon: Wallet, k: "جمعِ پرداختی", v: `${formatToman(paid)} ت` },
    { Icon: Truck, k: "در جریان", v: toFaDigits(active) },
    { Icon: Heart, k: "علاقه‌مندی‌ها", v: toFaDigits(favs.length) },
  ];

  return (
    <div className={CARD}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-navy dark:text-linen">سفارش‌های من</h2>
          <p className="mt-1 text-xs leading-6 text-navy/50 dark:text-wheat">هر سفارش در چه مرحله‌ای است را همین‌جا دنبال کنید.</p>
        </div>
        <Button asChild variant="gold" size="sm" className="h-10 shrink-0 rounded-full px-5">
          <Link href="/shop">
            <Plus className="size-4" /> خرید جدید
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(({ Icon, k, v }) => (
          <div key={k} className="rounded-2xl border border-navy/10 bg-navy/[0.02] px-4 py-3.5 text-center dark:border-gold/25 dark:bg-white/[0.03]">
            <Icon className="mx-auto size-4 text-gold" />
            <p className="mt-2 truncate text-sm font-black text-navy dark:text-ivory" dir="ltr">
              {v}
            </p>
            <p className="mt-0.5 text-[10px] font-bold text-navy/45 dark:text-wheat">{k}</p>
          </div>
        ))}
      </div>

      <ToggleGroup
        type="single"
        value={filter}
        onValueChange={(v) => v && setFilter(v as "همه" | OrderStatus)}
        className="flex w-full flex-wrap justify-start gap-1.5"
        aria-label="فیلتر وضعیت سفارش"
      >
        {(["همه", ...ORDER_FLOW] as const).map((f) => (
          <ToggleGroupItem
            key={f}
            value={f}
            className={cn(
              "h-auto rounded-full border px-3.5 py-1.5 text-[11px] font-black transition-colors",
              "border-navy/15 text-navy/55 hover:border-gold/60 dark:border-gold/25 dark:text-wheat",
              "data-[state=on]:border-navy data-[state=on]:bg-navy data-[state=on]:text-ivory",
              "dark:data-[state=on]:border-gold dark:data-[state=on]:bg-gold dark:data-[state=on]:text-navy-deep",
            )}
          >
            {f}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy/15 px-6 py-10 text-center dark:border-gold/25">
          <ShoppingBag className="mx-auto size-9 text-gold" />
          <p className="mt-3 font-black text-navy dark:text-ivory">هنوز سفارشی ندارید</p>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-6 text-navy/50 dark:text-wheat">اولین خریدتان را ثبت کنید؛ اینجا مرحله‌به‌مرحله تا دمِ درِ خانه پیگیری‌اش می‌کنید.</p>
          <Button asChild variant="navy" className="mt-4 h-10 px-6">
            <Link href="/shop">دیدنِ کالکشن</Link>
          </Button>
        </div>
      ) : list.length === 0 ? (
        <p className="rounded-2xl bg-navy/[0.03] px-4 py-6 text-center text-xs font-bold text-navy/50 dark:bg-white/[0.04] dark:text-wheat">سفارشی با این وضعیت ندارید.</p>
      ) : (
        <ul className="space-y-4">
          {list.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const stage = stageIndex(order.status);
  return (
    <li className="overflow-hidden rounded-2xl border border-navy/10 dark:border-gold/25">
      <div className="flex flex-wrap items-center gap-2 border-b border-navy/8 bg-navy/[0.02] px-4 py-3 dark:border-gold/15 dark:bg-white/[0.02]">
        <p className="text-sm font-black text-navy dark:text-ivory" dir="ltr">
          {order.id}
        </p>
        <span className={cn("rounded-full px-3 py-1 text-[10px] font-black", ORDER_TONE[order.status])}>{order.status}</span>
        <span className="ms-auto text-[10px] font-bold text-navy/45 dark:text-wheat">{order.date}</span>
        <span className="text-sm font-black text-gold">{formatToman(order.total)} تومان</span>
      </div>

      <ul className="space-y-2 px-4 py-3">
        {order.items.map((it) => (
          <li key={`${it.id}-${it.size}`} className="flex items-center gap-3">
            { }
            <Image src={it.img} alt="" width={48} height={48} className="size-12 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-navy dark:text-ivory">{it.name}</p>
              <p className="text-[11px] font-bold text-navy/50 dark:text-wheat">سایز {it.size} × {toFaDigits(it.qty)}</p>
            </div>
            <span className="text-xs font-black text-navy/70 dark:text-ivory/70">{formatToman(it.price * it.qty)}</span>
          </li>
        ))}
      </ul>

      {stage === -1 ? (
        <p className="mx-4 mb-4 rounded-xl bg-rose/10 px-4 py-2.5 text-[11px] font-black text-rose">این سفارش مرجوع شده است؛ مبلغ به کیف پول شما برمی‌گردد.</p>
      ) : (
        <ol className="flex items-center gap-0 px-4 pb-5 pt-1">
          {ORDER_STAGES.map((label, i) => {
            const Icon = STAGE_ICONS[i];
            const done = i <= stage;
            return (
              <li key={label} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-1.5 text-center">
                  <span
                    className={cn(
                      "grid size-9 place-items-center rounded-full border-2 transition-colors",
                      done ? "border-gold bg-gold text-navy-deep" : "border-navy/15 text-navy/35 dark:border-gold/25 dark:text-wheat/50",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className={cn("text-[9px] font-black", done ? "text-navy dark:text-ivory" : "text-navy/35 dark:text-wheat/50")}>{label}</span>
                </div>
                {i < ORDER_STAGES.length - 1 ? (
                  <span className={cn("mx-1 mb-5 h-0.5 flex-1 rounded-full", i < stage ? "bg-gold" : "bg-navy/10 dark:bg-gold/20")} />
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </li>
  );
}

/* ─────────────── تبِ علاقه‌مندی‌ها ─────────────── */

function WishlistPanel() {
  const favs = useFavorites();
  const products = CATALOG.filter((p) => favs.includes(p.id));

  return (
    <div className={CARD}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black text-navy dark:text-linen">
            <Heart className="size-5 fill-rose text-rose" /> علاقه‌مندی‌های من
          </h2>
          <p className="mt-1 text-xs leading-6 text-navy/50 dark:text-wheat">{toFaDigits(products.length)} محصول نشانده‌اید؛ هر وقت خواستید سراغ‌شان برگردید.</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-navy/15 px-6 py-10 text-center dark:border-gold/25">
          <Heart className="mx-auto size-9 text-rose/70" />
          <p className="mt-3 font-black text-navy dark:text-ivory">هنوز قلبی نزده‌اید</p>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-6 text-navy/50 dark:text-wheat">روی قلبِ هر محصول بزنید تا این‌جا برایتان نگه داشته شود.</p>
          <Button asChild variant="navy" className="mt-4 h-10 px-6">
            <Link href="/shop">گشتن در کالکشن</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} view="grid" />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────── تبِ پشتیبانی: تیکت‌ها ───────────────
 * پشتیبانیِ ملی‌کیدز فقط از طریقِ سایت است: کاربر تیکت می‌سازد و پاسخ را
 * در همین‌جا، پنلِ خودش می‌بیند. گفتگو زنده با پنلِ ادمین همگام است. */

const TICKET_STATUS: Record<TicketStatus, { label: string; cls: string }> = {
  open: { label: "در انتظار پاسخ", cls: "bg-gold/15 text-gold dark:bg-gold/20 dark:text-gold-light" },
  answered: { label: "پاسخ داده شد", cls: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300" },
  closed: { label: "بسته شده", cls: "bg-navy/8 text-navy/55 dark:bg-white/10 dark:text-ivory/55" },
};

function SupportPanel() {
  const { user } = useStore();
  const owner = user?.email || user?.phone || "";
  const tickets = useTickets(owner);
  const [compose, setCompose] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const form = useAppForm({ schema: ticketSchema, defaultValues: ticketDefaults });

  if (!user) return null;

  function submit(v: TicketValues) {
    createTicket({ owner, name: fullName(user!.firstName, user!.lastName), subject: v.subject, message: v.message });
    toast.success("تیکت ثبت شد — پاسخ را همین‌جا در پنل خودتان می‌بینید ✅");
    form.reset(ticketDefaults);
    setCompose(false);
  }

  return (
    <div className={CARD}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-navy dark:text-linen">تیکت‌های پشتیبانی</h2>
          <p className="mt-1 text-xs leading-6 text-navy/50 dark:text-wheat">
            هر سوالی دارید به‌صورت تیکت بپرسید؛ پاسخِ ما فقط و فقط در پنلِ خودتان ثبت می‌شود.
          </p>
        </div>
        {!compose ? (
          <Button type="button" variant="gold" size="sm" className="h-10 shrink-0 rounded-full px-5" onClick={() => setCompose(true)}>
            <Plus className="size-4" /> تیکت جدید
          </Button>
        ) : null}
      </div>

      {compose ? (
        <AppForm form={form} onSubmit={submit} ariaLabel="تیکت جدید" className="mt-5 space-y-4" notify>
          <TextField name="subject" label="موضوع" skin="soft" maxLength={60} required placeholder="سایز، سفارش…" />
          <TextareaField name="message" label="پیام" skin="soft" min={10} maxLength={600} required placeholder="سوال‌تان را بنویسید…" />
          <div className="flex gap-2">
            <Button type="submit" variant="navy" className="h-11 px-6">
              ثبت تیکت
            </Button>
            <Button type="button" variant="outline" className="h-11 px-5" onClick={() => setCompose(false)}>
              انصراف
            </Button>
          </div>
        </AppForm>
      ) : tickets.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-navy/15 px-6 py-10 text-center dark:border-gold/25">
          <Headphones className="mx-auto size-9 text-gold" />
          <p className="mt-3 font-black text-navy dark:text-ivory">هنوز تیکتی ندارید</p>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-6 text-navy/50 dark:text-wheat">
            مشاورهٔ سایز، پیگیری سفارش یا هر سوالِ دیگر — تیکت بسازید تا در همین پنل پاسخ بگیرید.
          </p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {tickets.map((t) => {
            const open = openId === t.id;
            const st = TICKET_STATUS[t.status];
            return (
              <li key={t.id} className="overflow-hidden rounded-2xl border border-navy/10 dark:border-gold/25">
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-start transition-colors hover:bg-navy/[0.03] dark:hover:bg-white/[0.04]"
                  onClick={() => setOpenId(open ? null : t.id)}
                  aria-expanded={open}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-black text-navy dark:text-ivory">{t.subject}</span>
                    <span className="mt-0.5 block text-[10px] font-bold text-navy/45 dark:text-wheat">{t.createdAt}</span>
                  </span>
                  <span className={cn("shrink-0 rounded-full px-3 py-1 text-[10px] font-black", st.cls)}>{st.label}</span>
                </button>
                {open ? <TicketThread ticket={t} /> : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** رشتهٔ گفتگوی یک تیکت + پاسخِ پیگیریِ کاربر */
function TicketThread({ ticket }: { ticket: Ticket }) {
  const [reply, setReply] = useState("");

  function send() {
    const text = reply.trim();
    if (text.length < 2) return;
    replyTicket(ticket.id, "user", text);
    setReply("");
  }

  return (
    <div className="space-y-3 border-t border-navy/8 bg-navy/[0.02] px-4 py-4 dark:border-gold/15 dark:bg-white/[0.02]">
      {ticket.replies.map((r, i) => (
        <div key={i} className={cn("flex", r.from === "support" ? "justify-end" : "justify-start")}>
          <div
            className={cn(
              "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-7",
              r.from === "support"
                ? "rounded-se-md border border-gold/30 bg-gold/10 text-navy dark:text-ivory"
                : "rounded-ss-md border border-navy/10 bg-white text-navy dark:border-white/10 dark:bg-dusk-mid dark:text-linen",
            )}
          >
            <p className="mb-1 text-[10px] font-black text-gold">{r.from === "support" ? "پشتیبانی" : "شما"}</p>
            <p className="whitespace-pre-wrap">{r.text}</p>
            <p className="mt-1.5 text-[10px] font-bold text-navy/40 dark:text-wheat">{r.at}</p>
          </div>
        </div>
      ))}

      <div className="flex gap-2 pt-1">
        <Input
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="پیام پیگیری…"
          className="h-10 flex-1 rounded-xl"
        />
        <Button type="button" variant="navy" size="icon" className="size-10 shrink-0 rounded-xl" onClick={send} aria-label="ارسال پیام">
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  );
}
