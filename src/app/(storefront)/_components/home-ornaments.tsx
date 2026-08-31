import { Ellipsis, Gift, Leaf, Minus, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function GoldMark({ className = "" }: { className?: string }) {
  return (
    <Minus className={cn("text-gold", className)} strokeWidth={4} aria-hidden />
  );
}

export function OrnStar({ className = "" }: { className?: string }) {
  return (
    <Star
      className={cn("animate-orn-spin fill-gold text-gold", className)}
      aria-hidden
    />
  );
}

export function OrnLeaf({ className = "" }: { className?: string }) {
  return (
    <Leaf className={cn("animate-orn-sway text-gold", className)} aria-hidden />
  );
}

export function OrnStitch({ className = "" }: { className?: string }) {
  return (
    <Ellipsis
      className={cn("text-gold", className)}
      strokeWidth={2.4}
      aria-hidden
    />
  );
}

export function OrnBow({ className = "" }: { className?: string }) {
  return (
    <Gift className={cn("animate-orn-sway text-gold", className)} aria-hidden />
  );
}
