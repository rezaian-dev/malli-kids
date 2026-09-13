import "server-only";

const IPPANEL_ENDPOINT = "https://edge.ippanel.com/v1/api/send";
const SEND_TIMEOUT_MS = 8_000;

// Trim quotes and whitespace from environment values.
function readEnv(name: string): string {
  return (process.env[name] ?? "").trim().replace(/^["']|["']$/g, "");
}

function describeError(error: unknown): string {
  if (!(error instanceof Error)) return "unknown network error";
  return error.name === "AbortError" ? `timeout after ${SEND_TIMEOUT_MS}ms` : error.name;
}

// Some providers reject delivery inside an HTTP-200 JSON response.
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
    // Existing relays may return an empty body or plain OK.
    return true;
  }
}

async function sendRequest(
  provider: string,
  url: string,
  headers: Record<string, string>,
  body: unknown,
): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await response.text().catch(() => "");
    if (response.ok && deliveryAccepted(text)) return true;
    console.error(`[sendOTP] ${provider} rejected delivery (HTTP ${response.status})`);
  } catch (error) {
    console.error(`[sendOTP] ${provider} request failed: ${describeError(error)}`);
  } finally {
    clearTimeout(timer);
  }
  return false;
}

async function sendViaRelay(phone: string, code: string): Promise<boolean> {
  const secret = readEnv("SMS_RELAY_SECRET");
  if (!secret) {
    console.error("[sendOTP] SMS_RELAY_URL is set but SMS_RELAY_SECRET is missing");
    return false;
  }
  return sendRequest(
    "relay",
    readEnv("SMS_RELAY_URL"),
    { "x-relay-secret": secret },
    { phone, code },
  );
}

async function sendViaIppanel(phone: string, code: string): Promise<boolean> {
  const apiKey = readEnv("SMS_API_KEY");
  const fromNumber = readEnv("SMS_FROM_NUMBER");
  const patternCode = readEnv("SMS_PATTERN_CODE");
  const missing: string[] = [];
  if (!apiKey) missing.push("SMS_API_KEY");
  if (!fromNumber) missing.push("SMS_FROM_NUMBER");
  if (!patternCode) missing.push("SMS_PATTERN_CODE");
  if (missing.length) {
    console.error(`[sendOTP] missing env var(s): ${missing.join(", ")}`);
    return false;
  }
  return sendRequest(
    "IPPanel",
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
}

export async function sendOTP(phone: string, code: string): Promise<boolean> {
  return readEnv("SMS_RELAY_URL")
    ? sendViaRelay(phone, code)
    : sendViaIppanel(phone, code);
}
