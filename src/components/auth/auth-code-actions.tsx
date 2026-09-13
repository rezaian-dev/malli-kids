"use client";

import { useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { ArrowRight, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requestErrorMessage, type ActionResult } from "@/lib/action-result";
import { toFaDigits } from "@/lib/locale/fa";
import { toast } from "@/lib/toast";
import { reportAuthError, type useCooldown } from "./auth-shared";

export function CodeStepActions({
  cooldown,
  onResend,
  onBack,
  onSent,
  onPendingChange,
  backLabel = "ویرایش شماره",
  sentMessage = "کد جدید ارسال شد؛ فقط آخرین کد معتبر است.",
}: {
  cooldown: ReturnType<typeof useCooldown>;
  onResend: () => Promise<ActionResult>;
  onBack: () => void;
  onSent: () => void;
  onPendingChange?: (pending: boolean) => void;
  backLabel?: string;
  sentMessage?: string;
}) {
  const form = useFormContext();
  const lock = useRef(false);
  const [pending, setPending] = useState(false);
  const busy = pending || form.formState.isSubmitting;

  async function resend() {
    if (lock.current || busy || cooldown.sec > 0) return;
    lock.current = true;
    setPending(true);
    onPendingChange?.(true);
    form.clearErrors("root.server");
    try {
      const result = await onResend();
      if (!result.ok) {
        reportAuthError(form, result);
        if (result.retryAfterSec) cooldown.restart(result.retryAfterSec);
        return;
      }
      cooldown.restart();
      onSent();
      toast.info(sentMessage);
    } catch {
      form.setError("root.server", {
        type: "server",
        message: requestErrorMessage(),
      });
    } finally {
      lock.current = false;
      setPending(false);
      onPendingChange?.(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs font-bold">
      {cooldown.sec > 0 ? (
        <span className="text-navy/70 dark:text-linen/70" aria-live="off">
          ارسال دوباره تا {toFaDigits(cooldown.sec)} ثانیه
        </span>
      ) : (
        <Button
          type="button"
          variant="link"
          className="text-gold h-10 gap-1 px-0 text-xs font-bold"
          onClick={resend}
          disabled={busy}
          aria-busy={pending || undefined}
        >
          {pending ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RotateCcw className="size-3.5" />
          )}
          {pending ? "در حال ارسال…" : "ارسال دوبارهٔ کد"}
        </Button>
      )}
      <Button
        type="button"
        variant="link"
        className="text-navy/70 dark:text-linen/70 h-10 px-0 text-xs font-bold"
        onClick={onBack}
        disabled={busy}
      >
        {backLabel} <ArrowRight className="size-3.5" />
      </Button>
    </div>
  );
}
