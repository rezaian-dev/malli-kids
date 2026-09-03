import { connectMongoose } from "@/lib/db/mongoose";
import { SettingsModel, type SettingsCampaign } from "@/lib/db/models/settings";

const DEFAULT_CAMPAIGN: SettingsCampaign = {
  active: false,
  percent: 20,
  title: "جشنواره ملی‌کیدز",
};

/** ⚙️ The site's one real settings doc. No admin UI writes this yet (see
 *  `SettingsModel`'s comment) — reading returns sane defaults until one does. */
export async function getCampaign(): Promise<SettingsCampaign> {
  await connectMongoose();
  const doc = await SettingsModel.findOne({ key: "site" }).lean();
  return doc?.campaign ?? DEFAULT_CAMPAIGN;
}
