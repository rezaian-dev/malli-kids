import { CATS, PRICE_CAP, SORTS } from "@/lib/constants";
import { SEASONS } from "@/lib/data/products";

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

export function parseShopState(params: Record<string, SearchValue>): ShopState {
  const cat = readText(readAlias(params, "category", "cat"));
  const season = readText(params.season);
  const sort = readText(params.sort);
  const min = Math.max(0, readNumber(readAlias(params, "minPrice", "min"), 0));
  const rawMax = readNumber(readAlias(params, "maxPrice", "max"), PRICE_CAP);
  const max = Math.max(min, Math.min(PRICE_CAP, rawMax));

  return {
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
    q: readText(readAlias(params, "query", "q")).trim().slice(0, 60),
    min,
    max,
  };
}

export function toShopHref(state: ShopState) {
  const params = new URLSearchParams();

  if (state.cat !== "همه") params.set("category", state.cat);
  if (state.season !== "همه") params.set("season", state.season);
  if (state.page > 1) params.set("page", String(state.page));
  if (state.sort !== "new") params.set("sort", state.sort);
  if (state.view === "list") params.set("view", "list");
  if (state.stock) params.set("inStock", "1");
  if (state.disc) params.set("onSale", "1");
  if (state.hot) params.set("topRated", "1");
  if (state.onlyNew) params.set("newest", "1");
  if (state.q) params.set("query", state.q);
  if (state.min) params.set("minPrice", String(state.min));
  if (state.max !== PRICE_CAP) params.set("maxPrice", String(state.max));

  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
}
