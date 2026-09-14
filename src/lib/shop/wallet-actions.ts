"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import {
  isServiceUnavailable,
  serviceUnavailable,
  type ActionResult,
} from "@/lib/action-result";
import type { WalletOverview } from "@/types";
import { getWalletOverview } from "./wallet";

const pageSchema = z.number().int().min(1).max(10_000);

export async function getWalletAction(page = 1): Promise<ActionResult<WalletOverview>> {
  const parsed = pageSchema.safeParse(page);
  if (!parsed.success) return { ok: false, error: "شماره صفحه معتبر نیست." };
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
      query: { disableCookieCache: true },
    });
    if (!session) return { ok: false, error: "برای دیدن کیف پول وارد حساب خود شوید." };
    return {
      ok: true,
      data: {
        ...(await getWalletOverview(session.user.id, parsed.data)),
        ownerEmail: session.user.email,
      },
    };
  } catch (error) {
    return isServiceUnavailable(error)
      ? serviceUnavailable()
      : {
          ok: false,
          error: "دریافت موجودی کیف پول انجام نشد؛ لطفاً دوباره تلاش کنید.",
        };
  }
}
