import type { Metadata } from "next";
import { ProfileView } from "./_components/profile-view";

export const metadata: Metadata = {
  title: "پنل کاربری",
  description: "سفارش‌ها، علاقه‌مندی‌ها و اطلاعات حساب کاربری شما در مالی کیدز.",
};


export default function ProfilePage() {
  return <ProfileView />;
}
