import { DesktopNav } from "./desktop-nav";

// 🧭 Keep the desktop nav stable after hydration. ✨
export function HeaderNavMount() {
  return <DesktopNav />;
}
