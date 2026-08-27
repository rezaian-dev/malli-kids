import { CircleDot, Ellipsis, Gift, Leaf, Minus, Star } from "lucide-react";

export function GoldMark({ className = "" }: { className?: string }) {
  return <Minus className={`text-gold ${className}`} strokeWidth={4} aria-hidden />;
}

export function OrnStar({ className = "" }: { className?: string }) {
  return <Star className={`animate-orn-spin fill-gold text-gold ${className}`} aria-hidden />;
}

export function OrnRing({ className = "" }: { className?: string }) {
  return <CircleDot className={`animate-orn-pulse text-gold ${className}`} strokeWidth={1.6} aria-hidden />;
}

export function OrnLeaf({ className = "" }: { className?: string }) {
  return <Leaf className={`animate-orn-sway text-gold ${className}`} aria-hidden />;
}

export function OrnStitch({ className = "" }: { className?: string }) {
  return <Ellipsis className={`text-gold ${className}`} strokeWidth={2.4} aria-hidden />;
}

export function OrnBow({ className = "" }: { className?: string }) {
  return <Gift className={`animate-orn-sway text-gold ${className}`} aria-hidden />;
}
