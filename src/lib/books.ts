import type { BookStatus } from "@prisma/client";

export const BOOK_STATUS_LABELS: Record<BookStatus, string> = {
  want_to_read: "أريد قراءته",
  reading: "أقرأه الآن",
  finished: "أنهيت قراءته",
};

export const BOOK_STATUSES: BookStatus[] = [
  "want_to_read",
  "reading",
  "finished",
];
