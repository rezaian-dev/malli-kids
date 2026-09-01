import { CATS, PRICE_CAP, SORTS } from "@/lib/constants";
import { SEASONS } from "@/lib/data/products";
import { applyShopSearchIntent } from "@/lib/shop-query";

type SearchValue = string | string[] | undefined;

export type ShopPageSearchParams = Promise<Record<string, SearchValue>>;

export type ShopState = {
  cat: string;
  season: string;
  page: number;
  sort: string;
  view: "grid" | "list";
  stock: boolean;
  disc: boolean;
  hot: boolean;
  onlyNew: boolean;
  q: string;
  min: number;
  max: number;
};

function readText(value: SearchValue) {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function readAlias(
  params: Record<string, SearchValue>,
  ...keys: string[]
): SearchValue {
  for (const key of keys) {
    const value = params[key];
    if (value !== undefined) return value;
  }
  return undefined;
}

function readNumber(value: SearchValue, fallback: number) {
  const parsed = Number.parseInt(readText(value), 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function defaultShopState(): ShopState {
  return {
    cat: "همه",
    season: "همه",
    page: 1,
    sort: "new",
    view: "grid",
    stock: false,
    disc: false,
    hot: false,
    onlyNew: false,
    q: "",
    min: 0,
    max: PRICE_CAP,
  };
}

export function isShopIndexable(state: ShopState) {
  return (
    !state.q &&
    state.page <= 1 &&
    state.sort === "new" &&
    state.view === "grid" &&
    !state.stock &&
    !state.disc &&
    !state.hot &&
    !state.onlyNew &&
    state.min === 0 &&
    state.max === PRICE_CAP
  );
}

export function shopCanonicalHref(state: ShopState) {
  if (isShopIndexable(state)) return toShopHref(state);
  return toShopHref({
    ...defaultShopState(),
    cat: state.cat,
    season: state.season,
  });
}

export function shopHeading(state: ShopState) {
  if (state.q) return `جستجو برای «${state.q}»`;
  const parts = [
    state.cat !== "همه" ? state.cat : "",
    state.season !== "همه" ? state.season : "",
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : "کالکشن پوشاک کودک";
}

export function parseShopState(params: Record<string, SearchValue>): ShopState {
  const cat = readText(readAlias(params, "category", "cat"));
  const season = readText(params.season);
  const sort = readText(params.sort);
  const min = Math.max(0, readNumber(readAlias(params, "minPrice", "min"), 0));
  const rawMax = readNumber(readAlias(params, "maxPrice", "max"), PRICE_CAP);
  const max = Math.max(min, Math.min(PRICE_CAP, rawMax));
  const parsed: ShopState = {
    cat: (CATS as readonly string[]).includes(cat) ? cat : "همه",
    season:
      season && (SEASONS as readonly string[]).includes(season)
        ? season
        : "همه",
    page: Math.max(1, readNumber(params.page, 1)),
    sort: sort && Object.hasOwn(SORTS, sort) ? sort : "new",
    view: readText(params.view) === "list" ? "list" : "grid",
    stock: readText(readAlias(params, "inStock", "stock")) === "1",
    disc: readText(readAlias(params, "onSale", "disc")) === "1",
    hot: readText(readAlias(params, "topRated", "hot")) === "1",
    onlyNew: readText(readAlias(params, "newest", "new")) === "1",
    q: readText(readAlias(params, "query", "q"))
      .trim()
      .slice(0, 60),
    min,
    max,
  };
  const next = applyShopSearchIntent(parsed);
  const intentChanged =
    next.cat !== parsed.cat ||
    next.season !== parsed.season ||
    next.q !== parsed.q;

  return intentChanged ? { ...next, page: 1 } : next;
}

export function toShopHref(state: ShopState) {
  const canonical = applyShopSearchIntent(state);
  const params = new URLSearchParams();

  if (canonical.cat !== "همه") params.set("category", canonical.cat);
  if (canonical.season !== "همه") params.set("season", canonical.season);
  if (canonical.page > 1) params.set("page", String(canonical.page));
  if (canonical.sort !== "new") params.set("sort", canonical.sort);
  if (canonical.view === "list") params.set("view", "list");
  if (canonical.stock) params.set("inStock", "1");
  if (canonical.disc) params.set("onSale", "1");
  if (canonical.hot) params.set("topRated", "1");
  if (canonical.onlyNew) params.set("newest", "1");
  if (canonical.q) params.set("query", canonical.q);
  if (canonical.min) params.set("minPrice", String(canonical.min));
  if (canonical.max !== PRICE_CAP)
    params.set("maxPrice", String(canonical.max));

  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
}
