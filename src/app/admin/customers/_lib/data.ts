import { headers } from "next/headers";
import { adminAuth } from "@/lib/auth/admin-auth";
import { splitName } from "@/lib/auth/user";
import { connectMongoose } from "@/lib/db/mongoose";
import { Profile } from "@/lib/db/models/profile";
import { OrderModel } from "@/lib/db/models/order";
import { faDate } from "@/lib/locale/fa";
import type { AdminCustomer } from "@/types";

// Better Auth users + Profile + order aggregation — no separate customers model
export async function getAllCustomers(): Promise<AdminCustomer[]> {
  // `adminAuth`, not the storefront `auth` — see admin-auth.ts.
  const { users } = await adminAuth.api.listUsers({
    headers: await headers(),
    query: { limit: 500, sortBy: "createdAt", sortDirection: "desc" },
  });

  await connectMongoose();
  const userIds = users.map((user) => user.id);
  const [profiles, spendByUser] = await Promise.all([
    Profile.find({ userId: { $in: userIds } }).lean(),
    OrderModel.aggregate<{ _id: string; orders: number; spent: number }>([
      { $match: { userId: { $in: userIds } } },
      {
        $group: {
          _id: "$userId",
          orders: { $sum: 1 },
          spent: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$pay", "پرداخت‌شده"] },
                    { $ne: ["$status", "لغوشده"] },
                    { $ne: ["$status", "مرجوعی"] },
                    { $ne: [{ $type: "$payment.confirmedAt" }, "missing"] },
                    { $eq: ["$payment.amount", "$total"] },
                  ],
                },
                "$total",
                0,
              ],
            },
          },
        },
      },
    ]),
  ]);

  const profileByUser = new Map(profiles.map((p) => [p.userId, p]));
  const statsByUser = new Map(spendByUser.map((s) => [s._id, s]));

  return users.map((user): AdminCustomer => {
    const profile = profileByUser.get(user.id);
    const stats = statsByUser.get(user.id);
    const { firstName, lastName } = splitName(user.name);

    return {
      id: user.id,
      firstName,
      lastName: lastName ?? "",
      phone: profile?.phone ?? "",
      email: user.email,
      city: profile?.city ?? "",
      orders: stats?.orders ?? 0,
      spent: stats?.spent ?? 0,
      childName: profile?.childName,
      avatar: profile?.avatar,
      joined: faDate(user.createdAt),
      role: user.role === "admin" ? "admin" : "user",
      status: user.banned ? "مسدود" : "فعال",
    };
  });
}
