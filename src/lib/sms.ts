import "server-only";

// 📱 SMS provider — OTP delivery (relay-aware).
// 🐛 Vercel-only failure: edge.ippanel.com (behind Cloudflare) rejects non-Iran datacenter IPs
//    (Vercel = AWS/US) → 502; works from an Iran IP. Fix: forward the send through a relay inside Iran.
// 🔀 Routing: SMS_RELAY_URL set → POST to the relay (production); else call IPPanel directly (local dev).

const IPPANEL_ENDPOINT = "https://edge.ippanel.com/v1/api/send";
const SEND_TIMEOUT_MS = 8_000; // ⏱️ fail fast — stay well under Vercel's function limit

// 🧼 Vercel stores env values verbatim — a value pasted from a local .env can arrive wrapped in
//    quotes/whitespace and corrupt a header. Normalise defensively. 🛡️
function readEnv(name: string): string {
  return (process.env[name] ?? "").trim().replace(/^["']|["']$/g, "");
}

// 🧾 Turn any thrown error into a short, log-friendly reason
function describeErr(err: unknown): string {
  if (err instanceof Error) {
    return err.name === "AbortError"
      ? `timeout after ${SEND_TIMEOUT_MS}ms (upstream unreachable from deploy region?)`
      : err.name;
  }
  return "unknown network error";
}

// ⏱️ Shared POST-JSON with an abort timeout so a hung upstream never stalls
//    the serverless function.
async function postJSON(
  url: string,
  headers: Record<string, string>,
  body: unknown,
): Promise<{ ok: boolean; status: number; text: string }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await res.text().catch(() => "");
    return { ok: res.ok, status: res.status, text };
  } finally {
    clearTimeout(timer);
  }
}

// Some providers report a rejected delivery inside an HTTP-200 JSON envelope.
function deliveryAccepted(text: string): boolean {
  try {
    const body = JSON.parse(text) as {
      ok?: boolean;
      success?: boolean;
      status?: boolean;
      meta?: { status?: boolean };
    };
    return (
      body?.ok !== false &&
      body?.success !== false &&
      body?.status !== false &&
      body?.meta?.status !== false
    );
  } catch {
    // Existing relays may reply with an empty body or plain "OK".
    return true;
  }
}

// 🇮🇷 Preferred path — forward {phone, code} to a relay running on an Iran IP.
//    IPPanel credentials live on the relay, never on Vercel.
async function sendViaRelay(phone: string, code: string): Promise<boolean> {
  const relayUrl = readEnv("SMS_RELAY_URL");
  const relaySecret = readEnv("SMS_RELAY_SECRET");
  if (!relaySecret) {
    console.error(
      "[sendOTP] SMS_RELAY_URL is set but SMS_RELAY_SECRET is missing",
    );
    return false;
  }
  try {
    const { ok, status, text } = await postJSON(
      relayUrl,
      { "x-relay-secret": relaySecret },
      { phone, code },
    );
    if (!ok || !deliveryAccepted(text)) {
      console.error(`[sendOTP] relay rejected delivery (HTTP ${status})`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[sendOTP] relay request failed → ${describeErr(err)}`);
    return false;
  }
}

// 🌐 Fallback path — call IPPanel directly. Works only from an Iran IP; from a
//    foreign deploy region it yields the Cloudflare 502 described above.
async function sendViaIppanel(phone: string, code: string): Promise<boolean> {
  const apiKey = readEnv("SMS_API_KEY");
  const fromNumber = readEnv("SMS_FROM_NUMBER");
  const patternCode = readEnv("SMS_PATTERN_CODE");

  const missing: string[] = [];
  if (!apiKey) missing.push("SMS_API_KEY");
  if (!fromNumber) missing.push("SMS_FROM_NUMBER");
  if (!patternCode) missing.push("SMS_PATTERN_CODE");
  if (missing.length > 0) {
    console.error(`[sendOTP] missing env var(s): ${missing.join(", ")}`);
    return false;
  }

  try {
    const { ok, status, text } = await postJSON(
      IPPANEL_ENDPOINT,
      { Authorization: apiKey },
      {
        sending_type: "pattern",
        from_number: fromNumber,
        code: patternCode,
        recipients: [phone],
        params: { code },
      },
    );
    if (!ok || !deliveryAccepted(text)) {
      // 🔎 502 + Cloudflare body → IPPanel geo-blocks this IP → configure a relay
      console.error(`[sendOTP] IPPanel rejected delivery (HTTP ${status})`);
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[sendOTP] IPPanel request failed → ${describeErr(err)}`);
    return false;
  }
}

// 📨 Public API — unchanged boolean contract (callers untouched). Routes through
//    the Iran relay when one is configured, otherwise hits IPPanel directly.
export const sendOTP = async (
  phone: string,
  code: string,
): Promise<boolean> => {
  return readEnv("SMS_RELAY_URL")
    ? sendViaRelay(phone, code)
    : sendViaIppanel(phone, code);
};
