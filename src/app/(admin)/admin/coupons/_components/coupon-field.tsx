import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/** 🏷️ A labeled input + inline error, used across the new-coupon form. */
export function CouponField({
  id,
  label,
  value,
  onChange,
  error,
  className,
  ...props
}: Omit<ComponentProps<typeof Input>, "value" | "onChange"> & {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label
        className="text-navy/70 dark:text-wheat text-xs font-black"
        htmlFor={id}
      >
        {label}
      </label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        className={cn(
          "h-11 rounded-2xl bg-transparent px-4 text-sm",
          "border-navy/12",
          "dark:border-gold/20",
          className,
        )}
        {...props}
      />
      {error ? (
        <p role="alert" className="text-rose text-xs font-bold">
          {error}
        </p>
      ) : null}
    </div>
  );
}
