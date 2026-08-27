"use client";

import type { ReactNode } from "react";
import { Heart } from "lucide-react";
import type { Product } from "@/types";
import { useStore } from "@/lib/store";

/** Favourite toggle — the only interactive part of the (otherwise server-rendered) card image. */
export function FavButton({ name }: { name: string }) {
  const { favs, toggleFav } = useStore();
  const liked = favs.includes(name);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFav(name);
      }}
      aria-label="علاقه‌مندی"
      aria-pressed={liked}
      className="size-8.5 rounded-full inline-flex items-center justify-center shrink-0 bg-white border-2 border-rose transition-transform duration-300 hover:scale-110 active:scale-95"
    >
      <Heart className="size-4 text-rose" fill={liked ? "currentColor" : "none"} />
    </button>
  );
}

/** Add-to-cart (or notify-me when out of stock). The server card supplies the styling + label. */
export function AddToCart({
  p,
  out,
  className,
  children,
}: {
  p: Pick<Product, "id" | "name" | "price" | "img">;
  out: boolean;
  className?: string;
  children: ReactNode;
}) {
  const { addToCart, showToast } = useStore();
  function add(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (out) {
      showToast("به محض موجود شدن خبرتان می‌کنیم");
      return;
    }
    addToCart({ id: p.id, name: p.name, price: p.price, img: p.img, size: "۹۸" });
    showToast("به سبد اضافه شد");
  }
  return (
    <button type="button" onClick={add} className={className}>
      {children}
    </button>
  );
}
