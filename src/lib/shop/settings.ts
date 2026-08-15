import { unstable_cache } from "next/cache";
import { REVALIDATE } from "@/lib/cache";
import { connectMongoose } from "@/lib/db/mongoose";
import {
  SettingsModel,
  type SettingsCampaign,
  type SettingsSupportHours,
} from "@/lib/db/models/settings";

export type SupportHours = SettingsSupportHours;

const DEFAULT_CAMPAIGN: SettingsCampaign = {
  active: false,
  percent: 20,
  title: "جشنواره ملی‌کیدز",
};

// 🧊 `/admin/settings` now writes this doc — tagged so that write can
// `revalidateTag` it on demand, same pattern as `PRODUCTS_TAG`.
export const SITE_SETTINGS_TAG = "site-settings";

export const DEFAULT_SUPPORT_HOURS: SupportHours = {
  startHour: 9,
  endHour: 21,
  label: "شنبه تا پنجشنبه، ۹ صبح تا ۹ شب",
};

/** 🕘 Cached under the same tag as the campaign — one `revalidateTag`
 *  refreshes both after a settings save. */
export const getSupportHours = unstable_cache(
  async (): Promise<SupportHours> => {
    await connectMongoose();
    const doc = await SettingsModel.findOne({ key: "site" }).lean();
    return doc?.support ?? DEFAULT_SUPPORT_HOURS;
  },
  ["site-support-hours"],
  { tags: [SITE_SETTINGS_TAG], revalidate: REVALIDATE.merch },
);

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
  { tags: [SITE_SETTINGS_TAG], revalidate: REVALIDATE.merch },
);
