import { toast as sonner, type ExternalToast } from "sonner";

const AMBIENT: ExternalToast = { position: "bottom-right" };
const URGENT: ExternalToast = { position: "top-center" };

type Variant = keyof Pick<
  typeof sonner,
  "success" | "info" | "warning" | "error" | "loading" | "message"
>;

const at =
  (base: ExternalToast, variant?: Variant) =>
  (message: Parameters<typeof sonner>[0], opts?: ExternalToast) =>
    (variant ? sonner[variant] : sonner)(message, { ...base, ...opts });

export const toast = Object.assign(at(AMBIENT), {
  ...sonner,
  success: at(AMBIENT, "success"),
  info: at(AMBIENT, "info"),
  loading: at(AMBIENT, "loading"),
  message: at(AMBIENT, "message"),
  warning: at(URGENT, "warning"),
  error: at(URGENT, "error"),
});
