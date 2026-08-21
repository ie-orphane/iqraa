"use client";

import { BookStatusIcon, TotalBooksIcon } from "@/components/book-status-icon";
import {
  BOOK_STATUS_BADGE,
  BOOK_STATUS_LABELS,
  BOOK_STATUS_STAT_COUNT,
  BOOK_STATUSES,
} from "@/lib/books";
import type { BookStatus } from "@/lib/books";
import {
  FunnelIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SquaresFourIcon,
  RowsIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type LibraryView = "list" | "grid";

export type LibraryFilters = {
  status?: BookStatus;
  category?: string;
  author?: string;
  q?: string;
  view: LibraryView;
};

export type LibraryStats = {
  total: number;
  wantToRead: number;
  reading: number;
  finished: number;
  readLater: number;
  incomplete: number;
};

function libraryHref(filters: {
  status?: string;
  category?: string;
  author?: string;
  q?: string;
  view?: LibraryView;
}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.category) params.set("category", filters.category);
  if (filters.author) params.set("author", filters.author);
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.view && filters.view !== "list") params.set("view", filters.view);
  const query = params.toString();
  return query ? `/library?${query}` : "/library";
}

export function LibraryStatsRow({ stats }: { stats: LibraryStats }) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      <div className="rounded-xl border border-border px-3 py-4 text-center">
        <p className="font-handjet text-2xl font-bold tabular-nums text-accent">
          {stats.total}
        </p>
        <p className="mt-0.5 flex items-center justify-center gap-1 text-[11px] text-muted">
          <span>
            <TotalBooksIcon className="size-4" />
          </span>
          <span>كل الكتب</span>
        </p>
      </div>
      {BOOK_STATUSES.map((status) => (
        <div
          key={status}
          className={`rounded-xl px-3 py-5 text-center ${BOOK_STATUS_BADGE[status]}`}
        >
          <p className="font-handjet text-2xl font-bold tabular-nums">
            {stats[BOOK_STATUS_STAT_COUNT[status]]}
          </p>
          <p className="mt-0.5 flex items-center justify-center gap-1 text-[11px] opacity-80">
            <span>
              <BookStatusIcon status={status} className="size-4" />
            </span>
            <span>{BOOK_STATUS_LABELS[status]}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

export function LibraryToolbar({
  filters,
  authors,
  categories,
  onAdd,
}: {
  filters: LibraryFilters;
  authors: string[];
  categories: string[];
  onAdd: () => void;
}) {
  const router = useRouter();
  const hasFilters = Boolean(
    filters.status || filters.category || filters.author || filters.q,
  );
  const [open, setOpen] = useState(hasFilters);
  const searchKey = filters.q ?? "";
  const [query, setQuery] = useState(searchKey);
  const [syncedKey, setSyncedKey] = useState(searchKey);
  if (searchKey !== syncedKey) {
    setSyncedKey(searchKey);
    setQuery(searchKey);
  }
  const extraCount = [
    filters.status,
    filters.category,
    filters.author,
    filters.q,
  ].filter(Boolean).length;

  useEffect(() => {
    const trimmed = query.trim();
    const current = searchKey.trim();
    if (trimmed === current) return;

    const timeout = window.setTimeout(() => {
      router.push(
        libraryHref({
          status: filters.status,
          category: filters.category,
          author: filters.author,
          view: filters.view,
          q: trimmed || undefined,
        }),
      );
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [
    query,
    searchKey,
    filters.status,
    filters.category,
    filters.author,
    filters.view,
    router,
  ]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="flex overflow-hidden rounded-md border border-border">
          <Link
            href={libraryHref({ ...filters, view: "list" })}
            aria-label="عرض قائمة"
            title="عرض قائمة"
            className={`inline-flex size-9 items-center justify-center transition ${
              filters.view === "list"
                ? "bg-accent text-surface"
                : "bg-surface text-muted hover:text-foreground"
            }`}
          >
            <RowsIcon className="size-4" weight="bold" />
          </Link>
          <Link
            href={libraryHref({ ...filters, view: "grid" })}
            aria-label="عرض شبكة"
            title="عرض شبكة"
            className={`inline-flex size-9 items-center justify-center transition ${
              filters.view === "grid"
                ? "bg-accent text-surface"
                : "bg-surface text-muted hover:text-foreground"
            }`}
          >
            <SquaresFourIcon className="size-4" weight="bold" />
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label="تصفية"
          title="تصفية"
          className={`inline-flex size-9 items-center justify-center rounded-md border transition ${
            open || extraCount
              ? "border-accent bg-accent/10 text-accent"
              : "border-border bg-surface text-foreground hover:bg-background"
          }`}
        >
          {extraCount ? (
            <span className="relative inline-flex">
              <FunnelSimpleIcon className="size-4" weight="bold" />
              <span className="absolute -start-1.5 -top-1.5 grid size-3.5 place-items-center rounded-full bg-accent text-[9px] text-surface">
                {extraCount}
              </span>
            </span>
          ) : (
            <FunnelIcon className="size-4" weight="bold" />
          )}
        </button>

        <button
          type="button"
          onClick={onAdd}
          aria-label="إضافة كتاب"
          title="إضافة كتاب"
          className="inline-flex size-9 items-center justify-center rounded-md bg-accent text-surface transition hover:opacity-90"
        >
          <PlusIcon weight="bold" className="size-4" />
        </button>
      </div>

      {open ? (
        <div className="grid gap-3 rounded-xl border border-border bg-surface p-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1 text-xs font-medium text-foreground sm:col-span-2 lg:col-span-4">
            بحث
            <span className="relative">
              <MagnifyingGlassIcon
                className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                weight="bold"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ابحث في العنوان، الكاتب، الملاحظات..."
                className="w-full rounded-lg border border-border bg-background py-2 pe-3 ps-9 text-sm font-normal outline-none focus:border-accent"
              />
            </span>
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
            الحالة
            <select
              value={filters.status ?? ""}
              onChange={(event) => {
                router.push(
                  libraryHref({
                    ...filters,
                    status: event.target.value || undefined,
                  }),
                );
              }}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal outline-none focus:border-accent"
            >
              <option value="">كل الحالات</option>
              {BOOK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {BOOK_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
            الكاتب
            <select
              value={filters.author ?? ""}
              onChange={(event) => {
                router.push(
                  libraryHref({
                    ...filters,
                    author: event.target.value || undefined,
                  }),
                );
              }}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal outline-none focus:border-accent"
            >
              <option value="">كل الكتّاب</option>
              {authors.map((author) => (
                <option key={author} value={author}>
                  {author}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs font-medium text-foreground sm:col-span-2 lg:col-span-2">
            التصنيف
            <select
              value={filters.category ?? ""}
              onChange={(event) => {
                router.push(
                  libraryHref({
                    ...filters,
                    category: event.target.value || undefined,
                  }),
                );
              }}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm font-normal outline-none focus:border-accent"
            >
              <option value="">كل التصنيفات</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
    </div>
  );
}
