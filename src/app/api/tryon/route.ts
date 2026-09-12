import { NextRequest, NextResponse } from "next/server";
import { Client, handle_file } from "@gradio/client";
import { fal } from "@fal-ai/client";
import { auth } from "@/lib/auth/auth";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 120;

const AUTH_ERROR = "برای این کار باید وارد حساب‌تان باشید.";
const RATE_ERROR =
  "تعداد درخواست‌های پرو مجازی شما زیاد بوده؛ کمی بعد دوباره تلاش کنید.";

// 🔐 Every provider here costs real money or a shared free quota per call —
// require a real session (never trust a client-claimed id) and throttle it,
// instead of leaving the route open to anyone on the internet.
async function requireUserId(req: NextRequest) {
  try {
    // 🚫 A banned user's session throws (Better Auth's `admin()` plugin
    // hooks `/get-session` to reject it) rather than resolving to "no
    // session" — caught here so they get the same 401 as any signed-out
    // caller instead of this route 500ing on them.
    const session = await auth.api.getSession({ headers: req.headers });
    return session?.user.id ?? null;
  } catch {
    return null;
  }
}

/* ─── Engine selection ────────────────────────────────────────────
 * 🥇 `fal` (default when FAL_KEY exists): FASHN TryOn v1.6 served on fal's
 * infrastructure — the best-tested virtual try-on in 2026 benchmarks for
 * catalog work (garment text/patterns stay sharp, 864×1296). ~$0.075/img.
 * 🥈 `fashn`: the same v1.6 model via FASHN's own API. Same quality and
 * price, needs FASHN_API_KEY instead.
 * 🥉 `huggingface`: free Kolors demo Space. No key, no bill — but a shared
 * public queue that is often busy/down. Fallback only, never the default
 * when a paid key is configured.
 *
 * Resolution: an explicit TRYON_PROVIDER wins; otherwise the best engine
 * whose key is present is picked automatically, so setting FAL_KEY alone
 * is enough to get the reliable engine.
 */
type Provider = "fal" | "fashn" | "huggingface";

function resolveProvider(): Provider {
  const explicit = (process.env.TRYON_PROVIDER || "").trim().toLowerCase();
  if (explicit === "fal" || explicit === "fashn" || explicit === "huggingface")
    return explicit;
  if (process.env.FAL_KEY) return "fal";
  if (process.env.FASHN_API_KEY) return "fashn";
  return "huggingface";
}

// ⚠️ Boot-time hint (runs once per server start, not per request): Next
// loads `.env.local` only at boot, so a key added while `next dev` is
// already running stays invisible until restart — the single most common
// "it 502s even though my key is valid" cause.
if (
  !process.env.FAL_KEY &&
  !process.env.FASHN_API_KEY &&
  (process.env.TRYON_PROVIDER || "").trim().toLowerCase() !== "huggingface"
) {
  console.warn(
    "[tryon] no FAL_KEY/FASHN_API_KEY at boot — falling back to the free Hugging Face demo (unstable). Put FAL_KEY in .env.local and restart the server for reliable try-on.",
  );
}

type Img = { buf: Buffer; mime: string };

async function toBytes(img: string, origin: string): Promise<Img> {
  if (img.startsWith("data:")) {
    const [head, b64] = img.split(",");
    const mime = head.slice(5, head.indexOf(";")) || "image/jpeg";
    return { buf: Buffer.from(b64 ?? "", "base64"), mime };
  }
  // 🔒 SSRF guard: never fetch a client-supplied absolute URL — only this
  // app's own static assets (e.g. a catalog product image path), resolved
  // against *this request's* origin. Without the origin check, something
  // like `"//internal-host/x"` would resolve away from `origin` and still
  // get fetched.
  const url = new URL(img, origin);
  if (url.origin !== origin) {
    throw new Error("فقط تصاویر آپلودی یا محصولات همین سایت مجاز است.");
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error(`دریافت تصویر ناموفق بود (${res.status}).`);
  return {
    buf: Buffer.from(await res.arrayBuffer()),
    mime: res.headers.get("content-type") || "image/jpeg",
  };
}

const dataUri = ({ buf, mime }: Img) =>
  `data:${mime};base64,${buf.toString("base64")}`;

function timeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  let id: ReturnType<typeof setTimeout> | undefined;
  const guard = new Promise<T>((_, rej) => {
    id = setTimeout(() => rej(new Error(`${label} بیش از حد طول کشید.`)), ms);
  });
  return Promise.race([p.finally(() => clearTimeout(id)), guard]);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ─── Result proxy ────────────────────────────────────────────────
 * The engines return expiring CDN URLs (fal.media / cdn.fashn.ai / hf.space).
 * Downloading the bytes here and answering with a `data:` URI keeps the
 * response self-contained (no dead link if the CDN purges it), keeps the
 * CSP `img-src` strict (no third-party image hosts needed), and lets the
 * client `<img>` + download button work without any CORS/CSP exception.
 * If the download itself fails, the remote URL is returned as a fallback
 * (the CSP in `next.config.ts` allow-lists these hosts for that case).
 */
const PROXY_MAX_BYTES = 6_000_000;

async function proxyToDataUri(url: string): Promise<string | null> {
  try {
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), 20_000);
    try {
      const res = await fetch(url, { signal: ctrl.signal });
      if (!res.ok) return null;
      const type = res.headers.get("content-type") || "";
      if (!type.startsWith("image/")) return null;
      const buf = Buffer.from(await res.arrayBuffer());
      if (!buf.length || buf.length > PROXY_MAX_BYTES) return null;
      return `data:${type};base64,${buf.toString("base64")}`;
    } finally {
      clearTimeout(id);
    }
  } catch {
    return null;
  }
}

