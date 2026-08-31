import { ProfileView } from "./_components/profile-view";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "پنل کاربری",
  description: "سفارش‌ها، علاقه‌مندی‌ها و اطلاعات حساب کاربری شما در ملی کیدز.",
  path: "/profile",
  noIndex: true,
});

export default function ProfilePage() {
  return <ProfileView />;
}
