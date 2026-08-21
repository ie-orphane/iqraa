"use client";

import {
  createBook,
  deleteBook,
  updateBook,
  type BookActionResult,
} from "@/actions/books";
import {
  BOOK_STATUS_LABELS,
  BOOK_STATUSES,
} from "@/lib/books";
import {
  LibraryStatsRow,
  LibraryToolbar,
  type LibraryFilters,
  type LibraryStats,
} from "@/components/library-toolbar";
import { BookStatusBadge } from "@/components/book-status-icon";
import type { Book } from "@prisma/client";
import Image from "next/image";
import {
  DotsThreeVertical,
  PencilSimple,
  PlusIcon,
  TrashIcon,
  X,
} from "@phosphor-icons/react";
import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState, useTransition } from "react";

type BookFields = Pick<
  Book,
  | "id"
  | "title"
  | "subtitle"
  | "author"
  | "pages"
  | "status"
  | "categories"
  | "notes"
  | "coverUrl"
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
              className={`relative rounded-xl border border-border bg-surface p-4 ${
                isGrid
                  ? "flex flex-col items-center gap-3 text-center"
                  : "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
              }`}
            >
              <div
                className={
                  isGrid
                    ? "flex w-full flex-col items-center px-8"
                    : "flex min-w-0 flex-1 items-start gap-3 pe-10 sm:pe-0"
                }
              >
                {book.coverUrl ? (
                  <div
                    className={
                      isGrid
                        ? "mb-1 w-full max-w-28 overflow-hidden rounded-lg border border-border shadow-sm"
                        : "w-20 shrink-0 overflow-hidden rounded-lg border border-border"
                    }
                  >
                    <Image
                      src={book.coverUrl}
                      alt=""
                      width={isGrid ? 112 : 80}
                      height={isGrid ? 70 : 50}
                      className="aspect-[1/1.6] w-full object-cover"
                      unoptimized
                    />
                  </div>
                ) : null}
                <div
                  className={
                    isGrid
                      ? "flex w-full flex-col items-center"
                      : "min-w-0 flex-1"
                  }
                >
                {isGrid ? <BookStatusBadge status={book.status} /> : null}
                <div
                  className={`flex flex-wrap items-center gap-2 ${
                    isGrid ? "mt-2 justify-center" : ""
                  }`}
                >
                  <p className="font-medium text-foreground">{book.title}</p>
                  {isGrid ? null : <BookStatusBadge status={book.status} />}
                </div>
                {book.subtitle ? (
                  <p className="mt-1 text-sm text-muted">{book.subtitle}</p>
                ) : null}
                {book.author ? (
                  <p className="mt-1 text-sm text-muted">{book.author}</p>
                ) : null}
                {book.pages ? (
                  <p className="mt-1 text-xs text-muted">{book.pages} صفحة</p>
                ) : null}
                {(book.categories ?? []).length > 0 ? (
                  <div
                    className={`mt-2 flex flex-wrap gap-1.5 ${
                      isGrid ? "justify-center" : ""
                    }`}
                  >
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
          authors={authors}
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
  if (layout === "list") {
    return (
      <>
        <div className="hidden sm:flex sm:flex-wrap sm:items-center sm:gap-2">
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
        <div className="sm:hidden">
          <CardActionsMenu bookId={bookId} title={title} onEdit={onEdit} />
        </div>
      </>
    );
  }

  return <CardActionsMenu bookId={bookId} title={title} onEdit={onEdit} />;
}

function CardActionsMenu({
  bookId,
  title,
  onEdit,
}: {
  bookId: string;
  title: string;
  onEdit: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
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

  function confirmDelete() {
    startTransition(async () => {
      await deleteBook(bookId);
      setConfirmOpen(false);
    });
  }

  return (
    <>
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
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                setOpen(false);
                setConfirmOpen(true);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-700 transition hover:bg-red-50 disabled:opacity-60"
            >
              <TrashIcon className="size-4" weight="bold" />
              حذف
            </button>
          </div>
        ) : null}
      </div>

      <DeleteConfirmModal
        title={title}
        open={confirmOpen}
        pending={pending}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}

function DeleteConfirmModal({
  title,
  open,
  pending,
  onClose,
  onConfirm,
}: {
  title: string;
  open: boolean;
  pending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-border bg-surface p-5 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="text-lg font-semibold text-foreground">
          حذف الكتاب
        </h2>
        <p className="mt-2 text-sm text-muted">
          هل تريد حذف «{title}»؟ لا يمكن التراجع عن هذا الإجراء.
        </p>
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {pending ? "جاري الحذف..." : "حذف"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onClose}
            className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-surface disabled:opacity-60"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function DeleteBookButton({
  bookId,
  title,
}: {
  bookId: string;
  title: string;
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function confirmDelete() {
    startTransition(async () => {
      await deleteBook(bookId);
      setConfirmOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        disabled={pending}
        aria-label="حذف"
        title="حذف"
        onClick={() => setConfirmOpen(true)}
        className="inline-flex size-9 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:bg-red-50 disabled:opacity-60"
      >
        <TrashIcon className="size-4" weight="bold" />
      </button>

      <DeleteConfirmModal
        title={title}
        open={confirmOpen}
        pending={pending}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDelete}
      />
    </>
  );
}

function BookCoverField({ existingUrl }: { existingUrl?: string | null }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(existingUrl ?? null);
  const [removeCover, setRemoveCover] = useState(false);
  const [coverError, setCoverError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    if (!file) {
      setPreview(existingUrl ?? null);
      setRemoveCover(false);
      setCoverError(null);
      return;
    }
    if (file.size > 11 * 1024 * 1024) {
      event.target.value = "";
      setPreview(existingUrl ?? null);
      setCoverError("حجم الصورة كبير جدًا (الحد الأقصى 11 ميغابايت).");
      return;
    }
    setCoverError(null);
    setPreview(URL.createObjectURL(file));
    setRemoveCover(false);
  }

  function onRemove() {
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setRemoveCover(true);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-2 text-sm">
      <span className="font-medium text-foreground">غلاف الكتاب</span>
      {preview ? (
        <div className="relative mx-auto w-20">
          <div className="overflow-hidden rounded-lg border border-border shadow-sm">
            <Image
              src={preview}
              alt=""
              width={80}
              height={50}
              className="aspect-[1/1.6] w-full object-cover"
              unoptimized
            />
          </div>
          <button
            type="button"
            onClick={onRemove}
            aria-label="إزالة الغلاف"
            title="إزالة الغلاف"
            className="absolute -end-1.5 -top-1.5 inline-flex size-6 items-center justify-center rounded-full border border-border bg-surface text-muted shadow-sm transition hover:bg-red-50 hover:text-red-700"
          >
            <X className="size-3.5" weight="bold" />
          </button>
        </div>
      ) : null}
      <input
        ref={inputRef}
        type="file"
        name="cover"
        accept="image/jpeg,image/png,image/webp"
        onChange={onFileChange}
        className="rounded-lg border border-border bg-background px-3 py-2 text-sm file:me-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-surface"
      />
      {removeCover ? <input type="hidden" name="removeCover" value="on" /> : null}
      {coverError ? <p className="text-xs text-red-700">{coverError}</p> : null}
      <span className="text-xs text-muted">
        JPG أو PNG أو WebP — حتى 11 ميغابايت
      </span>
    </div>
  );
}

function BookModal({
  book,
  authors,
  onClose,
}: {
  book: BookFields | null;
  authors: string[];
  onClose: () => void;
}) {
  const titleId = useId();
  const authorListId = useId();
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
      className="fixed inset-0 z-50 m-0 flex h-full max-h-none w-full max-w-none items-center justify-center overflow-hidden bg-transparent p-4 backdrop:bg-black/40 open:flex"
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="flex max-h-[calc(100dvh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xl">
        <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-5 sm:px-6 sm:pt-6">
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
          encType="multipart/form-data"
          className="flex min-h-0 flex-1 flex-col"
          aria-labelledby={titleId}
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4">
          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <BookCoverField existingUrl={book?.coverUrl} />

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
            <span className="font-medium text-foreground">العنوان الفرعي</span>
            <input
              name="subtitle"
              defaultValue={book?.subtitle ?? ""}
              className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">الكاتب</span>
            <input
              name="author"
              list={authorListId}
              defaultValue={book?.author ?? ""}
              autoComplete="off"
              className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-accent"
            />
            <datalist id={authorListId}>
              {authors.map((author) => (
                <option key={author} value={author} />
              ))}
            </datalist>
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
            </div>
          </div>

          <div className="flex shrink-0 gap-3 border-t border-border px-5 py-4 sm:px-6">
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
