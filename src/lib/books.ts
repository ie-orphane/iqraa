export const BOOK_STATUSES = [
  "read_later",
  "want_to_read",
  "reading",
  "finished",
  "incomplete",
] as const;

export type BookStatus = (typeof BOOK_STATUSES)[number];

export const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
  want_to_read: "أريد قراءته",
  reading: "أقرأه الآن",
  finished: "أنهيت قراءته",
  read_later: "للقراءة لاحقًا",
  incomplete: "غير مكتمل",
};

export const BOOK_STATUS_BADGE: Record<BookStatus, string> = {
  want_to_read: "border border-amber-900/12.5 text-amber-900",
  reading: "border border-sky-900/12.5 text-sky-900",
  finished: "border border-emerald-900/12.5 text-emerald-900",
  read_later: "border border-violet-900/12.5 text-violet-900",
  incomplete: "border border-rose-900/12.5 text-rose-900",
};

export const BOOK_STATUS_STAT_COUNT: Record<
  BookStatus,
  "wantToRead" | "reading" | "finished" | "readLater" | "incomplete"
> = {
  want_to_read: "wantToRead",
  reading: "reading",
  finished: "finished",
  read_later: "readLater",
  incomplete: "incomplete",
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
