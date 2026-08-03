// ✉️ The one email template auth sends today. A single function per
// template keeps `sendEmail` itself template-agnostic (see `@/lib/email`).
export function resetPasswordEmail(name: string, url: string) {
  return {
    subject: "بازنشانی رمز عبور — ملی‌کیدز",
    html: `
      <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#0e2a47">
        <p style="font-size:11px;letter-spacing:.2em;font-weight:900;color:#c19357">MALLI KIDS</p>
        <h1 style="font-size:18px;margin:16px 0 8px">سلام ${name || "کاربر"} 👋</h1>
        <p style="font-size:14px;line-height:1.8;color:#0e2a4799">
          درخواستِ بازنشانیِ رمز عبور برای حساب شما ثبت شد. برای تعیینِ رمزِ جدید روی دکمهٔ زیر بزنید؛
          این لینک تا یک ساعت دیگر معتبر است.
        </p>
        <a href="${url}" style="display:inline-block;margin:20px 0;padding:12px 28px;border-radius:999px;background:#0e2a47;color:#fff8ec;font-weight:900;font-size:13px;text-decoration:none">
          تعیینِ رمزِ جدید
        </a>
        <p style="font-size:12px;line-height:1.8;color:#0e2a4766">
          اگر این درخواست از طرف شما نبوده، همین ایمیل را نادیده بگیرید — رمزِ فعلیِ شما تغییری نمی‌کند.
        </p>
      </div>
    `,
  };
}
