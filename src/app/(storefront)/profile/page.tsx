import { ProfileView } from "@/features/profile/components/profile-view";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "پنل کاربری",
  description: "سفارش‌ها، علاقه‌مندی‌ها و حساب کاربری.",
  path: "/profile",
  noIndex: true,
});

export default function ProfilePage() {
  return <ProfileView />;
}
