"use client";

import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const field =
  "mt-1.5 h-12 rounded-2xl border-gold/40 bg-transparent px-4 text-sm font-semibold text-navy placeholder:text-brown dark:border-gold-soft/50 dark:bg-transparent dark:text-ivory dark:placeholder:text-cream-mute";

export function Form() {
  return (
    <form
      className="lux-card space-y-4 p-6 sm:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        toast("پیام ثبت شد — به‌زودی پاسخ می‌دهیم");
        e.currentTarget.reset();
      }}
    >
      <div>
        <h2 className="text-lg font-black text-navy dark:text-linen">پیام بگذارید</h2>
        <p className="mt-1 text-sm text-navy/50 dark:text-khaki">معمولاً همان روز پاسخ می‌دهیم.</p>
      </div>
      <div>
        <Label className="text-xs font-bold text-navy dark:text-linen">نام</Label>
        <Input name="name" required placeholder="مثلاً سارا محمدی" className={field} />
      </div>
      <div>
        <Label className="text-xs font-bold text-navy dark:text-linen">موبایل</Label>
        <Input name="phone" dir="ltr" placeholder="0912…" className={`${field} text-left`} />
      </div>
      <div>
        <Label className="text-xs font-bold text-navy dark:text-linen">پیام</Label>
        <Textarea name="msg" required placeholder="سؤال سایز، سفارش یا بازدید از گالری…" className={`${field} min-h-32.5 py-3`} />
      </div>
      <Button type="submit" variant="navy" size="pill" className="w-full">
        ارسال پیام
        <ArrowLeft className="size-4" />
      </Button>
    </form>
  );
}
