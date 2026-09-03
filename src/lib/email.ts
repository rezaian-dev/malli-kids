import "server-only";
import { createTransport } from "nodemailer";

/**
 * 📧 Sends transactional email over SMTP (`SMTP_HOST`/`PORT`/`USER`/`PASS` —
 * any provider: Gmail, a company mail server, ...). Without `SMTP_HOST` set,
 * the message is logged to the server console instead, so local/dev flows
 * (like "forgot password") stay testable without real credentials.
 */
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
