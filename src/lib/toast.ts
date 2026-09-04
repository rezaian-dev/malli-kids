import { toast as sonner, type ExternalToast } from "sonner";

// 🎯 One smart notify surface instead of raw `sonner` imports scattered
// across the app: same call shape (`toast(msg)`, `toast.success(msg, opts)`,
// …) so this is a drop-in for `import { toast } from "sonner"`, but every
// severity is pre-routed to the corner it reads best at — call sites never
// think about `position` themselves.
//
// Errors/warnings interrupt where the eye already is → top-center.
// Everything ambient (success/info/loading/default) confirms quietly at the
// RTL leading corner, next to where most actions live → bottom-right.
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
