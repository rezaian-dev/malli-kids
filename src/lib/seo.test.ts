import { describe, expect, it } from "vitest";
import {
  SEO,
  absoluteUrl,
  articleSchema,
  buildMetadata,
  crawlableImage,
  productSchema,
} from "./seo";
import type { Product } from "@/types";

const product = {
  id: 5,
  name: "پیراهن",
  desc: "توضیح",
  img: "/images/p5.jpg",
  cat: "دخترانه",
  price: 250_000,
  stock: true,
} as unknown as Product;

describe("crawlableImage", () => {
  it("passes site paths and absolute URLs through", () => {
    expect(crawlableImage("/og.jpg", "/fallback.jpg")).toBe("/og.jpg");
    expect(crawlableImage("https://x.test/y.jpg", "/f")).toBe(
      "https://x.test/y.jpg",
    );
  });

  it("falls back for empty and data: inputs", () => {
    expect(crawlableImage(undefined, "/f")).toBe("/f");
    expect(crawlableImage("", "/f")).toBe("/f");
    expect(crawlableImage("data:image/jpeg;base64,xx", "/f")).toBe("/f");
  });
});

describe("productSchema", () => {
  it("converts the Toman price to Rial with IRR currency", () => {
    const schema = productSchema(product);
    expect(schema.offers.priceCurrency).toBe("IRR");
    expect(schema.offers.price).toBe("2500000");
  });

  it("maps stock to schema.org availability", () => {
    expect(productSchema(product).offers.availability).toContain("InStock");
    expect(
      productSchema({ ...product, stock: false }).offers.availability,
    ).toContain("OutOfStock");
  });

  it("falls back to the default image for data: URL product photos", () => {
    const schema = productSchema({
      ...product,
      img: "data:image/jpeg;base64,xx",
    });
    expect(schema.image).toEqual([absoluteUrl(SEO.defaultImage)]);
  });

  it("builds aggregateRating only from real reviews", () => {
    expect("aggregateRating" in productSchema(product)).toBe(false);
    const rated = productSchema(product, [{ rate: 5 }, { rate: 3 }]);
    expect(rated.aggregateRating).toMatchObject({
      ratingValue: 4,
      reviewCount: 2,
    });
  });
});

describe("articleSchema", () => {
  it("falls back to the default image for data: URL covers", () => {
    const schema = articleSchema({
      slug: "x",
      title: "t",
      excerpt: "e",
      cover: "data:image/png;base64,xx",
      publishedAt: "2026-01-01",
      updatedAt: "2026-01-02",
      tags: [],
    });
    expect(schema.image).toEqual([absoluteUrl(SEO.defaultImage)]);
  });
});

describe("buildMetadata", () => {
  it("never emits a data: URL as og/twitter image", () => {
    const meta = buildMetadata({ image: "data:image/jpeg;base64,xx" });
    expect(JSON.stringify(meta)).not.toContain("data:");
  });

  it("marks private pages noindex without image indexing", () => {
    const meta = buildMetadata({ noIndex: true });
    expect(meta.robots).toMatchObject({
      index: false,
      googleBot: { index: false, noimageindex: true },
    });
  });

  it("sets the canonical path", () => {
    expect(buildMetadata({ path: "/shop" }).alternates?.canonical).toBe("/shop");
  });
});
