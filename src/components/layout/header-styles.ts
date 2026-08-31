import { cn } from "@/lib/utils";

export const NAV_LINK = cn(
  "group/nav relative flex-row items-center gap-1 whitespace-nowrap rounded-full px-2 py-2 text-[11px] font-medium",
  "transition-[color,background-color,transform,box-shadow] duration-300 ease-out",
  "hover:-translate-y-0.5 hover:shadow-[0_10px_20px_-14px_rgba(193,147,87,.9)]",
  "active:translate-y-0 active:scale-[0.97]",
  "[&_svg]:transition-transform [&_svg]:duration-300 hover:[&_svg]:-translate-y-0.5",
  "after:pointer-events-none after:absolute after:inset-x-2.5 after:-bottom-0.5 after:h-0.5 after:origin-right after:scale-x-0 after:rounded-full after:bg-gold/70 after:transition-transform after:duration-300 after:ease-out",
  "hover:after:origin-left hover:after:scale-x-100 data-[active=true]:after:scale-x-100",
  "text-navy/80 hover:bg-gold/10 hover:text-gold focus:bg-gold/10 focus:text-gold",
  "data-[active=true]:bg-gold data-[active=true]:text-navy-deep data-[active=true]:hover:bg-gold data-[active=true]:hover:text-navy-deep",
  "lg:gap-1.5 lg:px-3 lg:text-sm xl:px-4",
  "dark:text-ivory dark:hover:bg-gold/15 dark:hover:text-gold-light dark:focus:bg-gold/15 dark:focus:text-gold-light",
  "dark:data-[active=true]:bg-gold dark:data-[active=true]:text-navy-deep dark:data-[active=true]:hover:text-navy-deep",
);

export const CLUSTER_H = "h-9 min-[360px]:h-10 md:h-9 lg:h-10";

export const ICON_W = "w-9 min-[360px]:w-10 md:w-9 lg:w-10";

export const ICON_BTN = cn(
  CLUSTER_H,
  ICON_W,
  "shrink-0 rounded-full text-navy hover:bg-gold/12 hover:text-gold",
  "focus-visible:ring-2 focus-visible:ring-gold/60",
  "dark:text-gold-soft dark:hover:bg-gold/20 dark:hover:text-gold-light",
);

export const PANEL = cn(
  "z-[90] flex flex-col gap-0 border-navy/10 bg-cream p-0",
  "dark:border-gold/20 dark:bg-navy-deep",
  
  
  
  
  "duration-400 ease-[cubic-bezier(0.22,1,0.32,1)]",
  "data-open:animate-in data-closed:animate-out",
  "data-open:fade-in-0 data-open:blur-in-4 data-closed:fade-out-0",
  "data-[slot=sheet-content]:data-[side=left]:data-open:slide-in-from-left-full",
  "data-[slot=sheet-content]:data-[side=left]:data-closed:slide-out-to-left-full",
  "data-[slot=sheet-content]:data-[side=right]:data-open:slide-in-from-right-full",
  "data-[slot=sheet-content]:data-[side=right]:data-closed:slide-out-to-right-full",
);

export const PANEL_HEAD = cn(
  "gap-1 border-b border-navy/10 bg-linear-to-l from-navy to-navy-mid px-5 py-5",
  "dark:border-gold/20",
);
