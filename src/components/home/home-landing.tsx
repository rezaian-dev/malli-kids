import type { CSSProperties } from "react";
import { Atelier, Categories, Collab, Find, Handmade, Hero, Looks, Marquee, Reviews, Stories, Styles, TryOn } from "@/components/home/sections";

const DEFERRED_SECTION_STYLE: CSSProperties = {
  contentVisibility: "auto",
  containIntrinsicSize: "900px",
};

export function HomeLanding() {
  return (
    <>
      <Hero />
      <Marquee />
      <div style={DEFERRED_SECTION_STYLE}>
        <Find />
      </div>
      <div style={DEFERRED_SECTION_STYLE}>
        <Looks />
      </div>
      <div style={DEFERRED_SECTION_STYLE}>
        <Categories />
      </div>
      <div style={DEFERRED_SECTION_STYLE}>
        <TryOn />
      </div>
      <div style={DEFERRED_SECTION_STYLE}>
        <Atelier />
      </div>
      <div style={DEFERRED_SECTION_STYLE}>
        <Handmade />
      </div>
      <div style={DEFERRED_SECTION_STYLE}>
        <Styles />
      </div>
      <div style={DEFERRED_SECTION_STYLE}>
        <Reviews />
      </div>
      <div style={DEFERRED_SECTION_STYLE}>
        <Collab />
      </div>
      <div style={DEFERRED_SECTION_STYLE}>
        <Stories />
      </div>
    </>
  );
}
