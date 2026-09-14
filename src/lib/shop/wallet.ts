import "server-only";
import { connectMongoose } from "@/lib/db/mongoose";
import { OrderModel } from "@/lib/db/models/order";
import { faDateTime } from "@/lib/locale/fa";
import type { WalletOverview } from "@/types";

const PAGE_SIZE = 12;

// Immutable refund snapshots are the ledger; cancellation credits them atomically.
export async function getWalletOverview(
  userId: string,
  page = 1,
): Promise<WalletOverview> {
  await connectMongoose();
  const [result] = await OrderModel.aggregate<{
    totals: { balance: number; count: number; invalid: number }[];
    entries: {
      _id: { toString(): string };
      orderId: string;
      amount: number;
      createdAt: Date;
      reference: string;
    }[];
  }>([
    { $match: { userId, walletRefund: { $exists: true } } },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              balance: { $sum: "$walletRefund.amount" },
              count: { $sum: 1 },
              invalid: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $isNumber: "$walletRefund.amount" },
                        { $gt: ["$walletRefund.amount", 0] },
                        {
                          $eq: [
                            "$walletRefund.amount",
                            { $trunc: "$walletRefund.amount" },
                          ],
                        },
                        { $eq: [{ $type: "$payment.confirmedAt" }, "date"] },
                        { $in: ["$payment.method", ["manual", "gateway"]] },
                        { $ne: [{ $ifNull: ["$payment.id", ""] }, ""] },
                        { $ne: [{ $ifNull: ["$payment.confirmedBy", ""] }, ""] },
                        { $ne: [{ $ifNull: ["$payment.reference", ""] }, ""] },
                        { $eq: ["$walletRefund.amount", "$payment.amount"] },
                        { $eq: ["$walletRefund.amount", "$total"] },
                        { $eq: ["$status", "لغوشده"] },
                        { $eq: ["$pay", "بازگشت به کیف پول"] },
                      ],
                    },
                    0,
                    1,
                  ],
                },
              },
            },
          },
        ],
        entries: [
          { $sort: { "walletRefund.createdAt": -1, _id: -1 } },
          { $skip: (page - 1) * PAGE_SIZE },
          { $limit: PAGE_SIZE + 1 },
          {
            $project: {
              orderId: "$id",
              amount: "$walletRefund.amount",
              createdAt: "$walletRefund.createdAt",
              reference: "$walletRefund.reference",
            },
          },
        ],
      },
    },
  ]).option({ maxTimeMS: 5000 });
  const { balance = 0, count = 0, invalid = 0 } = result?.totals[0] ?? {};
  if (
    invalid > 0 ||
    !Number.isSafeInteger(balance) ||
    balance < 0 ||
    (count > 0 && balance === 0)
  ) {
    throw new Error("Invalid wallet ledger balance");
  }
  const entries = result?.entries ?? [];
  return {
    ownerId: userId,
    balance,
    count,
    page,
    hasMore: entries.length > PAGE_SIZE,
    entries: entries.slice(0, PAGE_SIZE).map((entry) => ({
      id: entry._id.toString(),
      orderId: entry.orderId,
      amount: entry.amount,
      date: faDateTime(entry.createdAt),
      reference: entry.reference,
    })),
  };
}
