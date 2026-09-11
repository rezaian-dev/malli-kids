import { Suspense } from "react";
import { Reveal } from "@/components/motion";
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
      {/* ⚡ Hero بدون انیمیشن ورود رندر می‌شود تا با رفرش، یک‌ضرب و بدون فلش دیده شود. */}
      <Hero />
      <Reveal>
        <Marquee />
      </Reveal>
      <Reveal>
        <Find />
      </Reveal>
      <Reveal>
        <Looks />
      </Reveal>
      <Reveal>
        <Categories />
      </Reveal>
      {/* 🧊 Own Suspense boundary: its `cookies()` read + product lookup
          shouldn't hold up the rest of an otherwise-static-shaped homepage,
          and it renders nothing for most first-time visitors anyway. */}
      <Reveal>
        <Suspense fallback={null}>
          <RecentlyViewed />
        </Suspense>
      </Reveal>
      <Reveal>
        <TryOn />
      </Reveal>
      <Reveal>
        <Atelier />
      </Reveal>
      <Reveal>
        <Handmade />
      </Reveal>
      <Reveal>
        <Styles />
      </Reveal>
      <Reveal>
        <Reviews />
      </Reveal>
      <Reveal>
        <Collab />
      </Reveal>
      <Reveal>
        <Stories />
      </Reveal>
    </>
  );
}
