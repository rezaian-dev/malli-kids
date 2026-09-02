import { toast } from "@/lib/toast";
import { useAuth } from "@/providers/auth-provider";
import { useCartStore } from "@/providers/cart-store-provider";

/** 🛒 A cart is a real order-in-waiting, not a scratch list — same rule as
 *  favorites/reviews: no session, nothing gets added. Returns whether it
 *  actually went in, so callers only fire their own "added to cart" toast
 *  when it's true instead of alongside the login dialog. */
export function useAddToCart() {
  const { user, setAuthOpen } = useAuth();
  const addToCart = useCartStore((state) => state.addToCart);

  return (id: number, size: string, qty = 1) => {
    if (!user) {
      setAuthOpen(true);
      toast.warning("برای افزودن به سبد خرید ابتدا وارد شوید");
      return false;
    }
    addToCart(id, size, qty);
    return true;
  };
}
