"use client";

import { updateBookStatus } from "@/actions/books";
import { BOOK_STATUS_LABELS, BOOK_STATUSES } from "@/lib/books";
import type { BookStatus } from "@prisma/client";

export function BookStatusSelect({
  bookId,
  status,
}: {
  bookId: string;
  status: BookStatus;
}) {
  return (
    <form action={updateBookStatus.bind(null, bookId)}>
      <select
        name="status"
        defaultValue={status}
        onChange={(event) => event.currentTarget.form?.requestSubmit()}
        className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
      >
        {BOOK_STATUSES.map((value) => (
          <option key={value} value={value}>
            {BOOK_STATUS_LABELS[value]}
          </option>
        ))}
      </select>
    </form>
  );
}
