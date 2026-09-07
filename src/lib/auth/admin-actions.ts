"use server";

import { headers } from "next/headers";
import { adminAuth } from "@/lib/auth/admin-auth";
import { isAdminUser } from "@/lib/auth/admin";
import { buildUser } from "@/lib/auth/user";
import { authActionError, FALLBACK_ERROR } from "@/lib/auth/auth-errors";
import { signInSchema, type SignInValues } from "@/lib/auth/schemas";
import type { ActionResult } from "@/lib/action-result";
import type { User } from "@/types";

// 🔒 Signs in against the admin-only session (`adminAuth`) — entirely
// separate from `signInAction`'s storefront cookie. Non-admins are signed
// back out of this cookie immediately, so a stray customer login never
// leaves an admin-panel session behind.
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

// 👋 Clears only the admin cookie — the storefront session (if any, in the
// same browser) is left untouched.
export async function adminSignOutAction(): Promise<ActionResult> {
  try {
    await adminAuth.api.signOut({ headers: await headers() });
    return { ok: true };
  } catch (error) {
    return authActionError(error);
  }
}
