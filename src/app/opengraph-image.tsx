import { Buffer } from "node:buffer";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SEO } from "@/lib/seo";

export const runtime = "nodejs";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

function toDataUrl(type: string, bytes: Buffer) {
  return `data:${type};base64,${bytes.toString("base64")}`;
}

async function loadAssets() {
  const [hero, logo] = await Promise.all([
    readFile(join(process.cwd(), "public/brand/hero-dress-premium.jpg")),
    readFile(join(process.cwd(), "public/brand/logo.png")),
  ]);

  return {
    hero: toDataUrl("image/jpeg", hero),
    logo: toDataUrl("image/png", logo),
  };
}

export default async function OpenGraphImage() {
  const { hero, logo } = await loadAssets();

  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background:
            "radial-gradient(circle at top right, rgba(217,183,127,0.26), transparent 34%), radial-gradient(circle at bottom left, rgba(130,169,214,0.18), transparent 28%), linear-gradient(135deg, #061728 0%, #0a2238 46%, #102d49 100%)",
          color: "#fcf7ef",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(6,23,40,0.08) 0%, rgba(6,23,40,0.16) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -140,
            left: -120,
            width: 460,
            height: 460,
            borderRadius: 9999,
            border: "1px solid rgba(217,183,127,0.16)",
            opacity: 0.7,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -180,
            right: -70,
            width: 520,
            height: 520,
            borderRadius: 9999,
            border: "1px solid rgba(255,255,255,0.08)",
            opacity: 0.6,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 52,
            left: 56,
            display: "flex",
            alignItems: "center",
            gap: 14,
            padding: "12px 18px",
            borderRadius: 9999,
            background: "rgba(252,247,239,0.08)",
            border: "1px solid rgba(252,247,239,0.12)",
          }}
        >
          <img src={logo} width={38} height={38} alt="MALLI KIDS" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 22,
                letterSpacing: 4,
                color: "#f0d7a7",
                fontWeight: 700,
              }}
            >
              MALLI KIDS
            </span>
            <span
              style={{
                fontSize: 16,
                color: "rgba(252,247,239,0.86)",
              }}
            >
              Couture for little moments
            </span>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: 690,
            padding: "88px 78px 78px 78px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 22,
              color: "#d9b77f",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            <span
              style={{
                width: 62,
                height: 2,
                borderRadius: 99,
                background: "#d9b77f",
              }}
            />
            PREMIUM KIDSWEAR BOUTIQUE
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              maxWidth: 600,
            }}
          >
            <span
              style={{
                fontSize: 74,
                lineHeight: 1.08,
                fontWeight: 800,
                letterSpacing: 2,
              }}
            >
              {SEO.siteNameEn}
            </span>
            <span
              style={{
                fontSize: 34,
                lineHeight: 1.42,
                color: "rgba(252,247,239,0.9)",
              }}
            >
              Elegant childrenswear, refined craftsmanship, precise sizing, and a polished online shopping experience.
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 14,
              marginTop: 30,
            }}
          >
            {[
              "Girls",
              "Boys",
              "Baby",
              "Handmade",
            ].map((item) => (
              <span
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "11px 18px",
                  borderRadius: 9999,
                  background: "rgba(252,247,239,0.1)",
                  border: "1px solid rgba(252,247,239,0.12)",
                  fontSize: 20,
                  color: "#fcf7ef",
                }}
              >
                {item}
              </span>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 34,
              fontSize: 22,
              color: "rgba(252,247,239,0.76)",
            }}
          >
            <span style={{ color: "#d9b77f" }}>mallikids.ir</span>
            <span>•</span>
            <span>Luxury kids fashion</span>
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: 58,
            right: 56,
            bottom: 58,
            width: 360,
            display: "flex",
            alignItems: "stretch",
            justifyContent: "center",
            borderRadius: 38,
            overflow: "hidden",
            border: "1px solid rgba(252,247,239,0.16)",
            boxShadow: "0 40px 80px rgba(0, 0, 0, 0.32)",
            background: "rgba(252,247,239,0.06)",
          }}
        >
          <img
            src={hero}
            width={360}
            height={514}
            alt="MALLI KIDS dress"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>
      </div>
    ),
    {
      width: size.width,
      height: size.height,
    },
  );
}
