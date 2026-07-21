import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const shell = "mx-auto w-full max-w-7xl px-3 xs:px-4 sm:px-5 lg:px-7";
