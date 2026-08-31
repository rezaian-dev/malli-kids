import type { Product } from "@/types";
import { parseFaPrice } from "../format";

const BASE: Omit<Product, "id">[] = [
  {
    img: "/brand/look-party.jpg",
    name: "پیراهن مجلسی الماسِ طلایی",
    cat: "دخترانه",
    season: "بهاره",
    price: 2480000,
    old: 2980000,
    disc: "۱۷٪",
    rate: 4.9,
    badge: "پرفروش",
    stock: true,
    sold: 312,
    desc: "پارچه ساتن درجه‌یک با پولک‌دوزی دستی؛ انتخاب اول مادران برای مهمانی‌ها و جشن‌های تولد.",
  },
  {
    img: "/brand/cat-girl.jpg",
    name: "پالتوی شتری با کلاه برت",
    cat: "دخترانه",
    season: "زمستانه",
    price: 2150000,
    rate: 4.8,
    badge: "جدید",
    stock: true,
    sold: 186,
    desc: "پشم مرینوس نرم با آستر کتان؛ گرم، سبک و ضدحساسیت برای روزهای سرد.",
  },
  {
    img: "/brand/cat-boy.jpg",
    name: "ست پیراهن و بند شلوار کلاسیک",
    cat: "پسرانه",
    season: "بهاره",
    price: 1680000,
    rate: 4.7,
    stock: true,
    sold: 154,
    desc: "کتان ارگانیک با الگوی آزاد؛ راحت برای بازی و شیک برای مهمانی.",
  },
  {
    img: "/brand/cat-baby.jpg",
    name: "ست سیسمونی مریم (۷ تکه)",
    cat: "سیسمونی",
    season: "بهاره",
    price: 3240000,
    rate: 5.0,
    badge: "منتخب مادران",
    stock: true,
    sold: 241,
    desc: "هفت تکه‌ی کامل از پنبه‌ی ارگانیک؛ لطیف برای پوست نوزاد با بسته‌بندی کادویی.",
  },
  {
    img: "/brand/hero-dress.jpg",
    name: "پیراهن توتوی صورتی پرنسسی",
    cat: "دخترانه",
    season: "تابستانه",
    price: 1980000,
    old: 2300000,
    disc: "۱۴٪",
    rate: 4.8,
    stock: true,
    sold: 198,
    desc: "سه لایه تور نرم با دامن پفی؛ رؤیای هر دختر کوچولو برای جشن‌ها.",
  },
  {
    img: "/brand/cat-boy.jpg",
    name: "سرهمی لینن بژ خوان",
    cat: "پسرانه",
    season: "تابستانه",
    price: 1290000,
    rate: 4.6,
    badge: "جدید",
    stock: false,
    sold: 67,
    desc: "لینن خنک و سبک برای تابستان؛ با دکمه‌های چوبی دست‌ساز.",
  },
  {
    img: "/brand/look-party.jpg",
    name: "پیراهن پولک‌دوزی طلایی",
    cat: "دخترانه",
    season: "پاییزه",
    price: 2920000,
    rate: 4.9,
    badge: "پرفروش",
    stock: true,
    sold: 274,
    desc: "پولک‌دوزی تمام‌دست روی ساتن ابریشمی؛ درخشش خاص برای شب‌های خاص.",
  },
  {
    img: "/brand/cat-baby.jpg",
    name: "سرهمی تابستانه مینیمال",
    cat: "سیسمونی",
    season: "تابستانه",
    price: 980000,
    old: 1150000,
    disc: "۱۵٪",
    rate: 4.7,
    stock: true,
    sold: 129,
    desc: "پنبه‌ی سبک و تنفس‌پذیر؛ آزاد و راحت برای خواب و بازی نوزاد.",
  },
];

const extras = ["ساده", "کلاسیک", "نخی", "مخمل", "تابستانه", "زمستانه"];

function normalize(raw: Omit<Product, "id"> & { price: number }): Product {
  return { ...raw, id: 0 };
}

export const SEASONS = ["بهاره", "تابستانه", "پاییزه", "زمستانه"] as const;

export const CORE_PRODUCTS: Product[] = BASE.map((p, i) => ({
  ...p,
  id: i,
  price: Number(p.price),
  season: p.season ?? SEASONS[i % SEASONS.length],
}));

export const CATALOG: Product[] = (() => {
  const out: Product[] = [];
  for (let r = 0; r < 3; r++) {
    CORE_PRODUCTS.forEach((src, i) => {
      const p: Product = {
        ...src,
        img: CORE_PRODUCTS[(i + r) % CORE_PRODUCTS.length].img,
        name: r ? `${src.name} — ${extras[r % extras.length]}` : src.name,
        season:
          SEASONS[
            (SEASONS.indexOf(src.season ?? SEASONS[0]) + r) % SEASONS.length
          ],
        stock: r === 2 && i % 5 === 0 ? false : src.stock,
        badge: r === 1 && i % 4 === 0 ? "پرفروش" : src.badge,
        disc: r === 1 && i % 4 === 0 ? src.disc || "۱۱٪" : src.disc,
        id: out.length,
      };
      out.push(p);
    });
  }
  return out;
})();

export function getProductById(id: number): Product | undefined {
  return (
    CATALOG.find((p) => p.id === id) ?? CORE_PRODUCTS[id % CORE_PRODUCTS.length]
  );
}

export function pdpHref(id: number) {
  return `/product/${id % 8}`;
}

void parseFaPrice;
void normalize;
