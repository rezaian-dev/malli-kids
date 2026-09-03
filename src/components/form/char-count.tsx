import { toFaDigits } from "@/lib/locale/fa";
import { cn } from "@/lib/utils";
import { COUNT_TEXT } from "./styles";

/** 🔢 The "N / max" (or "over by N") counter under a text/textarea field. */
export function CharCount({
  value,
  max,
  min,
}: {
  value: string;
  max: number;
  min?: number;
}) {
  const n = value.trim().length;
  const left = max - value.length;
  return (
    <p className={cn(COUNT_TEXT, "text-left")} aria-live="polite">
      {left < 0 ? (
        <span className="text-rose">
          {toFaDigits(Math.abs(left))} حرف اضافه است
        </span>
      ) : min && n < min ? (
        <span>{toFaDigits(min - n)} حرف تا اعتبارسنجی</span>
      ) : (
        <span>
          {toFaDigits(n)} / {toFaDigits(max)}
        </span>
      )}
    </p>
  );
}
