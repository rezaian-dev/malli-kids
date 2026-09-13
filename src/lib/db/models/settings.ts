import "server-only";
import { Schema, model, models, type Model } from "mongoose";

// Site-wide settings use one document keyed by site.
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
  // Live-chat support hours (Tehran-local, 24h); editable in settings.
  support: {
    startHour: { type: Number, default: 9 },
    endHour: { type: Number, default: 21 },
    label: { type: String, default: "شنبه تا پنجشنبه، ۹ صبح تا ۹ شب" },
  },
});

export const SettingsModel: Model<SettingsDoc> =
  (models.Settings as Model<SettingsDoc>) ||
  model<SettingsDoc>("Settings", settingsSchema);
