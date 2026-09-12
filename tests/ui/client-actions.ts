import type { ActionResult } from "@/lib/action-result";
import type { User } from "@/types";
import type {
  CompleteSignUpValues,
  SignUpValues,
  SignInValues,
  OtpRequestValues,
  OtpVerifyValues,
  ResetPasswordValues,
} from "@/lib/auth/schemas";

// Browser-only test transport; every request executes the REAL server action.
async function call<T = undefined>(
  name: string,
  values: unknown = {},
): Promise<ActionResult<T>> {
  const response = await fetch(`/__actions/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  if (!response.ok) throw new Error("Test action transport failed");
  return response.json();
}
export const signInAction = (values: SignInValues) =>
  call<User>("signInAction", values);
export const signUpAction = (values: CompleteSignUpValues) =>
  call<User>("signUpAction", values);
export const signOutAction = () => call("signOutAction");
export const requestSignUpOtpAction = (values: SignUpValues) =>
  call("requestSignUpOtpAction", values);
export const requestOtpAction = (values: OtpRequestValues) =>
  call("requestOtpAction", values);
export const forgotPasswordAction = (values: OtpRequestValues) =>
  call("forgotPasswordAction", values);
export const verifyOtpAction = (values: OtpVerifyValues & { phone: string }) =>
  call<User>("verifyOtpAction", values);
export const resetPasswordAction = (
  values: ResetPasswordValues & { phone: string },
) => call("resetPasswordAction", values);
export const requestRecoveryPhoneAction = (values: OtpRequestValues) =>
  call("requestRecoveryPhoneAction", values);
export const verifyRecoveryPhoneAction = (
  values: OtpVerifyValues & { phone: string },
) => call<User>("verifyRecoveryPhoneAction", values);
