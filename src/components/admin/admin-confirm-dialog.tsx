"use client";

import { useState, useTransition, type ReactNode } from "react";
import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/lib/toast";
import type { ActionResult } from "@/lib/action-result";

/** ⚠️ The one confirm-before-destroy pattern every admin delete button
 *  should go through — title/description, a pending state on the confirm
 *  button, and a toast on the result, instead of each page hand-rolling its
 *  own "are you sure" (or, until now, no confirmation at all). */
export function AdminConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "حذف",
  successMessage,
  onConfirm,
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  successMessage?: string;
  onConfirm: () => Promise<ActionResult>;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const result = await onConfirm();
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      if (successMessage) toast.success(successMessage);
      setOpen(false);
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>انصراف</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              confirm();
            }}
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            {pending ? "در حال انجام…" : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
