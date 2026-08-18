"use client";

import {
  BOOK_STATUS_LABELS,
  BOOK_STATUSES,
} from "@/lib/books";
import type { BookStatus } from "@/lib/books";
import {
  Funnel,
  FunnelSimple,
  PlusIcon,
  SquaresFour,
  Rows,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type LibraryView = "list" | "grid";

export type LibraryFilters = {
  status?: BookStatus;
  category?: string;
  author?: string;
  view: LibraryView;
};

export type LibraryStats = {
  total: number;
  wantToRead: number;
  reading: number;
  finished: number;
  pages: number;
};

function libraryHref(filters: {
  status?: string;
  category?: string;
  author?: string;
  view?: LibraryView;
}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.category) params.set("category", filters.category);
  if (filters.author) params.set("author", filters.author);
  if (filters.view && filters.view !== "list") params.set("view", filters.view);
  const query = params.toString();
  return query ? `/library?${query}` : "/library";
}

export function LibraryStatsRow({ stats }: { stats: LibraryStats }) {
  const items = [
    { label: "كل الكتب", value: stats.total },
    { label: "أقرأه الآن", value: stats.reading },
    { label: "أنهيتها", value: stats.finished },
    { label: "أريد قراءتها", value: stats.wantToRead },
    { label: "الصفحات", value: stats.pages },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-border bg-surface px-3 py-3 text-center"
        >
          <p className="font-handjet text-2xl font-bold tabular-nums text-accent">
            {item.value}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">{item.label}</p>
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
    filters.status || filters.category || filters.author,
  );
  const [open, setOpen] = useState(hasFilters);
  const extraCount = [filters.status, filters.category, filters.author].filter(
    Boolean,
  ).length;

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
            <Rows className="size-4" weight="bold" />
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
            <SquaresFour className="size-4" weight="bold" />
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
              <FunnelSimple className="size-4" weight="bold" />
              <span className="absolute -start-1.5 -top-1.5 grid size-3.5 place-items-center rounded-full bg-accent text-[9px] text-surface">
                {extraCount}
              </span>
            </span>
          ) : (
            <Funnel className="size-4" weight="bold" />
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
        <div className="grid gap-3 rounded-xl border border-border bg-surface p-3 sm:grid-cols-3">
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

          <label className="flex flex-col gap-1 text-xs font-medium text-foreground">
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
