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

export type SettingsSupportHours = {
  startHour: number;
  endHour: number;
  label: string;
};

export type SettingsDoc = {
  key: "site";
  campaign: SettingsCampaign;
  support: SettingsSupportHours;
};

const settingsSchema = new Schema<SettingsDoc>({
  key: { type: String, required: true, unique: true, default: "site" },
  campaign: {
    active: { type: Boolean, default: false },
    percent: { type: Number, default: 20 },
    title: { type: String, default: "جشنواره ملی‌کیدز" },
  },
  // 🕘 Live-chat support hours (Tehran-local, 24h) — the chat window
  // shows an outside-hours notice past these; editable in settings.
  support: {
    startHour: { type: Number, default: 9 },
    endHour: { type: Number, default: 21 },
    label: { type: String, default: "شنبه تا پنجشنبه، ۹ صبح تا ۹ شب" },
  },
});

export const SettingsModel: Model<SettingsDoc> =
  (models.Settings as Model<SettingsDoc>) ||
  model<SettingsDoc>("Settings", settingsSchema);
