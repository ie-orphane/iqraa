"use client";

import {
  addLibraryBooks,
  addListOnlyBook,
  createList,
  deleteList,
  removeListItem,
  reorderListItems,
  setListPublic,
  updateList,
  type ListActionResult,
} from "@/actions/lists";
import { MAX_COVER_BYTES } from "@/lib/book-covers-shared";
import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowSquareOutIcon,
  ArrowUpIcon,
  BooksIcon,
  CheckIcon,
  CopyIcon,
  DotsThreeVerticalIcon,
  PencilSimpleIcon,
  PlusIcon,
  RowsIcon,
  SquaresFourIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

export type ListView = "list" | "grid";

export type ManagedListItem = {
  id: string;
  bookId: string | null;
  title: string;
  subtitle: string | null;
  author: string | null;
  pages: number | null;
  coverUrl: string | null;
  source: "library" | "list_only";
};

export type LibraryBookOption = {
  id: string;
  title: string;
  author: string | null;
  coverUrl: string | null;
};

export function ViewToggle({ view }: { view: ListView }) {
  const pathname = usePathname();

  function hrefFor(next: ListView) {
    return next === "grid" ? `${pathname}?view=grid` : pathname;
  }

  return (
    <div className="flex overflow-hidden rounded-md border border-border">
      <Link
        href={hrefFor("list")}
        aria-label="عرض قائمة"
        title="عرض قائمة"
        className={`inline-flex size-9 items-center justify-center transition ${
          view === "list"
            ? "bg-accent text-surface"
            : "bg-surface text-muted hover:text-foreground"
        }`}
      >
        <RowsIcon className="size-4" weight="bold" />
      </Link>
      <Link
        href={hrefFor("grid")}
        aria-label="عرض شبكة"
        title="عرض شبكة"
        className={`inline-flex size-9 items-center justify-center transition ${
          view === "grid"
            ? "bg-accent text-surface"
            : "bg-surface text-muted hover:text-foreground"
        }`}
      >
        <SquaresFourIcon className="size-4" weight="bold" />
      </Link>
    </div>
  );
}

