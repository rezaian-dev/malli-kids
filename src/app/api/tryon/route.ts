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

// 🔀 Pick the engine with one env var. Default = free Hugging Face Space (no key).
//   huggingface → free, no signup. ⚠️ shared public demo: often busy/down; NOT for production.
//   fal         → reliable Kolors try-on ($0.07/img). needs FAL_KEY.
//   fashn       → reliable, private ($0.075/img). needs FASHN_API_KEY.
const PROVIDER = (process.env.TRYON_PROVIDER || "huggingface").toLowerCase();

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
  return Promise.race([
    p,
    new Promise<T>((_, rej) =>
      setTimeout(() => rej(new Error(`${label} بیش از حد طول کشید.`)), ms),
    ),
  ]);
}

/* 🆓 ─── Free: Hugging Face (Kolors) — best-effort, unstable public demo ─── */
const HF_SPACE =
  process.env.HF_TRYON_SPACE || "Kwai-Kolors/Kolors-Virtual-Try-On";

async function tryonHuggingFace(person: Img, garment: Img): Promise<string> {
  const token = process.env.HF_TOKEN;
  const client = await timeout(
    Client.connect(
      HF_SPACE,
      token ? { hf_token: token as `hf_${string}` } : undefined,
    ),
    30_000,
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
    100_000,
    "پردازش سرویس رایگان",
  );
  const out = (result?.data as unknown[])?.[0] as
    { url?: string; path?: string } | string | undefined;
  const url = typeof out === "string" ? out : out?.url || out?.path;
  if (!url) throw new Error("empty");
  return url;
}

/* ⚡ ─── Reliable: fal.ai (Kling Kolors v1.5) ─── */
async function tryonFal(person: Img, garment: Img): Promise<string> {
  const key = process.env.FAL_KEY;
  if (!key) throw new Error("FAL_KEY تنظیم نشده است.");
  fal.config({ credentials: key });
  const result = await fal.subscribe(
    "fal-ai/kling/v1-5/kolors-virtual-try-on",
    {
      input: {
        human_image_url: dataUri(person),
        garment_image_url: dataUri(garment),
      },
    },
  );
  const url = (result?.data as { image?: { url?: string } })?.image?.url;
  if (!url) throw new Error("سرویس پاسخ معتبری نداد.");
  return url;
}

/* 🛡️ ─── Reliable: FASHN AI ─── */
const FASHN_URL = "https://api.fashn.ai/v1";

async function fashnStart(person: Img, garment: Img): Promise<string> {
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
        category: "auto",
      },
    }),
  });
  const data = await run.json().catch(() => ({}));
  if (!run.ok || !data?.id)
    throw new Error(
      data?.error?.message || data?.error || "شروع پرو مجازی ناموفق بود.",
    );
  return data.id as string;
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

  let body: { modelImage?: string; garmentImage?: string };
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

  let person: Img, garment: Img;
  try {
    [person, garment] = await Promise.all([
      toBytes(modelImage, req.nextUrl.origin),
      toBytes(garmentImage, req.nextUrl.origin),
    ]);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }

  try {
    if (PROVIDER === "fashn") {
      return NextResponse.json({ id: await fashnStart(person, garment) });
    }
    if (PROVIDER === "fal") {
      return NextResponse.json({
        status: "completed",
        image: await tryonFal(person, garment),
      });
    }
    // 🆓 free HF (default)
    return NextResponse.json({
      status: "completed",
      image: await tryonHuggingFace(person, garment),
    });
  } catch (e) {
    const raw = (e as Error).message || "";
    // 💬 The free public demo is frequently busy/offline — return a clear, friendly message.
    const friendly =
      PROVIDER === "huggingface"
        ? "سرویس رایگانِ پرو مجازی الان شلوغ یا در دسترس نیست. چند لحظه بعد دوباره امتحان کنید، یا برای نتیجهٔ پایدار حالت حرفه‌ای (fal/FASHN) را فعال کنید."
        : raw || "پرو مجازی ناموفق بود.";
    return NextResponse.json({ error: friendly }, { status: 502 });
  }
}

// 🔁 FASHN polling only.
export async function GET(req: NextRequest) {
  const userId = await requireUserId(req);
  if (!userId) return NextResponse.json({ error: AUTH_ERROR }, { status: 401 });

  if (PROVIDER !== "fashn")
    return NextResponse.json(
      { error: "این provider نیازی به poll ندارد." },
      { status: 400 },
    );
  const key = process.env.FASHN_API_KEY;
  if (!key)
    return NextResponse.json(
      { error: "FASHN_API_KEY تنظیم نشده است." },
      { status: 503 },
    );
  const id = req.nextUrl.searchParams.get("id");
  if (!id)
    return NextResponse.json({ error: "شناسه لازم است." }, { status: 400 });

  const res = await fetch(`${FASHN_URL}/status/${id}`, {
    headers: { Authorization: `Bearer ${key}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    return NextResponse.json(
      { error: data?.error || "خطا در بررسی وضعیت." },
      { status: 502 },
    );
  if (data.status === "completed")
    return NextResponse.json({
      status: "completed",
      image: data.output?.[0] ?? null,
    });
  if (data.status === "failed" || data.error)
    return NextResponse.json({
      status: "failed",
      error: data.error?.message || data.error || "تولید ناموفق بود.",
    });
  return NextResponse.json({ status: data.status || "processing" });
}
