import type {
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/lib/shop/tickets";

// 🏷️ Mirrors the server-only lib/shop/tickets.ts value lists so client code can import labels directly.

export const TICKET_STATUS_META: Record<
  TicketStatus,
  { admin: string; customer: string }
> = {
  open: { admin: "در انتظار پاسخ", customer: "در انتظار پاسخ" },
  pending: { admin: "در انتظار مشتری", customer: "نیازمند پاسخ شما" },
  answered: { admin: "پاسخ داده شده", customer: "پاسخ داده شد" },
  closed: { admin: "بسته شده", customer: "بسته شده" },
};

export const TICKET_CATEGORY_LABEL: Record<TicketCategory, string> = {
  order: "پیگیری سفارش",
  return: "مرجوعی و تعویض",
  sizing: "راهنمای سایز",
  quality: "کیفیت محصول",
  other: "سایر",
};

export const TICKET_CATEGORY_VALUES: TicketCategory[] = [
  "order",
  "return",
  "sizing",
  "quality",
  "other",
];

export const TICKET_PRIORITY_LABEL: Record<TicketPriority, string> = {
  normal: "عادی",
  high: "مهم",
  urgent: "فوری",
};

export const TICKET_PRIORITY_VALUES: TicketPriority[] = [
  "normal",
  "high",
  "urgent",
];