function PublicSwitch({
  checked,
  disabled,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (next: boolean) => void;
  label: string;
}) {
  const id = useId();
  return (
    <div className="flex items-center gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={`inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-60 ${
          checked ? "justify-end bg-accent" : "justify-start bg-border"
        }`}
      >
        <span
          aria-hidden
          className="pointer-events-none block size-5 rounded-full bg-surface shadow-sm ring-0 transition-transform"
        />
      </button>
      <label htmlFor={id} className="cursor-pointer text-sm text-foreground">
        {label}
      </label>
    </div>
  );
}

export function ListsIndex({
  lists,
  view,
}: {
  lists: {
    id: string;
    title: string;
    description: string | null;
    isPublic: boolean;
    updatedAt: Date;
    _count: { items: number };
  }[];
  view: ListView;
}) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [editList, setEditList] = useState<(typeof lists)[number] | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isGrid = view === "grid";

  function onDelete(list: (typeof lists)[number]) {
    if (!confirm(`حذف قائمة «${list.title}»؟`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteList(list.id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground">قوائمي</h1>
          <p className="mt-1 text-sm text-muted">
            أنشئ قوائم كتب وشاركها برابط عام.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ViewToggle view={view} />
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            aria-label="قائمة جديدة"
            title="قائمة جديدة"
            className="inline-flex size-9 items-center justify-center rounded-md bg-accent text-surface transition hover:opacity-90"
          >
            <PlusIcon className="size-4" weight="bold" />
          </button>
        </div>
      </div>

      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {lists.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center">
          <p className="text-muted">لا توجد قوائم بعد.</p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-surface"
          >
            <PlusIcon className="size-4" weight="bold" />
            أنشئ قائمتك الأولى
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
          {lists.map((list) => (
            <li
              key={list.id}
              className={`relative rounded-xl border border-border bg-surface p-4 ${
                isGrid
                  ? "flex flex-col gap-3"
                  : "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
              }`}
            >
              <Link
                href={`/lists/${list.id}`}
                className={`min-w-0 flex-1 ${isGrid ? "pe-8" : "pe-10 sm:pe-0"}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium text-foreground">
                    {list.title}
                  </p>
                  {list.isPublic ? (
                    <span className="rounded-full border border-emerald-900/15 px-2 py-0.5 text-[11px] text-emerald-900">
                      عامة
                    </span>
                  ) : (
                    <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted">
                      خاصة
                    </span>
                  )}
                </div>
                {list.description ? (
                  <p className="mt-1 line-clamp-2 text-sm text-muted">
                    {list.description}
                  </p>
                ) : null}
                <p className="mt-1 text-xs text-muted">
                  {list._count.items} كتاب
                </p>
              </Link>

              <ListCardActions
                layout={isGrid ? "grid" : "list"}
                pending={pending}
                onEdit={() => setEditList(list)}
                onDelete={() => onDelete(list)}
              />
            </li>
          ))}
        </ul>
      )}

      {modalOpen ? (
        <CreateListModal onClose={() => setModalOpen(false)} />
      ) : null}

      {editList ? (
        <EditListModal
          list={editList}
          onClose={() => setEditList(null)}
          onDone={() => {
            setEditList(null);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function ListCardActions({
  layout,
  pending,
  onEdit,
  onDelete,
}: {
  layout: ListView;
  pending: boolean;
  onEdit: () => void;
  onDelete: () => void;
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
            <PencilSimpleIcon className="size-4" weight="bold" />
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onDelete}
            aria-label="حذف"
            title="حذف"
            className="inline-flex size-9 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:bg-red-50 disabled:opacity-60"
          >
            <TrashIcon className="size-4" weight="bold" />
          </button>
        </div>
        <div className="sm:hidden">
          <ListCardActionsMenu
            pending={pending}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </>
    );
  }

  return (
    <ListCardActionsMenu
      pending={pending}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}

function ListCardActionsMenu({
  pending,
  onEdit,
  onDelete,
}: {
  pending: boolean;
  onEdit: () => void;
  onDelete: () => void;
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
        <DotsThreeVerticalIcon className="size-5" weight="bold" />
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
            <PencilSimpleIcon className="size-4" weight="bold" />
            تعديل
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-700 transition hover:bg-red-50 disabled:opacity-60"
          >
            <TrashIcon className="size-4" weight="bold" />
            حذف
          </button>
        </div>
      ) : null}
    </div>
  );
}

function EditListModal({
  list,
  onClose,
  onDone,
}: {
  list: {
    id: string;
    title: string;
    description: string | null;
  };
  onClose: () => void;
  onDone: () => void;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
      const result = await updateList(list.id, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onDone();
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
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-lg font-semibold text-foreground">
            تعديل القائمة
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted transition hover:bg-background hover:text-foreground"
          >
            <XIcon className="size-5" weight="bold" />
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
              عنوان القائمة <span className="text-red-600">*</span>
            </span>
            <input
              name="title"
              required
              defaultValue={list.title}
              className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">الوصف</span>
            <textarea
              name="description"
              rows={3}
              defaultValue={list.description ?? ""}
              className="resize-y rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-accent"
            />
          </label>
          <div className="flex gap-3">
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
              className="rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

function CreateListModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const titleId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
      const result = await createList(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.listId) {
        router.push(`/lists/${result.listId}`);
        return;
      }
      onClose();
      router.refresh();
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
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-5 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <h2 id={titleId} className="text-lg font-semibold text-foreground">
            قائمة جديدة
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted transition hover:bg-background hover:text-foreground"
          >
            <XIcon className="size-5" weight="bold" />
          </button>
        </div>
        <form action={submit} className="flex flex-col gap-4" aria-labelledby={titleId}>
          {error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">
              عنوان القائمة <span className="text-red-600">*</span>
            </span>
            <input
              name="title"
              required
              className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-foreground">الوصف</span>
            <textarea
              name="description"
              rows={3}
              className="resize-y rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-accent"
            />
          </label>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-surface transition hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "جاري الإنشاء..." : "إنشاء"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

export function ListManager({
  list,
  items,
  libraryBooks,
  shareUrl,
  view,
}: {
  list: {
    id: string;
    title: string;
    description: string | null;
    isPublic: boolean;
    publicId: string;
  };
  items: ManagedListItem[];
  libraryBooks: LibraryBookOption[];
  shareUrl: string;
  view: ListView;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [addOpen, setAddOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const itemIds = items.map((item) => item.id);
  const itemsKey = itemIds.join("\0");
  const [orderedIds, setOrderedIds] = useState(itemIds);
  const [syncedKey, setSyncedKey] = useState(itemsKey);

  if (syncedKey !== itemsKey) {
    setSyncedKey(itemsKey);
    setOrderedIds(itemIds);
  }

  const itemById = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );
  const orderedItems = orderedIds
    .map((id) => itemById.get(id))
    .filter((item): item is ManagedListItem => Boolean(item));

  function run(action: () => Promise<ListActionResult>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("تعذّر نسخ الرابط.");
    }
  }

  function moveItem(itemId: string, direction: -1 | 1) {
    const index = orderedIds.indexOf(itemId);
    const next = index + direction;
    if (index < 0 || next < 0 || next >= orderedIds.length) return;
    const nextIds = [...orderedIds];
    [nextIds[index], nextIds[next]] = [nextIds[next], nextIds[index]];
    setOrderedIds(nextIds);
    run(() => reorderListItems(list.id, nextIds));
  }

  return (
    <div className="flex flex-col gap-5">
      {error ? (
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      <div className="flex justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-foreground">
            {list.title}
          </h1>
          {list.description ? (
            <p className="mt-2 text-muted">{list.description}</p>
          ) : null}
        </div>
        <Link
          href="/lists"
          className="group inline-flex w-fit items-center gap-1.5 text-sm text-muted transition hover:text-foreground"
        >
          العودة إلى القوائم
          <ArrowLeftIcon
            className="size-4 transition group-hover:translate-x-0.5"
            weight="bold"
          />
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium text-foreground">المشاركة العامة</p>
            <p className="mt-1 text-sm text-muted">
              عند التفعيل يمكن لأي شخص فتح الرابط.
            </p>
          </div>
          <PublicSwitch
            checked={list.isPublic}
            disabled={pending}
            label={list.isPublic ? "عامة" : "خاصة"}
            onCheckedChange={(next) => run(() => setListPublic(list.id, next))}
          />
        </div>
        {list.isPublic ? (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <code className="min-w-0 flex-1 truncate rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted">
              {shareUrl}
            </code>
            <button
              type="button"
              onClick={copyLink}
              aria-label={copied ? "تم النسخ" : "نسخ الرابط"}
              title={copied ? "تم النسخ" : "نسخ الرابط"}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground transition hover:bg-surface"
            >
              {copied ? (
                <CheckIcon className="size-4 text-emerald-700" weight="bold" />
              ) : (
                <CopyIcon className="size-4" weight="bold" />
              )}
            </button>
            <Link
              href={`/l/${list.publicId}`}
              target="_blank"
              aria-label="فتح"
              title="فتح"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-background text-foreground transition hover:bg-surface"
            >
              <ArrowSquareOutIcon className="size-4" weight="bold" />
            </Link>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">
          الكتب ({items.length})
        </h2>

        <div className="flex items-center gap-2">
        <ViewToggle view={view} />
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          aria-label="إضافة كتاب"
          title="إضافة كتاب"
          className="inline-flex size-9 items-center justify-center rounded-md bg-accent text-surface transition hover:opacity-90"
        >
          <PlusIcon className="size-4" weight="bold" />
        </button>
        </div>
      </div>

      {orderedItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center text-sm text-muted">
          أضف كتبًا من مكتبتك أو كتابًا جديدًا لهذه القائمة.
        </div>
      ) : (
        <ul
          className={
            view === "grid"
              ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
              : "flex flex-col gap-3"
          }
        >
          {orderedItems.map((item, index) => (
            <li
              key={item.id}
              className={`relative rounded-xl border border-border bg-surface p-3 ${
                view === "grid"
                  ? "flex flex-col items-center gap-3 text-center"
                  : "flex items-center gap-3"
              }`}
            >
              {item.coverUrl ? (
                <div
                  className={`shrink-0 overflow-hidden rounded-md border border-border ${
                    view === "grid" ? "w-20" : "w-12"
                  }`}
                >
                  <Image
                    src={item.coverUrl}
                    alt=""
                    width={view === "grid" ? 80 : 48}
                    height={view === "grid" ? 120 : 72}
                    className="aspect-[1/1.6] w-full object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div
                  className={`shrink-0 rounded-md bg-accent/10 ${
                    view === "grid" ? "h-28 w-20" : "h-16 w-12"
                  }`}
                />
              )}
              <div
                className={`min-w-0 ${view === "grid" ? "w-full" : "flex-1"}`}
              >
                <div
                  className={`flex flex-wrap items-center gap-2 ${
                    view === "grid" ? "justify-center" : ""
                  }`}
                >
                  <p className="truncate font-medium text-foreground">
                    {item.title}
                  </p>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] ${
                      item.source === "library"
                        ? "border-sky-900/15 text-sky-900"
                        : "border-violet-900/15 text-violet-900"
                    }`}
                  >
                    {item.source === "library"
                      ? "من المكتبة"
                      : "في القائمة فقط"}
                  </span>
                </div>
                {item.author ? (
                  <p
                    className={`mt-1 truncate text-sm text-muted ${
                      view === "grid" ? "text-center" : ""
                    }`}
                  >
                    {item.author}
                  </p>
                ) : null}
              </div>
              <div
                className={`flex shrink-0 items-center gap-1 ${
                  view === "grid" ? "w-full justify-center" : ""
                }`}
              >
                <button
                  type="button"
                  disabled={pending || index === 0}
                  onClick={() => moveItem(item.id, -1)}
                  aria-label="أعلى"
                  className="inline-flex size-8 items-center justify-center rounded-md border border-border text-foreground transition hover:bg-background disabled:opacity-40"
                >
                  <ArrowUpIcon className="size-4" weight="bold" />
                </button>
                <button
                  type="button"
                  disabled={pending || index === orderedItems.length - 1}
                  onClick={() => moveItem(item.id, 1)}
                  aria-label="أسفل"
                  className="inline-flex size-8 items-center justify-center rounded-md border border-border text-foreground transition hover:bg-background disabled:opacity-40"
                >
                  <ArrowDownIcon className="size-4" weight="bold" />
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    if (!confirm("إزالة هذا الكتاب من القائمة؟")) return;
                    run(() => removeListItem(list.id, item.id));
                  }}
                  aria-label="إزالة"
                  className="inline-flex size-8 items-center justify-center rounded-md border border-red-200 text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                >
                  <TrashIcon className="size-4" weight="bold" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {addOpen ? (
        <AddBookModal
          listId={list.id}
          books={libraryBooks}
          alreadyOnList={
            new Set(
              items
                .map((item) => item.bookId)
                .filter((id): id is string => Boolean(id)),
            )
          }
          onClose={() => setAddOpen(false)}
          onDone={() => {
            setAddOpen(false);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function AddBookModal({
  listId,
  books,
  alreadyOnList,
  onClose,
  onDone,
}: {
  listId: string;
  books: LibraryBookOption[];
  alreadyOnList: Set<string>;
  onClose: () => void;
  onDone: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<"library" | "new">("library");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);

  const available = books.filter((book) => !alreadyOnList.has(book.id));
  const filtered = available.filter((book) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      book.title.toLowerCase().includes(q) ||
      (book.author ?? "").toLowerCase().includes(q)
    );
  });

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

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  }

  function submitNew(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await addListOnlyBook(listId, formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onDone();
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
        <div className="flex shrink-0 items-start justify-between gap-3 px-5 pt-5">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              إضافة كتاب
            </h2>
            <p className="mt-1 text-sm text-muted">
              اختر من مكتبتك أو أضف كتابًا لهذه القائمة فقط.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق"
            className="inline-flex size-8 items-center justify-center rounded-md text-muted transition hover:bg-background"
          >
            <XIcon className="size-5" weight="bold" />
          </button>
        </div>

        <div className="shrink-0 px-5 pt-4">
          <div className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-background p-1">
            <button
              type="button"
              onClick={() => {
                setMode("library");
                setError(null);
              }}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                mode === "library"
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <BooksIcon className="size-4" weight="bold" />
              من المكتبة
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("new");
                setError(null);
              }}
              className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                mode === "new"
                  ? "bg-surface text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <PlusIcon className="size-4" weight="bold" />
              كتاب جديد
            </button>
          </div>
        </div>

        {mode === "library" ? (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {error ? (
                <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ابحث في مكتبتك..."
                className="mb-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
              />
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">
                  لا توجد كتب متاحة للإضافة.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {filtered.map((book) => {
                    const isSelected = selected.includes(book.id);
                    return (
                      <li key={book.id}>
                        <button
                          type="button"
                          onClick={() => toggle(book.id)}
                          className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-start transition ${
                            isSelected
                              ? "border-accent bg-accent/5"
                              : "border-border hover:bg-background"
                          }`}
                        >
                          {book.coverUrl ? (
                            <div className="w-10 shrink-0 overflow-hidden rounded-md border border-border">
                              <Image
                                src={book.coverUrl}
                                alt=""
                                width={40}
                                height={60}
                                className="aspect-[1/1.6] w-full object-cover"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="h-[60px] w-10 shrink-0 rounded-md bg-accent/10" />
                          )}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-foreground">
                              {book.title}
                            </span>
                            {book.author ? (
                              <span className="block truncate text-xs text-muted">
                                {book.author}
                              </span>
                            ) : null}
                          </span>
                          <span
                            aria-hidden
                            className={`grid size-5 shrink-0 place-items-center rounded-full border text-[10px] ${
                              isSelected
                                ? "border-accent bg-accent text-surface"
                                : "border-border text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="flex shrink-0 gap-3 border-t border-border px-5 py-4">
              <button
                type="button"
                disabled={pending || selected.length === 0}
                onClick={() => {
                  setError(null);
                  startTransition(async () => {
                    const result = await addLibraryBooks(listId, selected);
                    if (!result.ok) {
                      setError(result.error);
                      return;
                    }
                    onDone();
                  });
                }}
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-surface transition hover:opacity-90 disabled:opacity-60"
              >
                {pending
                  ? "جاري الإضافة..."
                  : selected.length > 0
                    ? `إضافة (${selected.length})`
                    : "إضافة"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground"
              >
                إلغاء
              </button>
            </div>
          </>
        ) : (
          <form
            action={submitNew}
            encType="multipart/form-data"
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              <div className="flex flex-col gap-4">
                {error ? (
                  <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                    {error}
                  </p>
                ) : null}
                <p className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted">
                  يظهر في هذه القائمة فقط ولن يُضاف إلى مكتبتك.
                </p>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-foreground">
                    العنوان <span className="text-red-600">*</span>
                  </span>
                  <input
                    name="title"
                    required
                    className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-accent"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-foreground">
                    العنوان الفرعي
                  </span>
                  <input
                    name="subtitle"
                    className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-accent"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-foreground">الكاتب</span>
                  <input
                    name="author"
                    className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-accent"
                  />
                </label>
                <label className="flex flex-col gap-1.5 text-sm">
                  <span className="font-medium text-foreground">عدد الصفحات</span>
                  <input
                    name="pages"
                    type="number"
                    min={1}
                    className="rounded-lg border border-border bg-background px-3 py-2.5 outline-none focus:border-accent"
                  />
                </label>
                <div className="flex flex-col gap-2 text-sm">
                  <span className="font-medium text-foreground">الغلاف</span>
                  {preview ? (
                    <div className="mx-auto w-20 overflow-hidden rounded-lg border border-border">
                      <Image
                        src={preview}
                        alt=""
                        width={80}
                        height={50}
                        className="aspect-[1.6/1] w-full object-cover"
                        unoptimized
                      />
                    </div>
                  ) : null}
                  <input
                    ref={inputRef}
                    type="file"
                    name="cover"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (preview?.startsWith("blob:")) {
                        URL.revokeObjectURL(preview);
                      }
                      if (!file) {
                        setPreview(null);
                        return;
                      }
                      if (file.size > MAX_COVER_BYTES) {
                        event.target.value = "";
                        setPreview(null);
                        setError(
                          "حجم الصورة كبير جدًا (الحد الأقصى 11 ميغابايت).",
                        );
                        return;
                      }
                      setError(null);
                      setPreview(URL.createObjectURL(file));
                    }}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm file:me-3 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-surface"
                  />
                </div>
              </div>
            </div>
            <div className="flex shrink-0 gap-3 border-t border-border px-5 py-4">
              <button
                type="submit"
                disabled={pending}
                className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-surface transition hover:opacity-90 disabled:opacity-60"
              >
                {pending ? "جاري الإضافة..." : "إضافة"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground"
              >
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </dialog>
  );
}

export type PublicListItem = {
  id: string;
  title: string;
  subtitle: string | null;
  author: string | null;
  pages: number | null;
  coverUrl: string | null;
};

export function PublicListBooks({
  items,
  view,
}: {
  items: PublicListItem[];
  view: ListView;
}) {
  const isGrid = view === "grid";

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center text-muted">
        لا توجد كتب في هذه القائمة بعد.
      </div>
    );
  }

  return (
    <ul
      className={
        isGrid
          ? "grid grid-cols-1 gap-3 sm:grid-cols-2"
          : "flex flex-col gap-3"
      }
    >
      {items.map((item) => (
        <li
          key={item.id}
          className={`rounded-xl border border-border bg-surface p-3 ${
            isGrid
              ? "flex flex-col items-center gap-3 text-center"
              : "flex items-center gap-3"
          }`}
        >
          {item.coverUrl ? (
            <div
              className={`shrink-0 overflow-hidden rounded-md border border-border ${
                isGrid ? "w-20" : "w-14"
              }`}
            >
              <Image
                src={item.coverUrl}
                alt=""
                width={isGrid ? 80 : 56}
                height={isGrid ? 120 : 84}
                className="aspect-[1/1.6] w-full object-cover"
                unoptimized
              />
            </div>
          ) : (
            <div
              className={`shrink-0 rounded-md bg-accent/10 ${
                isGrid ? "h-28 w-20" : "h-[84px] w-14"
              }`}
            />
          )}
          <div className={`min-w-0 ${isGrid ? "w-full" : ""}`}>
            <p className="font-medium text-foreground">{item.title}</p>
            {item.subtitle ? (
              <p className="mt-0.5 text-sm text-muted">{item.subtitle}</p>
            ) : null}
            {item.author ? (
              <p className="mt-1 text-sm text-muted">{item.author}</p>
            ) : null}
            {item.pages ? (
              <p className="mt-1 text-xs text-muted">{item.pages} صفحة</p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
