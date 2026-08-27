import { Suspense } from "react";
import { Explorer } from "./explorer";

export default function ShopPage() {
  return (
    <Suspense fallback={<p className="px-6 py-10">در حال بارگذاری فروشگاه…</p>}>
      <Explorer />
    </Suspense>
  );
}
