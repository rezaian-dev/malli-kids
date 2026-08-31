import { CATALOG } from "@/lib/data/products";
import { ARTICLES } from "@/lib/data/pages";
import { BRAND } from "@/lib/constants";
import type { Product } from "@/types";
import { seedBanners } from "@/lib/festive/occasions";
import type {
  FestiveBanner,
  OrderStatus,
  PayStatus,
  AdminOrderItem,
  AdminOrder,
  AdminCustomer,
  AdminCoupon,
  AdminReview,
  AdminArticle,
  AdminMessage,
  AdminSettings,
  AdminDb,
} from "@/types";

export const ADMIN_CREDS = { user: "admin", pass: "Malli1405" };

function money(items: AdminOrderItem[], rate = 0) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = Math.round(subtotal * rate);
  const after = subtotal - discount;
  const shipping = after >= BRAND.freeShipFrom ? 0 : 85000;
  return { subtotal, discount, shipping, total: after + shipping };
}

const p = CATALOG;

export function seedAdminDb(): AdminDb {
  const o1 = [
    {
      id: p[0].id,
      name: p[0].name,
      img: p[0].img,
      size: "۹۸",
      qty: 1,
      price: p[0].price,
    },
    {
      id: p[7].id,
      name: p[7].name,
      img: p[7].img,
      size: "۸۶",
      qty: 1,
      price: p[7].price,
    },
  ];
  const o2 = [
    {
      id: p[3].id,
      name: p[3].name,
      img: p[3].img,
      size: "۸۰",
      qty: 1,
      price: p[3].price,
    },
  ];
  const o3 = [
    {
      id: p[2].id,
      name: p[2].name,
      img: p[2].img,
      size: "۱۰۴",
      qty: 2,
      price: p[2].price,
    },
  ];
  const o4 = [
    {
      id: p[4].id,
      name: p[4].name,
      img: p[4].img,
      size: "۹۲",
      qty: 1,
      price: p[4].price,
    },
  ];
  const o5 = [
    {
      id: p[1].id,
      name: p[1].name,
      img: p[1].img,
      size: "۱۱۰",
      qty: 1,
      price: p[1].price,
    },
  ];
  const o6 = [
    {
      id: p[6].id,
      name: p[6].name,
      img: p[6].img,
      size: "۹۸",
      qty: 1,
      price: p[6].price,
    },
  ];

  const m1 = money(o1, 0.1);
  const m2 = money(o2);
  const m3 = money(o3);
  const m4 = money(o4, 0.1);
  const m5 = money(o5);
  const m6 = money(o6);

  return {
    products: CATALOG.map((x) => ({ ...x })),
    orders: [
      {
        id: "MK-1405-1842",
        date: "۱۴۰۵/۰۶/۰۱",
        customer: "سارا محمدی",
        phone: "09121234567",
        city: "تهران",
        address: "ولیعصر، گالری ملی‌کیدز",
        items: o1,
        ...m1,
        coupon: "MALLI10",
        status: "جدید",
        pay: "پرداخت‌شده",
      },
      {
        id: "MK-1405-1836",
        date: "۱۴۰۵/۰۵/۳۱",
        customer: "نگار احمدی",
        phone: "09125551212",
        city: "اصفهان",
        address: "خیابان چهارباغ",
        items: o2,
        ...m2,
        status: "در حال آماده‌سازی",
        pay: "پرداخت‌شده",
      },
      {
        id: "MK-1405-1821",
        date: "۱۴۰۵/۰۵/۲۹",
        customer: "مریم رضایی",
        phone: "09351230011",
        city: "شیراز",
        address: "ستارخان، پلاک ۱۲",
        items: o3,
        ...m3,
        status: "ارسال‌شده",
        pay: "پرداخت‌شده",
      },
      {
        id: "MK-1405-1804",
        date: "۱۴۰۵/۰۵/۲۷",
        customer: "الهام کریمی",
        phone: "09197778899",
        city: "مشهد",
        address: "احمدآباد",
        items: o4,
        ...m4,
        coupon: "MALLI10",
        status: "تحویل‌شده",
        pay: "پرداخت‌شده",
      },
      {
        id: "MK-1405-1788",
        date: "۱۴۰۵/۰۵/۲۴",
        customer: "نیلوفر حسینی",
        phone: "09212223344",
        city: "کرج",
        address: "گوهردشت",
        items: o5,
        ...m5,
        status: "مرجوعی",
        pay: "پرداخت‌شده",
        note: "سایز کوچک بود",
      },
      {
        id: "MK-1405-1760",
        date: "۱۴۰۵/۰۵/۲۰",
        customer: "هستی نادری",
        phone: "09106667788",
        city: "تبریز",
        address: "ولیعصر تبریز",
        items: o6,
        ...m6,
        status: "تحویل‌شده",
        pay: "پرداخت‌شده",
      },
    ],
    customers: [
      {
        id: "admin-1",
        firstName: "مدیر",
        lastName: "گالری",
        phone: "02126401234",
        email: "admin@mallikids.ir",
        city: "تهران",
        orders: 0,
        spent: 0,
        joined: "۱۴۰۴/۰۱/۰۱",
        role: "admin",
        status: "فعال",
      },
      {
        id: "c1",
        firstName: "سارا",
        lastName: "محمدی",
        phone: "09121234567",
        email: "sara@mail.com",
        city: "تهران",
        orders: 4,
        spent: 8120000,
        childName: "آوا",
        joined: "۱۴۰۴/۱۱/۰۲",
        role: "user",
      },
      {
        id: "c2",
        firstName: "نگار",
        lastName: "احمدی",
        phone: "09125551212",
        email: "negar@mail.com",
        city: "اصفهان",
        orders: 2,
        spent: 3240000,
        childName: "رادین",
        joined: "۱۴۰۵/۰۱/۱۸",
        role: "user",
      },
      {
        id: "c3",
        firstName: "مریم",
        lastName: "رضایی",
        phone: "09351230011",
        email: "maryam@mail.com",
        city: "شیراز",
        orders: 3,
        spent: 5460000,
        childName: "کیان",
        joined: "۱۴۰۴/۰۸/۰۹",
        role: "user",
      },
      {
        id: "c4",
        firstName: "الهام",
        lastName: "کریمی",
        phone: "09197778899",
        email: "elham@mail.com",
        city: "مشهد",
        orders: 1,
        spent: 1782000,
        childName: "نیکا",
        joined: "۱۴۰۵/۰۵/۱۲",
        role: "user",
      },
      {
        id: "c5",
        firstName: "نیلوفر",
        lastName: "حسینی",
        phone: "09212223344",
        email: "nilou@mail.com",
        city: "کرج",
        orders: 2,
        spent: 2150000,
        childName: "رستا",
        joined: "۱۴۰۵/۰۳/۰۴",
        role: "user",
      },
    ],
    coupons: [
      {
        code: "MALLI10",
        title: "تخفیف عضویت",
        rate: 0.1,
        used: 186,
        cap: 1000,
        active: true,
        min: 0,
        until: "۱۴۰۵/۱۲/۲۹",
      },
      {
        code: "FALL15",
        title: "پاییزه",
        rate: 0.15,
        used: 42,
        cap: 200,
        active: true,
        min: 1500000,
        until: "۱۴۰۵/۰۸/۳۰",
      },
      {
        code: "WELCOME",
        title: "اولین خرید",
        rate: 0.08,
        used: 310,
        cap: 500,
        active: false,
        min: 0,
        until: "۱۴۰۵/۰۶/۳۱",
      },
    ],
    reviews: [
      {
        id: "r1",
        product: p[0].name,
        author: "سارا محمدی",
        rate: 5,
        text: "دوخت تمیز و پارچه نرم؛ برای جشن تولد عالی بود.",
        date: "۱۴۰۵/۰۵/۲۸",
        visible: true,
      },
      {
        id: "r2",
        product: p[3].name,
        author: "نگار احمدی",
        rate: 5,
        text: "سیسمونی کامل و بسته‌بندی کادویی.",
        date: "۱۴۰۵/۰۵/۲۲",
        visible: true,
      },
      {
        id: "r3",
        product: p[2].name,
        author: "مریم رضایی",
        rate: 4,
        text: "شیک است؛ بند شلوار کمی سفت بود.",
        date: "۱۴۰۵/۰۵/۱۸",
        visible: true,
      },
      {
        id: "r4",
        product: p[1].name,
        author: "هستی نادری",
        rate: 3,
        text: "رنگ کمی تیره‌تر از عکس بود.",
        date: "۱۴۰۵/۰۵/۱۰",
        visible: false,
      },
    ],
    articles: ARTICLES.map((a, i) => ({
      slug: a.slug,
      tag: a.tag,
      title: a.title,
      excerpt: a.excerpt,
      body: a.body,
      published: true,
      date: ["۱۴۰۵/۰۵/۱۲", "۱۴۰۵/۰۴/۲۰", "۱۴۰۵/۰۳/۰۸"][i] || "۱۴۰۵/۰۲/۰۱",
    })),
    messages: [
      {
        id: "m1",
        name: "سحر کاظمی",
        phone: "09120001122",
        text: "برای سایز ۹۸ پالتو موجود است؟",
        date: "۱۴۰۵/۰۶/۰۱",
        read: false,
      },
      {
        id: "m2",
        name: "مینا عباسی",
        phone: "09351112233",
        text: "ساعت بازدید گالری ولیعصر؟",
        date: "۱۴۰۵/۰۵/۳۰",
        read: false,
      },
      {
        id: "m3",
        name: "پریسا نوری",
        phone: "09196665544",
        text: "کد MALLI10 روی سیسمونی اعمال نشد.",
        date: "۱۴۰۵/۰۵/۲۷",
        read: true,
      },
    ],
    banners: seedBanners(),
    settings: {
      freeShipFrom: BRAND.freeShipFrom,
      phoneFa: BRAND.phoneFa,
      address: BRAND.address,
      otpDemo: "12345",
      storeOpen: true,
      campaign: { active: false, percent: 20, title: "جشنواره ملی‌کیدز" },
    },
  };
}

export const ORDER_FLOW: OrderStatus[] = [
  "جدید",
  "در حال آماده‌سازی",
  "ارسال‌شده",
  "تحویل‌شده",
  "مرجوعی",
];

export function statusTone(s: OrderStatus) {
  if (s === "جدید") return "bg-gold/20 text-gold-deep dark:text-gold-soft";
  if (s === "در حال آماده‌سازی")
    return "bg-navy/10 text-navy dark:bg-navy-mid dark:text-ivory";
  if (s === "ارسال‌شده")
    return "bg-gold-pale text-navy dark:bg-dusk-mid dark:text-gold-soft";
  if (s === "تحویل‌شده")
    return "bg-sand text-navy dark:bg-slate dark:text-ivory";
  return "bg-rose-pale text-rose";
}
