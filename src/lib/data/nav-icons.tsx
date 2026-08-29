import type { ComponentType } from "react";
import {
  Baby,
  Briefcase,
  Crown,
  Gem,
  HandHeart,
  Handshake,
  HelpCircle,
  Info,
  LayoutGrid,
  Phone,
  ScanFace,
  Shirt,
  Sparkles,
} from "lucide-react";

/** نگاشت نامِ آیکون در دادهٔ ناوبری به کامپوننت lucide. */
export const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  crown: Crown,
  shirt: Shirt,
  baby: Baby,
  briefcase: Briefcase,
  gem: Gem,
  "hand-heart": HandHeart,
  handshake: Handshake,
  "layout-grid": LayoutGrid,
  sparkles: Sparkles,
  "scan-face": ScanFace,
  "help-circle": HelpCircle,
  info: Info,
  phone: Phone,
};

/** همیشه یک کامپوننت معتبر برمی‌گرداند. */
export function navIcon(name?: string): ComponentType<{ className?: string }> {
  return (name && ICONS[name]) || Sparkles;
}
