"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { CannedResponse } from "@/lib/shop/canned-responses";
import {
  createCannedResponseAction,
  removeCannedResponseAction,
} from "../_lib/actions";

/** 💬 The team's shared snippet library — the composer chips in ticket +
 *  chat cards insert these; an empty library falls back to built-ins. */
export function CannedManager({
  open,
  canned,
  onClose,
  onChanged,
}: {
  open: boolean;
  canned: CannedResponse[];
  onClose: () => void;
  onChanged: (next: CannedResponse[]) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  function add() {
    if (title.trim().length < 2 || body.trim().length < 2) {
      toast.warning("عنوان و متن پاسخ آماده را بنویسید");
      return;
    }
    startTransition(async () => {
      const result = await createCannedResponseAction(
        title.trim(),
        body.trim(),
      );
      if (!result.ok || !result.data) {
        toast.error(result.ok ? "خطایی رخ داد" : result.error);
        return;
      }
      onChanged([...canned, result.data]);
      setTitle("");
      setBody("");
      toast.success("پاسخ آماده ذخیره شد");
    });
  }

  function remove(id: string) {
    // 🛡️ Built-in defaults aren't real rows — nothing to delete.
    if (id.startsWith("default-")) return;
    startTransition(async () => {
      const result = await removeCannedResponseAction(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      onChanged(canned.filter((item) => item.id !== id));
      toast.success("پاسخ آماده حذف شد");
    });
  }

  return (
    <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto p-5 pt-12 sm:max-w-lg">
        <DialogTitle className="flex items-center gap-2 text-sm font-black">
          <Zap className="text-gold size-4" /> پاسخ‌های آماده
        </DialogTitle>
        <p className="text-navy/70 dark:text-wheat -mt-2 text-xs leading-6">
          این متن‌ها به‌صورت دکمه بالای فرم پاسخ تیکت و چت می‌آیند؛ با یک کلیک
          در متن پاسخ درج می‌شوند.
        </p>

        <div className="space-y-2">
          {canned.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-start justify-between gap-2 rounded-xl border px-3 py-2.5",
                "border-navy/8 dark:border-gold/16",
              )}
            >
              <div className="min-w-0">
                <p className="text-xs font-black">{item.title}</p>
                <p className="text-navy/70 dark:text-wheat mt-0.5 line-clamp-2 text-[11px] leading-5">
                  {item.body}
                </p>
              </div>
              {item.id.startsWith("default-") ? (
                <span className="text-navy/50 dark:text-wheat/60 bg-navy/5 shrink-0 rounded-lg px-2 py-1 text-[9px] font-black dark:bg-white/6">
                  پیش‌فرض
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => remove(item.id)}
                  disabled={pending}
                  aria-label={`حذف ${item.title}`}
                  className="text-rose hover:bg-rose/10 grid size-8 shrink-0 place-items-center rounded-lg transition disabled:opacity-50"
                >
                  <Trash2 className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="border-navy/8 dark:border-gold/16 space-y-2 border-t pt-3">
          <p className="text-xs font-black">افزودن پاسخ تازه</p>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={60}
            placeholder="عنوان کوتاه، مثلاً: درخواست شماره سفارش"
            aria-label="عنوان پاسخ آماده"
            className="h-10 rounded-xl"
          />
          <Textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            maxLength={1000}
            placeholder="متن کامل پاسخ…"
            aria-label="متن پاسخ آماده"
            className="min-h-20 resize-y rounded-xl"
          />
          <Button
            type="button"
            variant="navy"
            size="sm"
            onClick={add}
            disabled={pending}
            className="w-full rounded-xl"
          >
            <Plus className="size-4" /> ذخیره پاسخ آماده
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
