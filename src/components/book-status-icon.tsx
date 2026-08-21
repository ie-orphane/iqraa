"use client";

import type { BookStatus } from "@/lib/books";
import { BOOK_STATUS_BADGE, BOOK_STATUS_LABELS } from "@/lib/books";
import {
  BookmarkSimpleIcon,
  BooksIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockCountdownIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";

type StatusIcon = ComponentType<{ className?: string; weight?: "bold" }>;

const BOOK_STATUS_ICONS: Record<BookStatus, StatusIcon> = {
  want_to_read: BookmarkSimpleIcon,
  reading: BookOpenIcon,
  finished: CheckCircleIcon,
  read_later: ClockCountdownIcon,
  incomplete: WarningCircleIcon,
};

export function BookStatusIcon({
  status,
  className = "size-4",
}: {
  status: BookStatus;
  className?: string;
}) {
  const Icon = BOOK_STATUS_ICONS[status];
  return <Icon className={className} weight="bold" aria-hidden />;
}

export function BookStatusBadge({
  status,
  className = "",
}: {
  status: BookStatus;
  className?: string;
}) {
  return (
    <span
      title={BOOK_STATUS_LABELS[status]}
      aria-label={BOOK_STATUS_LABELS[status]}
      className={`inline-flex size-7 items-center justify-center rounded-full ${BOOK_STATUS_BADGE[status]} ${className}`}
    >
      <BookStatusIcon status={status} className="size-3.5" />
    </span>
  );
}

export function TotalBooksIcon({ className = "size-4" }: { className?: string }) {
  return <BooksIcon className={className} weight="bold" aria-hidden />;
}
