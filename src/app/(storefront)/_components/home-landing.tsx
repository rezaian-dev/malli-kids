import { Suspense } from "react";
import { Atelier } from "./sections/atelier";
import { Categories } from "./sections/categories";
import { Handmade } from "./sections/handmade";
import { Hero } from "./sections/hero";
import { Stories } from "./sections/stories";
import { Looks } from "./sections/looks";
import { Marquee } from "./sections/marquee";
import { Find } from "./sections/find";
import { RecentlyViewed } from "./sections/recently-viewed";
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
      {/* 🧊 Own Suspense boundary: its `cookies()` read + product lookup
          shouldn't hold up the rest of an otherwise-static-shaped homepage,
          and it renders nothing for most first-time visitors anyway. */}
      <Suspense fallback={null}>
        <RecentlyViewed />
      </Suspense>
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
