import type { Metadata } from "next";
import { Profile } from "./profile";

export const metadata: Metadata = {
  title: "پنل کاربری",
  description: "سفارش‌ها، علاقه‌مندی‌ها و اطلاعات حساب کاربری شما در مالی کیدز.",
};


export default function ProfilePage() {
  return <Profile />;
}
