// 📏 Single source of truth for size↔height↔age↔chest — /size-guide and the PDP tab both read this.
export type SizeRow = {
  size: string;
  heightMin: number;
  heightMax: number;
  ageLabel: string;
  chestCm: number;
  waistCm: number;
};

export const SIZE_TABLE: SizeRow[] = [
  {
    size: "۸۰",
    heightMin: 74,
    heightMax: 80,
    ageLabel: "۹–۱۲ ماه",
    chestCm: 50,
    waistCm: 48,
  },
  {
    size: "۸۶",
    heightMin: 80,
    heightMax: 86,
    ageLabel: "۱۲–۱۸ ماه",
    chestCm: 52,
    waistCm: 50,
  },
  {
    size: "۹۲",
    heightMin: 86,
    heightMax: 92,
    ageLabel: "۱۸–۲۴ ماه",
    chestCm: 54,
    waistCm: 51,
  },
  {
    size: "۹۸",
    heightMin: 92,
    heightMax: 98,
    ageLabel: "۲–۳ سال",
    chestCm: 56,
    waistCm: 52,
  },
  {
    size: "۱۰۴",
    heightMin: 98,
    heightMax: 104,
    ageLabel: "۳–۴ سال",
    chestCm: 58,
    waistCm: 53,
  },
  {
    size: "۱۱۰",
    heightMin: 104,
    heightMax: 110,
    ageLabel: "۴–۵ سال",
    chestCm: 60,
    waistCm: 54,
  },
  {
    size: "۱۱۶",
    heightMin: 110,
    heightMax: 116,
    ageLabel: "۵–۶ سال",
    chestCm: 62,
    waistCm: 55,
  },
  {
    size: "۱۲۲",
    heightMin: 116,
    heightMax: 122,
    ageLabel: "۶–۷ سال",
    chestCm: 64,
    waistCm: 56,
  },
];

/** 📐 Height (cm) → the smallest size whose range still covers it; taller
 *  than the table's top row just gets the biggest size we carry. */
export function sizeForHeightCm(heightCm: number): string {
  for (const row of SIZE_TABLE) {
    if (heightCm <= row.heightMax) return row.size;
  }
  return SIZE_TABLE[SIZE_TABLE.length - 1].size;
}
