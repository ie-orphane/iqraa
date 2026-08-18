export const BOOK_STATUSES = [
  "want_to_read",
  "reading",
  "finished",
] as const;

export type BookStatus = (typeof BOOK_STATUSES)[number];

export const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
  want_to_read: "أريد قراءته",
  reading: "أقرأه الآن",
  finished: "أنهيت قراءته",
};

export const BOOK_STATUS_BADGE: Record<BookStatus, string> = {
  want_to_read: "bg-amber-100 text-amber-900",
  reading: "bg-sky-100 text-sky-900",
  finished: "bg-emerald-100 text-emerald-900",
};

export function parseCategories(value: string): string[] {
  return value
    .split(/[,،]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

export function isBookStatus(value: string | undefined): value is BookStatus {
  return Boolean(value && BOOK_STATUSES.includes(value as BookStatus));
}
