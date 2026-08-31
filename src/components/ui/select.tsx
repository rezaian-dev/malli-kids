"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "radix-ui";
import { Check, ChevronDown, ChevronUp } from "lucide-react";

import { FIELD_FOCUS } from "@/lib/field";
import { cn } from "@/lib/utils";

function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectGroup(
  props: React.ComponentProps<typeof SelectPrimitive.Group>,
) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />;
}

function SelectValue(
  props: React.ComponentProps<typeof SelectPrimitive.Value>,
) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default";
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "group/select border-navy/12 text-navy flex w-full items-center justify-between gap-2 rounded-2xl border bg-white/90 px-3.5 text-sm font-bold shadow-none backdrop-blur-md transition-[color,box-shadow,border-color] duration-200 outline-none",
        "data-[size=default]:h-11 data-[size=sm]:h-9",
        "hover:border-gold/50",
        FIELD_FOCUS,
        "aria-invalid:border-destructive",
        "data-placeholder:text-navy/40 disabled:cursor-not-allowed disabled:opacity-50",
        "dark:border-gold/25 dark:bg-navy-deep/55 dark:text-ivory dark:hover:border-gold/50 dark:data-placeholder:text-wheat/70",
        "[&>span]:line-clamp-1 [&>span]:text-right",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDown className="text-gold size-4 shrink-0 transition-transform duration-200 group-data-open/select:rotate-180" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

function SelectContent({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        className={cn(
          "border-gold/30 bg-paper/96 text-navy relative z-130 max-h-(--radix-select-content-available-height) min-w-32 origin-(--radix-select-content-transform-origin) overflow-hidden rounded-2xl border p-1.5 shadow-[0_28px_70px_-24px_rgba(14,42,71,0.55),0_0_0_1px_rgba(193,147,87,0.12)] backdrop-blur-xl duration-150 dark:border-gold/25 dark:bg-navy-deep/96 dark:text-ivory dark:shadow-[0_28px_70px_-24px_rgba(0,0,0,0.72),0_0_40px_rgba(193,147,87,0.08)]",
          "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=top]:-translate-y-1",
          className,
        )}
        position={position}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          className={cn(
            "p-0.5",
            position === "popper" &&
              "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width) scroll-my-1",
          )}
        >
          {children}
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn("text-gold px-3 py-1.5 text-[11px] font-black", className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "text-navy relative flex w-full cursor-pointer items-center rounded-xl py-2 ps-3 pe-9 text-sm font-bold outline-none select-none",
        "focus:bg-gold/12 focus:text-gold-deep data-[state=checked]:bg-gold/14 data-[state=checked]:text-gold-deep",
        "data-disabled:pointer-events-none data-disabled:opacity-50",
        "dark:text-ivory dark:focus:bg-gold/20 dark:focus:text-gold-soft dark:data-[state=checked]:bg-gold/20 dark:data-[state=checked]:text-gold-soft",
        className,
      )}
      {...props}
    >
      <span className="absolute inset-e-3 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Check className="text-gold size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-navy/8 dark:bg-gold/15 -mx-1 my-1 h-px", className)}
      {...props}
    />
  );
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "text-gold flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronUp className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "text-gold flex cursor-default items-center justify-center py-1",
        className,
      )}
      {...props}
    >
      <ChevronDown className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
