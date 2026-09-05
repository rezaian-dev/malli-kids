import "server-only";
import { createTransport } from "nodemailer";

// 📧 Without SMTP_HOST set, logs to console instead — dev flows stay testable without real credentials.
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM } = process.env;

  if (!SMTP_HOST) {
    console.log(
      `\n📧 [dev email] to: ${to}\n   subject: ${subject}\n${html}\n`,
    );
    return;
  }

  const port = Number(SMTP_PORT) || 587;
  const transport = createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });

  await transport.sendMail({
    from: SMTP_FROM || SMTP_USER,
    to,
    subject,
    html,
  });
}
