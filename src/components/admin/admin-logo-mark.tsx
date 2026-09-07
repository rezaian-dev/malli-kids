import Image from "next/image";

/**
 * 🏷️ The "MALLI / <tagline>" mark shared by the admin shell's sidebar and
 * the `/admin/login` screen.
 *
 * ⚠️ Keep the mark's box size and the logo's own padding constant across
 * light/dark — only the box's *background* may change. An earlier version
 * of the login screen dropped the padding and background in dark mode
 * (`dark:bg-transparent dark:p-0`), which left the glyph filling the whole
 * box and reading visibly bigger in dark mode than in light mode.
 */
export function AdminLogoMark({ tagline }: { tagline: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-2xl ring-1 bg-navy ring-gold/25 shadow-[0_12px_28px_-14px_rgba(4,20,39,.8)] dark:bg-white/8">
        <Image
          src="/brand/logo-white.png"
          alt="ملی کیدز"
          width={42}
          height={42}
          className="size-10 object-contain p-1.5"
        />
        <span className="absolute inset-x-2 bottom-0 h-px via-gold bg-linear-to-r from-transparent to-transparent" />
      </span>
      <div className="min-w-0 leading-none">
        <p className="font-display text-sm font-bold tracking-[0.2em] text-navy dark:text-ivory">
          MALLI
        </p>
        <p className="text-gold mt-1.5 text-[9px] font-black tracking-[0.29em]">
          {tagline}
        </p>
      </div>
    </div>
  );
}
