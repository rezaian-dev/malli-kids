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
} from "@/features/home/sections";

export function Landing() {
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
