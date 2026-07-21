import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

// 🗂️ The shared "card" shell — every route used to hand-roll its own
// `rounded-2xl border ...` div with slightly different radius/padding; this
// is the one primitive, styled with the same neutral `bg-card`/`border`
// tokens as `Dialog`/`Sheet`, that every one of those call sites now
// overrides via `className` the same way they already override Dialog's.
// `asChild` (same pattern as `Button`/`Badge`) renders the card's classes
// onto a passed-in element instead — a whole card that's itself a `Link`,
// same as `<Button asChild><Link/></Button>` elsewhere in this app.
function Card({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"div"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "div";
  return (
    <Comp
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-4 rounded-2xl border py-5 shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 px-5", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-sm leading-none font-black", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-xs", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-5", className)}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-5", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
