"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import {
  motion,
  MotionConfig,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Easing,
  type HTMLMotionProps,
  type Variants,
} from "motion/react";
import { cn } from "@/lib/utils";

// 🎬 یک easing واحد در سراسر سایت — همان منحنی نرمِ استایل‌های موجود
// (cubic-bezier(0.22, 1, 0.32, 1)) تا انیمیشن‌ها با حسِ قبلیِ برند یکی باشند.
export const EASE_OUT: Easing = [0.22, 1, 0.32, 1];

// 👁️ فقط وقتی عنصر به دید کاربر می‌رسد (و فقط یک‌بار) اجرا می‌شود؛
// ۸۰ پیکسل پایین‌تر از لبه، کمی زودتر فعال می‌شود تا کاربر انیمیشن را حس کند.
const VIEWPORT = { once: true, margin: "0px 0px -80px 0px" } as const;

type RevealProps = HTMLMotionProps<"div"> & {
  /** تأخیر شروع (ثانیه) */
  delay?: number;
  /** جابه‌جایی عمودی اولیه (پیکسل) */
  y?: number;
};

/** 🪶 ورود نرم «محو + بالا آمدن» هنگام اسکرول به دید کاربر. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 22,
  ...rest
}: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.55, delay, ease: EASE_OUT }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** 👁️ فقط محو شدن (بدون جابه‌جایی) — برای جاهایی که transform با CSS تداخل دارد. */
export function FadeIn({
  children,
  className,
  delay = 0,
  ...rest
}: HTMLMotionProps<"div"> & { delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={VIEWPORT}
      transition={{ duration: 0.7, delay, ease: EASE_OUT }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

// 🎼 آبشاری (stagger): پدر با `Stagger` و هر فرزند با `StaggerItem` بسته می‌شود.
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export function Stagger({
  children,
  className,
  ...rest
}: HTMLMotionProps<"div">) {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  ...rest
}: HTMLMotionProps<"div">) {
  return (
    <motion.div className={className} variants={staggerItem} {...rest}>
      {children}
    </motion.div>
  );
}

/** 🧭 محو شدنِ لطیفِ محتوای هر صفحه هنگام جابه‌جایی بین مسیرها. */
export function PageReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

/** ♿ Provider سراسری: همه انیمیشن‌های motion به prefers-reduced-motion
 *  کاربر احترام می‌گذارند. چون layout ریشه سمت سرور است، MotionConfig
 *  باید داخل یک کلاینت‌کامپوننت قرار بگیرد. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

/** 🧢 ورود سربرگ: یک‌بار هنگام بارگذاری اولیه از بالا سُر می‌خورد پایین. */
export function HeaderEnter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ y: -14, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  );
}

const TILT_SPRING = { stiffness: 300, damping: 22, mass: 0.6 } as const;

/** 🪄 کارتی که با موس «سه‌بعدی» کج می‌شود و یک هایلایتِ نوری دنبالِ نشانگر
 *  می‌سُرد — دقیقاً روی مسیر حرکتِ ماوس، نه صرفاً یک فِیدِ ساده. فقط روی
 *  دستگاه‌های ماوس‌دار فعال می‌شود (لمسی/تاچ دست‌نخورده می‌ماند) و به
 *  prefers-reduced-motion هم احترام می‌گذارد. */
export function TiltCard({
  children,
  className,
  strength = 9,
  glare = true,
}: {
  children: React.ReactNode;
  className?: string;
  /** بیشینه‌ی زاویه‌ی کج‌شدن (درجه). */
  strength?: number;
  glare?: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  // 0..1 نسبیِ محل نشانگر روی کارت — نقطه‌ی شروع وسطِ کارت است.
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
