import { unstable_cache } from "next/cache";
import { connectMongoose } from "@/lib/db/mongoose";
import { SettingsModel, type SettingsCampaign } from "@/lib/db/models/settings";

const DEFAULT_CAMPAIGN: SettingsCampaign = {
  active: false,
  percent: 20,
  title: "جشنواره ملی‌کیدز",
};

/** ⚙️ The site's one real settings doc. No admin UI writes this yet (see
 *  `SettingsModel`'s comment), so there's no tag to invalidate on demand —
 *  just the same time-based `unstable_cache` window as `getActiveBanner`
 *  (`@/lib/shop/banners`), since this too is read on every single request
 *  (root layout) for a value that's identical for every visitor. */
export const getCampaign = unstable_cache(
  async (): Promise<SettingsCampaign> => {
    await connectMongoose();
    const doc = await SettingsModel.findOne({ key: "site" }).lean();
    return doc?.campaign ?? DEFAULT_CAMPAIGN;
  },
  ["site-campaign"],
  { revalidate: 3600 },
);
