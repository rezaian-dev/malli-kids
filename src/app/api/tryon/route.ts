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

// Paid or shared-quota engines: require a real session, then throttle it.
async function requireUserId(req: NextRequest) {
  try {
    // A banned session throws instead of resolving empty: same 401 as guests.
    const session = await auth.api.getSession({ headers: req.headers });
    return session?.user.id ?? null;
  } catch {
    return null;
  }
}

// Engine priority: explicit TRYON_PROVIDER wins; otherwise the best engine
// with a key (fal > fashn), else the free no-key chain (IDM-VTON, then
// OOTDiffusion on failure). Paid: FASHN v1.6, ~$0.075/img. Free: shared
// ZeroGPU demos — slower, sometimes busy.
type Provider = "fal" | "fashn" | "huggingface";

function resolveProvider(): Provider {
  const explicit = (process.env.TRYON_PROVIDER || "").trim().toLowerCase();
  if (explicit === "fal" || explicit === "fashn" || explicit === "huggingface")
    return explicit;
  if (process.env.FAL_KEY) return "fal";
  if (process.env.FASHN_API_KEY) return "fashn";
  return "huggingface";
}

// Boot-time hint: .env.local loads once at boot; restart after adding keys.
if (
  !process.env.FAL_KEY &&
  !process.env.FASHN_API_KEY &&
  (process.env.TRYON_PROVIDER || "").trim().toLowerCase() !== "huggingface"
) {
  console.warn(
    "[tryon] no FAL_KEY/FASHN_API_KEY at boot — using the free Hugging Face chain (shared queues, may be slow). Put FAL_KEY in .env.local and restart the server for reliable try-on.",
  );
}

type Img = { buf: Buffer; mime: string };

