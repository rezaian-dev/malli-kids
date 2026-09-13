import "server-only";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { mobile, otpCode, strongPassword } from "@/lib/forms";
import { rateLimit } from "@/lib/rate-limit";
import { redisUnavailable } from "@/lib/redis";
import { completeSignUpSchema, OTP_LEN, OTP_RESEND_SECONDS } from "./schemas";

const phoneSchema = mobile();
const codeSchema = otpCode(OTP_LEN);
const passwordSchema = strongPassword();

function invalidInput(message: string, field: string): never {
  throw new APIError("BAD_REQUEST", {
    code: "INVALID_AUTH_INPUT",
    message,
    field,
  });
}

/** Enforce phone ownership and rate limits on actions and direct API requests. */
export function createPhonePolicy(
  consumeOTP: (body: { phoneNumber: string; code: string }) => Promise<void>,
  ensurePhoneIndex: () => Promise<unknown>,
) {
  return createAuthMiddleware(async (ctx) => {
    const path = ctx.path;
    if (
      path === "/update-user" &&
      ctx.body &&
      typeof ctx.body === "object" &&
      ("phoneNumber" in ctx.body || "phoneNumberVerified" in ctx.body)
    ) {
      throw new APIError("BAD_REQUEST", {
        code: "PHONE_NUMBER_CANNOT_BE_UPDATED",
        message: "شمارهٔ بازیابی را فقط با کد پیامکی می‌توانید تغییر دهید.",
      });
    }

    const signup = path === "/sign-up/email";
    const phoneRoute =
      path?.startsWith("/phone-number/") || path === "/sign-in/phone-number";
    if (!signup && !phoneRoute) return;

    const parsedPhone = phoneSchema.safeParse(ctx.body?.phoneNumber);
    if (!parsedPhone.success) invalidInput(parsedPhone.error.issues[0].message, "phone");
    const phone = parsedPhone.data;
    // Hooks see the canonical representation before lookup, verification and storage.
    ctx.body = { ...ctx.body, phoneNumber: phone };

    const sending =
      path === "/phone-number/send-otp" ||
      path === "/phone-number/request-password-reset";
    const resetting = path === "/phone-number/reset-password";
    const verifying = signup || path === "/phone-number/verify" || resetting;

    if (sending) {
      const purpose = path === "/phone-number/request-password-reset" ? "reset" : "otp";
      const limit = await rateLimit(`auth-sms:${purpose}:${phone}`, {
        windowMs: OTP_RESEND_SECONDS * 1000,
        max: 1,
      });
      if (!limit.ok) {
        if (limit.reason === "unavailable") throw redisUnavailable();
        throw new APIError(
          "TOO_MANY_REQUESTS",
          {
            code: "SMS_COOLDOWN",
            message: "برای ارسال دوبارهٔ کد کمی صبر کنید.",
            retryAfterSec: limit.retryAfterSec,
          },
          { "Retry-After": String(limit.retryAfterSec) },
        );
      }
      const identifier = purpose === "reset" ? `${phone}-request-password-reset` : phone;
      // Resending revokes every previous code for the same purpose.
      await ctx.context.internalAdapter.deleteVerificationByIdentifier(identifier);
    }

    if (verifying) {
      const limit = await rateLimit(
        `auth-code-attempt:${resetting ? "reset" : "otp"}:${phone}`,
        {
          windowMs: 600_000,
          max: 10,
        },
      );
      if (!limit.ok && limit.reason === "unavailable") throw redisUnavailable();
      if (!limit.ok)
        throw new APIError("TOO_MANY_REQUESTS", {
          code: "TOO_MANY_ATTEMPTS",
          message: "تعداد تلاش‌ها زیاد بود؛ کمی بعد دوباره کد بگیرید.",
        });
      const parsedCode = codeSchema.safeParse(resetting ? ctx.body.otp : ctx.body.code);
      if (!parsedCode.success) invalidInput(parsedCode.error.issues[0].message, "code");
      ctx.body[resetting ? "otp" : "code"] = parsedCode.data;
    }

    if (resetting) {
      const parsed = passwordSchema.safeParse(ctx.body.newPassword);
      if (!parsed.success) invalidInput(parsed.error.issues[0].message, "password");
      ctx.body.newPassword = parsed.data;
    }

    if (path === "/phone-number/request-password-reset" || resetting) {
      const user = await ctx.context.adapter.findOne<{
        phoneNumberVerified?: boolean;
      }>({
        model: "user",
        where: [{ field: "phoneNumber", value: phone }],
      });
      // Only verified identity numbers may recover accounts; acknowledge others generically.
      if (user && !user.phoneNumberVerified) {
        if (!resetting) return ctx.json({ status: true });
        throw new APIError("BAD_REQUEST", {
          code: "INVALID_OTP",
          message: "کد نامعتبر است.",
        });
      }
    }

    if (signup || path === "/phone-number/verify") await ensurePhoneIndex();
    if (!signup) return { context: { body: ctx.body } };

    const parsed = completeSignUpSchema.safeParse({ ...ctx.body, phone });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      invalidInput(issue.message, String(issue.path[0] ?? "root"));
    }
    const existingPhone = await ctx.context.adapter.findOne({
      model: "user",
      where: [{ field: "phoneNumber", value: phone }],
    });
    if (existingPhone)
      throw new APIError("BAD_REQUEST", {
        code: "PHONE_NUMBER_EXIST",
        message: "این شماره قبلاً به حسابی دیگر متصل است.",
      });
    const existingEmail = await ctx.context.internalAdapter.findUserByEmail(
      parsed.data.email.toLowerCase(),
    );
    if (existingEmail)
      throw new APIError("BAD_REQUEST", {
        code: "USER_ALREADY_EXISTS",
        message: "حسابی با این ایمیل قبلاً ساخته شده است.",
      });
    // Consume OTP proof atomically without creating an account or session.
    await consumeOTP({ phoneNumber: phone, code: parsed.data.code });
    ctx.body = {
      ...ctx.body,
      name: parsed.data.name,
      email: parsed.data.email.toLowerCase(),
    };
    return { context: { body: ctx.body } };
  });
}
