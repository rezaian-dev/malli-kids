import {
  Atelier,
  Categories,
  Handmade,
  Hero,
  Stories,
  Looks,
  Marquee,
  Find,
  Styles,
  Reviews,
  Collab,
  TryOn,
} from "./sections";

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
