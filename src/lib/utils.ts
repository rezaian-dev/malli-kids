import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Tailwind container + فاصلهٔ استاندارد صفحات */
export const shell = "container mx-auto w-full px-3 xs:px-4 sm:px-5 lg:px-7"
