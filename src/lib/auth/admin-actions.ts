"use server";

import { headers } from "next/headers";
import { adminAuth } from "@/lib/auth/admin-auth";
import { isAdminUser } from "@/lib/auth/admin";
import { buildUser } from "@/lib/auth/user";
import { authActionError, FALLBACK_ERROR } from "@/lib/auth/auth-errors";
import { signInSchema, type SignInValues } from "@/lib/auth/schemas";
import type { ActionResult } from "@/lib/action-result";
import type { User } from "@/types";

// Keep admin sessions separate and sign non-admin users back out.
export async function adminSignInAction(
  values: SignInValues,
): Promise<ActionResult<User>> {
  const parsed = signInSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: FALLBACK_ERROR };

  try {
    const { user } = await adminAuth.api.signInEmail({
      body: parsed.data,
      headers: await headers(),
    });

    if (!isAdminUser(user)) {
      await adminAuth.api.signOut({ headers: await headers() });
      return { ok: false, error: "این حساب دسترسی مدیریت ندارد." };
    }

    return { ok: true, data: await buildUser(user) };
  } catch (error) {
    return authActionError(error);
  }
}

// Clear only the admin session.
export async function adminSignOutAction(): Promise<ActionResult> {
  try {
    await adminAuth.api.signOut({ headers: await headers() });
    return { ok: true };
  } catch (error) {
    return authActionError(error);
  }
}
