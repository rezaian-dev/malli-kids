"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { STORAGE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Product } from "@/types";

/**
 * فرم ثبت نظر — تنها بخش تعاملی تب «نظر خریداران».
 * client چون به وضعیت ورود و localStorage خریدها نیاز دارد.
 */
export function ReviewForm({ product }: { product: Pick<Product, "id" | "name"> }) {
  const { user, showToast } = useStore();
  const [review, setReview] = useState("");
  const [purchased, setPurchased] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE.purchases);
      const list: (number | string)[] = raw ? JSON.parse(raw) : [];
      setPurchased(list.includes(product.id % 8) || list.includes(product.name));
    } catch {
      setPurchased(false);
    }
  }, [product.id, product.name]);

  if (!user || !purchased) {
    return (
      <p className="rounded-3xl border border-dashed border-navy/15 bg-sand px-5 py-4 text-sm text-navy/55 dark:border-gold/30 dark:bg-dusk-alt dark:text-wheat">
        ثبت نظر فقط پس از خرید و ورود ممکن است.
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        showToast("نظر ثبت شد (دمو)");
        setReview("");
      }}
      className="space-y-3 rounded-3xl border border-navy/8 bg-white p-5 dark:border-gold/30 dark:bg-slate"
    >
      <p className="font-black text-navy dark:text-ivory">تجربه‌تان از این خرید</p>
      <Textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        placeholder="کیفیت دوخت، سایز و بسته‌بندی را بنویسید…"
        className="min-h-27.5 rounded-2xl border-gold/40"
      />
      <Button type="submit" variant="navy" className="h-11 px-6">
        ثبت نظر
      </Button>
    </form>
  );
}
