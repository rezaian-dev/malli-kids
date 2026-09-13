"use client";

import * as React from "react";
import {
  motion,
  MotionConfig,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Easing,
} from "motion/react";
import { cn } from "@/lib/utils";

// One easing curve site-wide, matching the brand's CSS
export const EASE_OUT: Easing = [0.22, 1, 0.32, 1];

// Keep interactive motion in this client module.
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

const TILT_SPRING = { stiffness: 300, damping: 22, mass: 0.6 } as const;

// Mouse-driven 3D tilt + tracking glare; pointer-only, reduced-motion safe
export function TiltCard({
  children,
  className,
  strength = 9,
  glare = true,
}: {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  glare?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const rotateX = useSpring(
    useTransform(py, [0, 1], [strength, -strength]),
    TILT_SPRING,
  );
  const rotateY = useSpring(
    useTransform(px, [0, 1], [-strength, strength]),
    TILT_SPRING,
  );
  const scale = useSpring(1, TILT_SPRING);
  const glareX = useTransform(px, (v) => `${v * 100}%`);
  const glareY = useTransform(py, (v) => `${v * 100}%`);
  const glareOpacity = useSpring(0, { stiffness: 300, damping: 30 });
  const glareBg = useMotionTemplate`radial-gradient(240px circle at ${glareX} ${glareY}, rgba(255,255,255,.5), transparent 65%)`;

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion || e.pointerType !== "mouse") return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }
  function onPointerEnter(e: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion || e.pointerType !== "mouse") return;
    scale.set(1.02);
    glareOpacity.set(1);
  }
  function onPointerLeave() {
    px.set(0.5);
    py.set(0.5);
    scale.set(1);
    glareOpacity.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      style={{ rotateX, rotateY, scale, transformPerspective: 900 }}
      className={cn("relative overflow-hidden", className)}
    >
      {children}
      {glare ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 mix-blend-overlay"
          style={{ background: glareBg, opacity: glareOpacity }}
        />
      ) : null}
    </motion.div>
  );
}

const MAGNETIC_SPRING = { stiffness: 220, damping: 16, mass: 0.4 } as const;

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

export function MagneticGlow({
  children,
  className,
  pull = 0.35,
  maxOffset = 14,
  glow = true,
}: {
  children: React.ReactNode;
  className?: string;
  pull?: number;
  maxOffset?: number;
  glow?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  const x = useSpring(0, MAGNETIC_SPRING);
  const y = useSpring(0, MAGNETIC_SPRING);
  const glowX = useMotionValue("50%");
  const glowY = useMotionValue("50%");
  const glowOpacity = useSpring(0, { stiffness: 300, damping: 30 });
  const glowBg = useMotionTemplate`radial-gradient(180px circle at ${glowX} ${glowY}, rgba(255,255,255,.55), transparent 70%)`;

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion || e.pointerType !== "mouse") return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const relX = e.clientX - rect.left - rect.width / 2;
    const relY = e.clientY - rect.top - rect.height / 2;
    x.set(clamp(relX * pull, -maxOffset, maxOffset));
    y.set(clamp(relY * pull, -maxOffset, maxOffset));
    glowX.set(`${((e.clientX - rect.left) / rect.width) * 100}%`);
    glowY.set(`${((e.clientY - rect.top) / rect.height) * 100}%`);
  }
  function onPointerEnter(e: React.PointerEvent<HTMLDivElement>) {
    if (reduceMotion || e.pointerType !== "mouse") return;
    glowOpacity.set(1);
  }
  function onPointerLeave() {
    x.set(0);
    y.set(0);
    glowOpacity.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      style={{ x, y }}
      className={cn("relative inline-flex", className)}
    >
      {children}
      {glow ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] mix-blend-overlay"
          style={{ background: glowBg, opacity: glowOpacity }}
        />
      ) : null}
    </motion.div>
  );
}
