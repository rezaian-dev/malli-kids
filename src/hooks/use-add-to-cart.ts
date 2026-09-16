import { useRouter } from "next/navigation";
import { authHref, currentPathWithSearch } from "@/lib/auth/redirect";
import { toast } from "@/lib/toast";
import { useAuth } from "@/providers/auth-provider";
import { useCartStore } from "@/providers/cart-store-provider";

// No session, nothing added — returns whether it really went in
export function useAddToCart() {
  const { user } = useAuth();
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addToCart);

  return (id: number, size: string, qty = 1) => {
    if (!user) {
      router.push(authHref(currentPathWithSearch()));
      toast.warning("برای افزودن به سبد خرید ابتدا وارد شوید");
      return false;
    }
    addToCart(id, size, qty);
    return true;
  };
}
