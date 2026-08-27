import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * پوستهٔ استاندارد صفحه: عرض کامل تا سقف ۸۰rem، وسط‌چین، با فاصلهٔ پلکانی.
 *
 * عمداً از کلاس `container` تیلویند استفاده نمی‌کنیم: چون بریک‌پوینت سفارشی
 * `xs = 20rem` تعریف شده، `container` از ۳۲۰px به بعد عرض را روی همان ۳۲۰px
 * قفل می‌کرد و کل صفحه در موبایل باریک و کج می‌شد.
 */
export const shell = "mx-auto w-full max-w-7xl px-3 xs:px-4 sm:px-5 lg:px-7"
