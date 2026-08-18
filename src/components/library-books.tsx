"use client";

import {
  createBook,
  deleteBook,
  updateBook,
  type BookActionResult,
} from "@/actions/books";
import {
  BOOK_STATUS_BADGE,
  BOOK_STATUS_LABELS,
  BOOK_STATUSES,
} from "@/lib/books";
import {
  LibraryStatsRow,
  LibraryToolbar,
  type LibraryFilters,
  type LibraryStats,
} from "@/components/library-toolbar";
import type { Book } from "@prisma/client";
import {
  DotsThreeVertical,
  PencilSimple,
  PlusIcon,
  TrashIcon,
  X,
} from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState, useTransition } from "react";

type BookFields = Pick<
  Book,
  "id" | "title" | "author" | "pages" | "status" | "categories" | "notes"
>;

export function LibraryBooks({
  books,
  filters,
  authors,
  categories,
  stats,
}: {
  books: Book[];
  filters: LibraryFilters;
  authors: string[];
  categories: string[];
  stats: LibraryStats;
}) {
  const [modal, setModal] = useState<"create" | BookFields | null>(null);
  const isGrid = filters.view === "grid";

  return (
    <>
      <div className="flex flex-col gap-4">
      <LibraryStatsRow stats={stats} />

      <LibraryToolbar
        filters={filters}
        authors={authors}
        categories={categories}
        onAdd={() => setModal("create")}
      />

      {books.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center">
          <p className="text-muted">لا توجد كتب مطابقة.</p>
          <button
            type="button"
            onClick={() => setModal("create")}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-surface"
          >
            <PlusIcon weight="bold" className="size-4" />
            أضف كتابًا
          </button>
        </div>
      ) : (
        <ul
          className={
            isGrid
              ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
              : "flex flex-col gap-3"
          }
        >
          {books.map((book) => (
            <li
              key={book.id}
              className={`rounded-xl border border-border bg-surface p-4 ${
                isGrid
                  ? "relative flex flex-col gap-3"
                  : "flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              }`}
            >
              <div className={`min-w-0 ${isGrid ? "pe-10" : ""}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium text-foreground">
                    {book.title}
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${BOOK_STATUS_BADGE[book.status]}`}
                  >
                    {BOOK_STATUS_LABELS[book.status]}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm text-muted">{book.author}</p>
                {book.pages ? (
                  <p className="mt-1 text-xs text-muted">{book.pages} صفحة</p>
                ) : null}
                {(book.categories ?? []).length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(book.categories ?? []).map((category) => (
                      <span
                        key={category}
                        className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <BookCardActions
                layout={isGrid ? "grid" : "list"}
                bookId={book.id}
                title={book.title}
                onEdit={() => setModal(book)}
              />
            </li>
          ))}
        </ul>
      )}
      </div>

      {modal ? (
        <BookModal
          book={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
        />
      ) : null}
    </>
  );
}

function BookCardActions({
  layout,
  bookId,
  title,
  onEdit,
}: {
  layout: "list" | "grid";
  bookId: string;
  title: string;
  onEdit: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  if (layout === "list") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onEdit}
          aria-label="تعديل"
          title="تعديل"
          className="inline-flex size-9 items-center justify-center rounded-md border border-border text-foreground transition hover:bg-background"
        >
          <PencilSimple className="size-4" weight="bold" />
        </button>
        <DeleteBookButton bookId={bookId} title={title} />
      </div>
    );
  }

  return (
    <div ref={menuRef} className="absolute end-3 top-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="إجراءات"
        title="إجراءات"
        aria-expanded={open}
        className="inline-flex size-8 items-center justify-center rounded-md text-muted transition hover:bg-background hover:text-foreground"
      >
        <DotsThreeVertical className="size-5" weight="bold" />
      </button>
      {open ? (
        <div className="absolute end-0 top-full z-10 mt-1 min-w-36 overflow-hidden rounded-lg border border-border bg-surface py-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEdit();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-foreground transition hover:bg-background"
          >
            <PencilSimple className="size-4" weight="bold" />
            تعديل
          </button>
          <DeleteBookButton
            bookId={bookId}
            title={title}
            variant="menu"
            onDone={() => setOpen(false)}
          />
        </div>
      ) : null}
    </div>
  );
}

function DeleteBookButton({
  bookId,
  title,
  variant = "icon",
  onDone,
}: {
  bookId: string;
  title: string;
  variant?: "icon" | "menu";
  onDone?: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (!confirm(`حذف «${title}»؟`)) return;
    onDone?.();
    startTransition(async () => {
      await deleteBook(bookId);
    });
  }

  if (variant === "menu") {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={onDelete}
        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-700 transition hover:bg-red-50 disabled:opacity-60"
      >
        <TrashIcon className="size-4" weight="bold" />
        حذف
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      aria-label="حذف"
      title="حذف"
      onClick={onDelete}
      className="inline-flex size-9 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:bg-red-50 disabled:opacity-60"
    >
      <TrashIcon className="size-4" weight="bold" />
    </button>
  );
}

function BookModal({
  book,
  onClose,
}: {
  book: BookFields | null;
  onClose: () => void;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(book);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();

    const onCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, [onClose]);

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result: BookActionResult = isEdit
        ? await updateBook(book!.id, formData)
        : await createBook(formData);

      if (!result.ok) {
        setError(result.error);
        return;
      }
      onClose();
    });
  }

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center bg-transparent p-4 backdrop:bg-black/40 open:flex"
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-5 shadow-xl sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-lg font-semibold text-foreground">
            {isEdit ? "تعديل كتاب" : "إضافة كتاب"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted transition hover:bg-background hover:text-foreground"
          >
            <X className="size-5" weight="bold" />
          </button>
        </div>

        <form
          action={submit}
          className="flex flex-col gap-4"
          aria-labelledby={titleId}
        >
          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">
              عنوان الكتاب <span className="text-red-600">*</span>
            </span>
            <input
              name="title"
              required
              defaultValue={book?.title ?? ""}
              className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">
              الكاتب <span className="text-red-600">*</span>
            </span>
            <input
              name="author"
              required
              defaultValue={book?.author ?? ""}
              className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">عدد الصفحات</span>
            <input
              name="pages"
              type="number"
              min={1}
              defaultValue={book?.pages ?? ""}
              className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">
              الحالة <span className="text-red-600">*</span>
            </span>
            <select
              name="status"
              defaultValue={book?.status ?? "want_to_read"}
              className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-accent"
            >
              {BOOK_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {BOOK_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">التصنيفات</span>
            <input
              name="categories"
              defaultValue={(book?.categories ?? []).join("، ")}
              placeholder="رواية، تاريخ، فقه"
              className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-accent"
            />
            <span className="text-xs text-muted">
              افصل بين التصنيفات بفاصلة
            </span>
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">ملاحظات</span>
            <textarea
              name="notes"
              rows={3}
              defaultValue={book?.notes ?? ""}
              className="resize-y rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-accent"
            />
          </label>

          <div className="mt-1 flex gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-surface transition hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "جاري الحفظ..." : "حفظ"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
