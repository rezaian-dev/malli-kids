import "server-only";
import { Schema, model, models, type Model } from "mongoose";

// ⚙️ One singleton document (`key: "site"`) — currently backs only the
// storefront's site-wide campaign banner (see `store-provider.tsx`). No
// admin UI edits this yet (none exists in `ADMIN_NAV`); it's real and
// server-action-ready for whenever one is added.
export type SettingsCampaign = {
  active: boolean;
  percent: number;
  title: string;
};

export type SettingsDoc = {
  key: "site";
  campaign: SettingsCampaign;
};

const settingsSchema = new Schema<SettingsDoc>({
  key: { type: String, required: true, unique: true, default: "site" },
  campaign: {
    active: { type: Boolean, default: false },
    percent: { type: Number, default: 20 },
    title: { type: String, default: "جشنواره ملی‌کیدز" },
  },
});

export const SettingsModel: Model<SettingsDoc> =
  (models.Settings as Model<SettingsDoc>) ||
  model<SettingsDoc>("Settings", settingsSchema);
