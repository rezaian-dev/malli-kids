/** Light-only section canvases. Gradients live on ::before so dark
 *  never inherits a background-image (dark:bg-transparent cannot kill it). */
const layer =
  "relative before:pointer-events-none before:absolute before:inset-0 before:content-[''] after:pointer-events-none after:absolute after:inset-x-[10%] after:bottom-0 after:h-px after:content-[''] after:bg-linear-to-l after:from-transparent after:via-gold/28 after:to-transparent dark:before:hidden dark:after:hidden";

export const wash = {
  gold: `${layer} before:bg-[radial-gradient(120%_85%_at_8%_-12%,color-mix(in_srgb,var(--color-gold)_30%,transparent),transparent_56%),radial-gradient(90%_70%_at_100%_112%,color-mix(in_srgb,var(--color-navy)_11%,transparent),transparent_54%)]`,
  navy: `${layer} before:bg-[radial-gradient(110%_80%_at_96%_-10%,color-mix(in_srgb,var(--color-navy)_16%,transparent),transparent_55%),radial-gradient(80%_65%_at_0%_108%,color-mix(in_srgb,var(--color-gold)_18%,transparent),transparent_52%)]`,
  cream: `${layer} before:bg-[radial-gradient(100%_70%_at_50%_-8%,color-mix(in_srgb,var(--color-cream)_52%,transparent),transparent_60%),radial-gradient(75%_55%_at_88%_108%,color-mix(in_srgb,var(--color-gold)_14%,transparent),transparent_50%)]`,
  silk: `${layer} before:bg-[linear-gradient(122deg,color-mix(in_srgb,var(--color-navy)_9%,transparent)_0%,color-mix(in_srgb,var(--color-cream)_32%,transparent)_46%,color-mix(in_srgb,var(--color-gold)_16%,transparent)_100%)]`,
} as const;
