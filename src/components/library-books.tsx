"use client";

import {
  createBook,
  deleteBook,
  updateBook,
  type BookActionResult,
} from "@/actions/books";
import { BookStatusSelect } from "@/components/book-status-select";
import { BOOK_STATUS_LABELS, BOOK_STATUSES } from "@/lib/books";
import type { Book } from "@prisma/client";
import {
  PencilSimple,
  Plus,
  Trash,
  X,
} from "@phosphor-icons/react";
import { useEffect, useId, useRef, useState, useTransition } from "react";

type BookFields = Pick<Book, "id" | "title" | "author" | "pages" | "status" | "notes">;

export function LibraryBooks({ books }: { books: Book[] }) {
  const [modal, setModal] = useState<"create" | BookFields | null>(null);

  return (
    <>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setModal("create")}
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-surface transition hover:opacity-90"
        >
          <Plus weight="bold" className="size-4" />
          إضافة كتاب
        </button>
      </div>

      {books.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center">
          <p className="text-muted">لا توجد كتب بعد.</p>
          <button
            type="button"
            onClick={() => setModal("create")}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-surface"
          >
            <Plus weight="bold" className="size-4" />
            أضف كتابًا
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          {books.map((book) => (
            <li
              key={book.id}
              className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {book.title}
                </p>
                <p className="truncate text-sm text-muted">{book.author}</p>
                <p className="mt-1 text-xs text-muted">
                  {book.pages ? `${book.pages} صفحة · ` : null}
                  {BOOK_STATUS_LABELS[book.status]}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <BookStatusSelect bookId={book.id} status={book.status} />

                <button
                  type="button"
                  onClick={() => setModal(book)}
                  aria-label="تعديل"
                  title="تعديل"
                  className="inline-flex size-9 items-center justify-center rounded-md border border-border text-foreground transition hover:bg-background"
                >
                  <PencilSimple className="size-4" weight="bold" />
                </button>

                <DeleteBookButton bookId={book.id} title={book.title} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal ? (
        <BookModal
          book={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
        />
      ) : null}
    </>
  );
}

function DeleteBookButton({
  bookId,
  title,
}: {
  bookId: string;
  title: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-label="حذف"
      title="حذف"
      onClick={() => {
        if (!confirm(`حذف «${title}»؟`)) return;
        startTransition(async () => {
          await deleteBook(bookId);
        });
      }}
      className="inline-flex size-9 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:bg-red-50 disabled:opacity-60"
    >
      <Trash className="size-4" weight="bold" />
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

        <form action={submit} className="flex flex-col gap-4" aria-labelledby={titleId}>
          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">عنوان الكتاب</span>
            <input
              name="title"
              required
              defaultValue={book?.title ?? ""}
              className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">الكاتب</span>
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
            <span className="font-medium text-foreground">الحالة</span>
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
