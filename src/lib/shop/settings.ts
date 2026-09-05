import { unstable_cache } from "next/cache";
import { connectMongoose } from "@/lib/db/mongoose";
import { SettingsModel, type SettingsCampaign } from "@/lib/db/models/settings";

const DEFAULT_CAMPAIGN: SettingsCampaign = {
  active: false,
  percent: 20,
  title: "جشنواره ملی‌کیدز",
};

// 🧊 `/admin/settings` now writes this doc — tagged so that write can
// `revalidateTag` it on demand, same pattern as `PRODUCTS_TAG`/
// `FESTIVE_BANNER_TAG`. The 1-hour `revalidate` stays as a safety net, not
// the primary invalidation path.
export const SITE_SETTINGS_TAG = "site-settings";

/** ⚙️ The site's one real settings doc — read on every request (root
 *  layout) for a value that's identical for every visitor, so it's cached
 *  like `getActiveBanner` (`@/lib/shop/banners`). */
export const getCampaign = unstable_cache(
  async (): Promise<SettingsCampaign> => {
    await connectMongoose();
    const doc = await SettingsModel.findOne({ key: "site" }).lean();
    return doc?.campaign ?? DEFAULT_CAMPAIGN;
  },
  ["site-campaign"],
  { tags: [SITE_SETTINGS_TAG], revalidate: 3600 },
);
