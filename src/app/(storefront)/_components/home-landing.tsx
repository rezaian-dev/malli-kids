import { Atelier } from "./sections/atelier";
import { Categories } from "./sections/categories";
import { Handmade } from "./sections/handmade";
import { Hero } from "./sections/hero";
import { Stories } from "./sections/stories";
import { Looks } from "./sections/looks";
import { Marquee } from "./sections/marquee";
import { Find } from "./sections/find";
import { Styles } from "./sections/styles";
import { Reviews } from "./sections/reviews";
import { Collab } from "./sections/collab";
import { TryOn } from "./sections/try-on";

export function HomeLanding() {
  return (
    <>
      <Hero />
      <Marquee />
      <Find />
      <Looks />
      <Categories />
      <TryOn />
      <Atelier />
      <Handmade />
      <Styles />
      <Reviews />
      <Collab />
      <Stories />
    </>
  );
}