async function toBytes(img: string, origin: string): Promise<Img> {
  if (img.startsWith("data:")) {
    const [head, b64] = img.split(",");
    const mime = head.slice(5, head.indexOf(";")) || "image/jpeg";
    return { buf: Buffer.from(b64 ?? "", "base64"), mime };
  }
  // SSRF guard: same-origin assets only, resolved against this request.
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

// Proxy engine CDN URLs to data URIs (self-contained response, strict CSP);
// falls back to the remote URL when the download fails.
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

// fal.ai, FASHN TryOn v1.6 (primary). Manual bounded polling instead of
// fal.subscribe(): the client loop has no documented cap; this one ends
// after FAL_MAX_POLLS x FAL_POLL_EVERY_MS (~80s) no matter what.
const FAL_MODEL = "fal-ai/fashn/tryon/v1.6";
const FAL_MAX_POLLS = 40;
const FAL_POLL_EVERY_MS = 2_000;

export type FalGarmentCategory = "tops" | "bottoms" | "one-pieces" | "auto";

// Map fal ApiError { status, body, message } to actionable Persian errors.
// Wire detail goes to the server log; our own guard messages pass through.
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
  // Exhausted balance arrives as 403 + detail in the body: scan both.
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

/** One fal call: bounded by timeout, wire errors mapped. */
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
        // Kids boutique: also blocks underwear/swimwear renders.
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

  // Fixed cap: cannot spin forever regardless of queue answers.
  for (let i = 0; i < FAL_MAX_POLLS; i++) {
    await sleep(FAL_POLL_EVERY_MS);
    const status = await falCall(
      fal.queue.status(FAL_MODEL, { requestId: request_id, logs: false }),
      15_000,
      "بررسی وضعیت موتور پرو",
    );
    // String compare: unknown wire states fail loud instead of looping.
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

// FASHN direct API (same v1.6 model). Same bounded server-side polling.
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

// Free chain, no key: IDM-VTON first (any category, auto-mask), then
// OOTDiffusion (independent deployment). Contracts verified against the
// Spaces' own source. Worst case ~139s, inside the client 150s budget.
const IDM_SPACE = "yisol/IDM-VTON";
const OOTD_SPACE = "levihsu/OOTDiffusion";
const HF_CONNECT_MS = 12_000;
const IDM_PREDICT_MS = 55_000;
const OOTD_PREDICT_MS = 60_000;

// English garment hint for IDM-VTON's text encoder (it never saw Persian).
const IDM_GARMENT_HINT: Record<FalGarmentCategory, string> = {
  tops: "shirt",
  bottoms: "pants",
  "one-pieces": "dress",
  auto: "clothes",
};

// OOTD requires the exact category; auto falls back to the common case.
const OOTD_CATEGORY: Record<
  FalGarmentCategory,
  "Upper-body" | "Lower-body" | "Dress"
> = {
  tops: "Upper-body",
  bottoms: "Lower-body",
  "one-pieces": "Dress",
  auto: "Upper-body",
};

const blobOf = (img: Img) =>
  handle_file(new Blob([new Uint8Array(img.buf)], { type: img.mime }));

function fileUrl(out: unknown): string | undefined {
  if (typeof out === "string") return out;
  const o = out as { url?: string; path?: string } | null | undefined;
  return o?.url || o?.path;
}

function galleryUrl(out: unknown): string | undefined {
  const first = Array.isArray(out) ? out[0] : undefined;
  return fileUrl((first as { image?: unknown } | undefined)?.image);
}

function hfOptions(token: string | undefined) {
  return token ? { hf_token: token as `hf_${string}` } : undefined;
}

async function tryonIdmVton(
  person: Img,
  garment: Img,
  category: FalGarmentCategory,
  token: string | undefined,
): Promise<string> {
  const client = await timeout(
    Client.connect(IDM_SPACE, hfOptions(token)),
    HF_CONNECT_MS,
    "اتصال به IDM-VTON",
  );
  // Human photo as background, no manual mask (auto-mask runs in ~5s).
  const editor = {
    background: new Blob([new Uint8Array(person.buf)], { type: person.mime }),
    layers: [],
    composite: null,
  };
  const result = await timeout(
    client.predict("/tryon", [
      editor,
      blobOf(garment),
      IDM_GARMENT_HINT[category],
      true, // auto-mask
      false, // no auto-crop (client already sends 1024px)
      30, // default denoise steps
      42,
    ]),
    IDM_PREDICT_MS,
    "پردازش IDM-VTON",
  );
  const url = fileUrl((result?.data as unknown[])?.[0]);
  if (!url) throw new Error("IDM-VTON تصویری برنگرداند.");
  return url;
}

async function tryonOotd(
  person: Img,
  garment: Img,
  category: FalGarmentCategory,
  token: string | undefined,
): Promise<string> {
  const client = await timeout(
    Client.connect(OOTD_SPACE, hfOptions(token)),
    HF_CONNECT_MS,
    "اتصال به OOTDiffusion",
  );
  const result = await timeout(
    client.predict("/process_dc", [
      blobOf(person),
      blobOf(garment),
      OOTD_CATEGORY[category],
      1, // n_samples
      20, // n_steps (Space default)
      2.0, // image_scale
      -1, // random seed
    ]),
    OOTD_PREDICT_MS,
    "پردازش OOTDiffusion",
  );
  const url = galleryUrl((result?.data as unknown[])?.[0]);
  if (!url) throw new Error("OOTDiffusion تصویری برنگرداند.");
  return url;
}

// Fixed 2-step failover: each engine returns or logs one failure line.
async function tryonFreeChain(
  person: Img,
  garment: Img,
  category: FalGarmentCategory,
): Promise<{ url: string; engine: string }> {
  const token = process.env.HF_TOKEN;
  const attempts = [
    {
      name: "IDM-VTON",
      run: () => tryonIdmVton(person, garment, category, token),
    },
    {
      name: "OOTDiffusion",
      run: () => tryonOotd(person, garment, category, token),
    },
  ];
  const failures: string[] = [];
  for (const attempt of attempts) {
    try {
      const url = await attempt.run();
      console.log(`[tryon] free engine ${attempt.name} succeeded`);
      return { url, engine: attempt.name };
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      failures.push(`${attempt.name}: ${msg}`);
      console.warn(`[tryon] free engine ${attempt.name} failed: ${msg}`);
    }
  }
  console.error("[tryon] all free engines failed:", failures.join(" | "));
  throw new Error("free-chain-exhausted");
}

// Nominal label for the free chain; tryonFreeChain reports the real engine.
const ENGINE_LABEL: Record<Provider, string> = {
  fal: "FASHN v1.6",
  fashn: "FASHN v1.6",
  huggingface: "IDM-VTON",
};

function parseCategory(raw: unknown): FalGarmentCategory {
  return raw === "tops" || raw === "bottoms" || raw === "one-pieces"
    ? raw
    : "auto";
}

export async function POST(req: NextRequest) {
  const userId = await requireUserId(req);
  if (!userId) return NextResponse.json({ error: AUTH_ERROR }, { status: 401 });

  // Paid/quota engines: 5 calls per hour per user.
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
    let url: string;
    let engine = ENGINE_LABEL[provider];
    if (provider === "fal") {
      url = await tryonFal(person, garment, category);
    } else if (provider === "fashn") {
      url = await tryonFashnDirect(person, garment, category);
    } else {
      const free = await tryonFreeChain(person, garment, category);
      url = free.url;
      engine = free.engine;
    }

    // Single POST in, single image out: the browser never polls.
    const image = (await proxyToDataUri(url)) ?? url;
    return NextResponse.json({
      status: "completed" as const,
      image,
      engine,
    });
  } catch (e) {
    const raw = (e as Error).message || "";
    // Shared free quotas fail often; never leak internals to the shopper.
    const friendly =
      provider === "huggingface"
        ? "هر دو سرویس رایگانِ پرو مجازی الان شلوغ یا در دسترس نیستند. چند دقیقه بعد دوباره امتحان کنید؛ برای نتیجهٔ پایدار، مدیر سایت حالت حرفه‌ای (FAL_KEY) را فعال کند."
        : raw || "پرو مجازی ناموفق بود.";
    const status =
      raw.includes("تنظیم نشده است") || raw.includes("طولانی شد") ? 503 : 502;
    return NextResponse.json({ error: friendly }, { status });
  }
}