/* 🥇 ─── fal.ai — FASHN TryOn v1.6 (primary, best-tested) ───
 *
 * Why polling manually instead of `fal.subscribe()`? `subscribe` hides its
 * retry loop inside the client (no documented attempt cap — exactly the
 * "infinite loop trap" this route must avoid). `queue.submit` + a bounded
 * `for` loop below is provably finite: MAX_POLLS × POLL_EVERY_MS ≈ 80s,
 * each status read guarded by its own timeout, then one hard failure.
 */
const FAL_MODEL = "fal-ai/fashn/tryon/v1.6";
const FAL_MAX_POLLS = 40;
const FAL_POLL_EVERY_MS = 2_000;

export type FalGarmentCategory = "tops" | "bottoms" | "one-pieces" | "auto";

/* ─── fal diagnostics ───────────────────────────────────────────
 * `@fal-ai/client` throws `ApiError { status, body, message }` for HTTP
 * failures (see its `response.js`): 401/402/403 fail immediately, while
 * 429/5xx + network errors are retried 3× inside the client before
 * surfacing. Mapping the status to a precise Persian line tells the
 * shopper exactly what to do; the raw wire detail still lands in the
 * server terminal for the developer. Already-curated Persian messages
 * (our own timeout/poll guards) pass through untouched.
 */
function mapFalError(e: unknown): Error {
  const status =
    typeof (e as { status?: unknown })?.status === "number"
      ? (e as { status: number }).status
      : undefined;
  const raw = e instanceof Error ? e.message : String(e);
  const wire =
    /fetch failed|network|ECONN|ENOTFOUND|ETIMEDOUT|EAI_AGAIN|HTTP \d|balance|credit|payment|insufficient|top ?up/i.test(
      raw,
    );
  if (status === undefined && !wire) {
    console.error("[tryon/fal] failed:", raw.slice(0, 300));
    return e instanceof Error ? e : new Error(raw);
  }
  const body = (e as { body?: unknown })?.body;
  const bodyText = body === undefined ? "" : JSON.stringify(body);
  console.error("[tryon/fal] engine call failed:", {
    status,
    message: raw.slice(0, 300),
    body: body === undefined ? undefined : bodyText.slice(0, 500),
  });
  // 💳 Billing signals hide in EITHER the message or the body: fal answers
  // an exhausted balance with `403 Forbidden` + `{"detail":"...Exhausted
  // balance..."}`, so both are scanned — otherwise this would misreport as
  // a key/region problem instead of "top up your balance".
  const billing = /balance|credit|payment|insufficient|top ?up/i.test(
    `${raw} ${bodyText}`,
  );
  if (status === 401)
    return new Error(
      "کلید FAL_KEY نامعتبر است؛ یک کلید تازه بسازید، در .env.local بگذارید و سرور را ری‌استارت کنید.",
    );
  if (status === 402 || billing)
    return new Error(
      "اعتبار حساب fal کافی نیست؛ حساب را در fal.ai شارژ کنید (هر پرو حدود ۷ سنت).",
    );
  if (status === 403)
    return new Error(
      "دسترسی به fal رد شد؛ کلید و اتصال اینترنت (محدودیت منطقه‌ای/VPN) را بررسی کنید.",
    );
  if (status === 422)
    return new Error(
      "ورودی موتور پرو پذیرفته نشد؛ یک عکس تمام‌قد واضح‌تر امتحان کنید.",
    );
  if (status === 429)
    return new Error("محدودیت نرخ fal؛ کمی بعد دوباره تلاش کنید.");
  if (/fetch failed|network|ECONN|ENOTFOUND|ETIMEDOUT|EAI_AGAIN/i.test(raw))
    return new Error(
      "ارتباط با fal برقرار نشد؛ اتصال اینترنت و VPN را بررسی کنید.",
    );
  return new Error("موتور پرو مجازی خطا داد؛ چند لحظه بعد دوباره تلاش کنید.");
}

