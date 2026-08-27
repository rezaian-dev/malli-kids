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
      <Stories />
    </>
  );
}
