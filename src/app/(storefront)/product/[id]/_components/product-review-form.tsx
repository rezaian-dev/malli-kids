"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/providers/store-provider";
import { STORAGE } from "@/lib/constants";
import { faNow } from "@/lib/format";
import { Button } from "@/components/ui/button";
import {
  AppForm,
  Field,
  TextField,
  TextareaField,
  useAppForm,
} from "@/components/form";
import { cn } from "@/lib/utils";
import { Product } from "@/types";
import {
  RATING_STARS,
  reviewDefaults,
  reviewSchema,
} from "../_lib/product-review-schema";
import { useLiveProduct } from "./product-live-context";

// ✍️ Review form with lightweight validation.
export function ProductReviewForm({ product: seed }: { product: Product }) {
  const product = useLiveProduct(seed);
  const { user } = useStore();
  const [purchased, setPurchased] = useState(false);
  const form = useAppForm({
    schema: reviewSchema,
    defaultValues: reviewDefaults,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE.purchases);
      const orders: { items?: { id?: number; name?: string }[] }[] = raw
        ? JSON.parse(raw)
        : [];
      setPurchased(
        orders.some(
          (o) =>
            Array.isArray(o?.items) &&
            o.items.some(
              (it) => it.id === product.id || it.name === product.name,
            ),
        ),
      );
    } catch {
      setPurchased(false);
    }
  }, [product.id, product.name]);

  if (!user || !purchased) {
    return (
      <p
        className={cn(
          "rounded-2xl border border-dashed px-4 py-4 text-sm leading-7 sm:rounded-3xl sm:px-5",
          "border-navy/15 bg-sand text-navy/70",
          "dark:border-gold/30 dark:bg-dusk-alt dark:text-wheat",
        )}
      >
        ثبت نظر فقط پس از خرید و ورود ممکن است.
      </p>
    );
  }

  function onValid({ rating, body }: typeof reviewDefaults) {
    try {
      const raw = window.localStorage.getItem(STORAGE.adminDb);
      const db = raw ? (JSON.parse(raw) as { reviews?: unknown[] }) : {};
      const reviews = Array.isArray(db.reviews) ? db.reviews : [];
      reviews.unshift({
        id: `ur-${Date.now().toString(36)}`,
        product: product.name,
        author: user
          ? `${user.firstName} ${user.lastName ?? ""}`.trim()
          : "کاربر",
        rate: Number(rating),
        text: body.trim(),
        date: faNow(),
        visible: false,
      });
      db.reviews = reviews;
      window.localStorage.setItem(STORAGE.adminDb, JSON.stringify(db));
    } catch {}
    toast.success(
      `نظرِ ${rating} ستاره‌تان ثبت شد — پس از تأیید ادمین نمایش داده می‌شود ✨`,
    );
    form.reset({ ...reviewDefaults });
  }

  return (
    <AppForm
      form={form}
      onSubmit={onValid}
      ariaLabel="ثبت نظر"
      className={cn(
        "space-y-4 rounded-3xl p-5 shadow-[0_16px_36px_-26px_rgba(14,42,71,.28)]",
        "border-navy/8 border bg-white/90",
        "dark:border-gold/30 dark:bg-slate",
      )}
    >
      <p className="text-navy dark:text-ivory text-sm font-black">
        تجربه‌تان از این خرید
      </p>

      <Field name="rating" label="امتیاز" skin="soft" required noShell>
        {({ field, invalid }) => (
          <div
            className={cn(
              "flex items-center gap-1",
              invalid && "animate-shake",
            )}
            role="radiogroup"
            aria-label="امتیاز به این محصول"
          >
            {RATING_STARS.map((n, i) => {
              const on = i < Number(field.value || 0);
              return (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={field.value === n}
                  aria-label={`${n} ستاره`}
                  onClick={() => {
                    field.onChange(n);
                    field.onBlur();
                  }}
                  className={cn(
                    "inline-flex size-11 items-center justify-center rounded-xl transition-all motion-safe:hover:scale-110 motion-safe:active:scale-90",
                    "hover:bg-gold/10 focus-visible:ring-gold focus-visible:ring-2 focus-visible:outline-none",
                    on
                      ? "text-gold scale-105"
                      : "text-navy/25 dark:text-ivory/25",
                  )}
                >
                  <Star className={cn("size-6", on && "fill-gold")} />
                </button>
              );
            })}
          </div>
        )}
      </Field>

      <TextField
        name="title"
        label="عنوانِ نظر (اختیاری)"
        skin="soft"
        placeholder="کوتاه و مفید"
        maxLength={60}
      />

      <TextareaField
        name="body"
        label="نظرِ شما"
        skin="soft"
        placeholder="تجربه‌تان از محصول…"
        min={20}
        maxLength={500}
        required
      />

      <Button type="submit" variant="navy" className="h-11 px-6">
        ثبت نظر
      </Button>
    </AppForm>
  );
}