/** 🛡️ One guarded fal call: bounded by `timeout`, wire errors mapped. */
async function falCall<T>(
  p: Promise<T>,
  ms: number,
  label: string,
): Promise<T> {
  try {
    return await timeout(p, ms, label);
  } catch (e) {
    throw mapFalError(e);
  }
}

async function tryonFal(
  person: Img,
  garment: Img,
  category: FalGarmentCategory,
): Promise<string> {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("FAL_KEY تنظیم نشده است.");
  fal.config({ credentials: key });

  const { request_id } = await falCall(
    fal.queue.submit(FAL_MODEL, {
      input: {
        model_image: dataUri(person),
        garment_image: dataUri(garment),
        category,
        mode: "balanced",
        garment_photo_type: "auto",
        // 🛡️ Conservative on purpose: this is a *kids* boutique — also
        // block underwear/swimwear renders, not just explicit content.
        moderation_level: "conservative",
        num_samples: 1,
        segmentation_free: true,
        output_format: "jpeg",
      },
    }),
    25_000,
    "ارسال به موتور پرو",
  );
  if (typeof request_id !== "string" || !request_id)
    throw new Error("موتور پرو مجازی پاسخ معتبری نداد.");

  // 🔁 Bounded by construction: a `for` loop with a constant cap can never
  // spin forever, whatever the queue answers.
  for (let i = 0; i < FAL_MAX_POLLS; i++) {
    await sleep(FAL_POLL_EVERY_MS);
    const status = await falCall(
      fal.queue.status(FAL_MODEL, { requestId: request_id, logs: false }),
      15_000,
      "بررسی وضعیت موتور پرو",
    );
    // 🛡️ Compared as a plain string: the client's types only know
    // IN_QUEUE/IN_PROGRESS/COMPLETED, but the wire can grow new terminal
    // states — anything that isn't "keep waiting" or "done" must fail loud,
    // never loop.
    const state = status.status as string;
    if (state === "COMPLETED") break;
    if (state !== "IN_QUEUE" && state !== "IN_PROGRESS") {
      throw new Error("موتور پرو مجازی تصویر را تولید نکرد.");
    }
    if (i === FAL_MAX_POLLS - 1) {
      throw new Error("پردازش طولانی شد؛ لطفاً دوباره تلاش کنید.");
    }
  }

  const result = await falCall(
    fal.queue.result(FAL_MODEL, { requestId: request_id }),
    25_000,
    "دریافت نتیجه موتور پرو",
  );
  const url = (result?.data as { images?: { url?: string }[] })?.images?.[0]
    ?.url;
  if (!url) throw new Error("سرویس پاسخ معتبری نداد.");
  return url;
}

/* 🥈 ─── FASHN direct API (same v1.6 model, own infrastructure) ───
 * Same bounded-polling contract as the fal path above: polled here on the
 * server (never by the browser), with a constant attempt cap.
 */
const FASHN_URL = "https://api.fashn.ai/v1";
const FASHN_MAX_POLLS = 40;
const FASHN_POLL_EVERY_MS = 2_000;

async function tryonFashnDirect(
  person: Img,
  garment: Img,
  category: FalGarmentCategory,
): Promise<string> {
  const key = process.env.FASHN_API_KEY;
  if (!key) throw new Error("FASHN_API_KEY تنظیم نشده است.");

  const run = await fetch(`${FASHN_URL}/run`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model_name: "tryon-v1.6",
      inputs: {
        model_image: dataUri(person),
        garment_image: dataUri(garment),
        category: category === "one-pieces" ? "one-piece" : category,
      },
    }),
  });
  const started = await run.json().catch(() => ({}));
  if (!run.ok || !started?.id)
    throw new Error(
      started?.error?.message || started?.error || "شروع پرو مجازی ناموفق بود.",
    );
  const id = started.id as string;

  for (let i = 0; i < FASHN_MAX_POLLS; i++) {
    await sleep(FASHN_POLL_EVERY_MS);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 15_000);
    try {
      const res = await fetch(`${FASHN_URL}/status/${id}`, {
        headers: { Authorization: `Bearer ${key}` },
        signal: ctrl.signal,
      });
      const state = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(state?.error || "خطا در بررسی وضعیت پرو مجازی.");
      if (state.status === "completed") {
        const url = state.output?.[0] as string | undefined;
        if (!url) throw new Error("سرویس پاسخ معتبری نداد.");
        return url;
      }
      if (state.status === "failed" || state.error) {
        throw new Error(
          state.error?.message || state.error || "تولید تصویر ناموفق بود.",
        );
      }
    } finally {
      clearTimeout(timer);
    }
  }
  throw new Error("پردازش طولانی شد؛ لطفاً دوباره تلاش کنید.");
}

