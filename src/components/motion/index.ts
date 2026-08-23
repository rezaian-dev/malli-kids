// 🪶 Static (zero-JS) wrappers — server-safe, import directly from
// `@/components/motion/static` in server components to avoid pulling the
// client `motion/react` bundle through this barrel.
export {
  Reveal,
  FadeIn,
  Stagger,
  StaggerItem,
  PageReveal,
  HeaderEnter,
} from "./static";
// 🎬 Interactive springs — client-only (`motion/react`).
export {
  EASE_OUT,
  staggerContainer,
  staggerItem,
  MotionProvider,
  TiltCard,
  MagneticGlow,
} from "./primitives";
