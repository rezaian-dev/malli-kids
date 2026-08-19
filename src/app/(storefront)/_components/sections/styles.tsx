import { getAllProducts } from "@/lib/shop/products";
import { wash } from "@/components/shared/section-wash";
import { StylesFilter } from "./styles-filter";

export async function Styles() {
  // 🧊 Live, cached catalog (see `page.tsx`'s own comment) — not the static
  // seed array, so a hidden/edited product never lingers here.
  const catalog = (await getAllProducts()).filter((product) => product.visible);

  return (
    <section
      id="styles"
      className={`${wash.silk} cv-auto py-12 sm:py-16 lg:py-20`}
    >
      <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7">
        <StylesFilter catalog={catalog} />
      </div>
    </section>
  );
}