/* 🥉 ─── Free: Hugging Face (Kolors) — best-effort fallback ───
 * Shared public demo: often busy/down. Single request with timeouts, no
 * polling at all. Only used when neither paid key is configured.
 */
const HF_SPACE =
  process.env.HF_TRYON_SPACE || "Kwai-Kolors/Kolors-Virtual-Try-On";

async function tryonHuggingFace(person: Img, garment: Img): Promise<string> {
  const token = process.env.HF_TOKEN;
  const client = await timeout(
    Client.connect(
      HF_SPACE,
      token ? { hf_token: token as `hf_${string}` } : undefined,
    ),
    20_000,
    "اتصال به سرویس رایگان",
  );
  const result = await timeout(
    client.predict("/tryon", [
      handle_file(
        new Blob([new Uint8Array(person.buf)], { type: person.mime }),
      ),
      handle_file(
        new Blob([new Uint8Array(garment.buf)], { type: garment.mime }),
      ),
      0,
      true,
    ]),
    90_000,
    "پردازش سرویس رایگان",
  );
  const out = (result?.data as unknown[])?.[0] as
    { url?: string; path?: string } | string | undefined;
  const url = typeof out === "string" ? out : out?.url || out?.path;
  if (!url) throw new Error("empty");
  return url;
}

const ENGINE_LABEL: Record<Provider, string> = {
  fal: "FASHN v1.6",
  fashn: "FASHN v1.6",
  huggingface: "Kolors",
};

function parseCategory(raw: unknown): FalGarmentCategory {
  return raw === "tops" || raw === "bottoms" || raw === "one-pieces"
    ? raw
    : "auto";
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId(req);
  if (!userId) return NextResponse.json({ error: AUTH_ERROR }, { status: 401 });

  // 🚦 Real money/quota per call — 5 per hour per signed-in user.
  const limited = rateLimit(`tryon:${userId}`, {
    windowMs: 60 * 60 * 1000,
    max: 5,
  });
  if (!limited.ok)
    return NextResponse.json(
      { error: RATE_ERROR },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      },
    );

  let body: { modelImage?: string; garmentImage?: string; category?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "درخواست نامعتبر است." },
      { status: 400 },
    );
  }
  const { modelImage, garmentImage } = body;
  if (!modelImage || !garmentImage)
    return NextResponse.json(
      { error: "عکس شخص و لباس هر دو لازم است." },
      { status: 400 },
    );
  if (modelImage.length > 8_000_000)
    return NextResponse.json(
      { error: "حجم عکس زیاد است؛ عکس کوچک‌تری انتخاب کنید." },
      { status: 413 },
    );
  const category = parseCategory(body.category);

  let person: Img, garment: Img;
  try {
    [person, garment] = await Promise.all([
      toBytes(modelImage, req.nextUrl.origin),
      toBytes(garmentImage, req.nextUrl.origin),
    ]);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }

  const provider = resolveProvider();
  try {
    const url =
      provider === "fal"
        ? await tryonFal(person, garment, category)
        : provider === "fashn"
          ? await tryonFashnDirect(person, garment, category)
          : await tryonHuggingFace(person, garment);

    // 🖼️ One response shape for every engine: the finished image, inlined
    // when possible. The browser never polls — a single POST in, a single
    // image out — so no client loop can ever run away.
    const image = (await proxyToDataUri(url)) ?? url;
    return NextResponse.json({
      status: "completed" as const,
      image,
      engine: ENGINE_LABEL[provider],
    });
  } catch (e) {
    const raw = (e as Error).message || "";
    // 💬 The free public demo is frequently busy/offline — return a clear, friendly message.
    const friendly =
      provider === "huggingface" && raw !== "FAL_KEY تنظیم نشده است."
        ? "سرویس رایگانِ پرو مجازی الان شلوغ یا در دسترس نیست. چند لحظه بعد دوباره امتحان کنید؛ برای نتیجهٔ پایدار، مدیر سایت حالت حرفه‌ای (FAL_KEY) را فعال کند."
        : raw || "پرو مجازی ناموفق بود.";
    const status =
      raw.includes("تنظیم نشده است") || raw.includes("طولانی شد") ? 503 : 502;
    return NextResponse.json({ error: friendly }, { status });
  }
}
