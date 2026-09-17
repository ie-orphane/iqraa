"use server";

import { deleteBookCover, parseBookCoverInput } from "@/lib/book-covers";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";

function generatePublicId() {
  return randomBytes(9).toString("base64url");
}

export type ListActionResult =
  | { ok: true; listId?: string }
  | { ok: false; error: string };

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => (value ? value : null));

const listMetaSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: optionalText(1000),
});

const listOnlyBookSchema = z.object({
  title: z.string().trim().min(1).max(200),
  subtitle: optionalText(200),
  author: optionalText(200),
  pages: z
    .string()
    .trim()
    .optional()
    .transform((value) => {
      if (!value) return null;
      const n = Number(value);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
    }),
});

async function requireOwnedList(listId: string, userId: string) {
  const list = await prisma.bookList.findFirst({
    where: { id: listId, userId },
  });
  return list;
}

function revalidateListPaths(listId: string, publicId?: string) {
  revalidatePath("/lists");
  revalidatePath(`/lists/${listId}`);
  if (publicId) revalidatePath(`/l/${publicId}`);
}

export async function listMyLists() {
  const user = await requireUser();
  return prisma.bookList.findMany({
    where: { userId: user.id },
    include: { _count: { select: { items: true } } },
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function getMyList(listId: string) {
  const user = await requireUser();
  return prisma.bookList.findFirst({
    where: { id: listId, userId: user.id },
    include: {
      items: {
        include: {
          book: {
            select: {
              id: true,
              title: true,
              subtitle: true,
              author: true,
              pages: true,
              coverUrl: true,
            },
          },
        },
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      },
    },
  });
}

export async function createList(formData: FormData): Promise<ListActionResult> {
  const user = await requireUser();
  const parsed = listMetaSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, error: "تحقق من عنوان القائمة." };
  }

  const list = await prisma.bookList.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      publicId: generatePublicId(),
      userId: user.id,
    },
  });

  revalidatePath("/lists");
  revalidatePath(`/lists/${list.id}`);
  return { ok: true, listId: list.id };
}

export async function updateList(
  listId: string,
  formData: FormData,
): Promise<ListActionResult> {
  const user = await requireUser();
  const list = await requireOwnedList(listId, user.id);
  if (!list) return { ok: false, error: "القائمة غير موجودة." };

  const parsed = listMetaSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, error: "تحقق من عنوان القائمة." };
  }

  await prisma.bookList.update({
    where: { id: listId },
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
    },
  });

  revalidateListPaths(listId, list.publicId);
  return { ok: true };
}

export async function setListPublic(
  listId: string,
  isPublic: boolean,
): Promise<ListActionResult> {
  const user = await requireUser();
  const list = await requireOwnedList(listId, user.id);
  if (!list) return { ok: false, error: "القائمة غير موجودة." };

  await prisma.bookList.update({
    where: { id: listId },
    data: { isPublic },
  });

  revalidateListPaths(listId, list.publicId);
  return { ok: true };
}

export async function deleteList(listId: string): Promise<ListActionResult> {
  const user = await requireUser();
  const list = await requireOwnedList(listId, user.id);
  if (!list) return { ok: false, error: "القائمة غير موجودة." };

  const items = await prisma.bookListItem.findMany({
    where: { listId, bookId: null },
    select: { coverUrl: true },
  });
  for (const item of items) {
    await deleteBookCover(item.coverUrl);
  }

  await prisma.bookList.delete({ where: { id: listId } });
  revalidatePath("/lists");
  revalidatePath(`/l/${list.publicId}`);
  return { ok: true };
}

export async function addLibraryBooks(
  listId: string,
  bookIds: string[],
): Promise<ListActionResult> {
  const user = await requireUser();
  const list = await requireOwnedList(listId, user.id);
  if (!list) return { ok: false, error: "القائمة غير موجودة." };

  const uniqueIds = [...new Set(bookIds.filter(Boolean))];
  if (uniqueIds.length === 0) {
    return { ok: false, error: "اختر كتابًا واحدًا على الأقل." };
  }

  const ownedBooks = await prisma.book.findMany({
    where: { userId: user.id, id: { in: uniqueIds } },
    select: { id: true },
  });
  if (ownedBooks.length !== uniqueIds.length) {
    return { ok: false, error: "بعض الكتب غير موجودة في مكتبتك." };
  }

  const existing = await prisma.bookListItem.findMany({
    where: { listId, bookId: { in: uniqueIds } },
    select: { bookId: true },
  });
  const existingIds = new Set(existing.map((row) => row.bookId));
  const toAdd = uniqueIds.filter((id) => !existingIds.has(id));
  if (toAdd.length === 0) {
    return { ok: false, error: "هذه الكتب موجودة بالفعل في القائمة." };
  }

  const maxPosition = await prisma.bookListItem.aggregate({
    where: { listId },
    _max: { position: true },
  });
  let nextPosition = (maxPosition._max.position ?? -1) + 1;

  await prisma.bookListItem.createMany({
    data: toAdd.map((bookId) => ({
      listId,
      bookId,
      position: nextPosition++,
    })),
  });

  revalidateListPaths(listId, list.publicId);
  return { ok: true };
}

export async function addListOnlyBook(
  listId: string,
  formData: FormData,
): Promise<ListActionResult> {
  const user = await requireUser();
  const list = await requireOwnedList(listId, user.id);
  if (!list) return { ok: false, error: "القائمة غير موجودة." };

  const parsed = listOnlyBookSchema.safeParse({
    title: String(formData.get("title") ?? ""),
    subtitle: String(formData.get("subtitle") ?? ""),
    author: String(formData.get("author") ?? ""),
    pages: String(formData.get("pages") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, error: "تحقق من حقول الكتاب." };
  }

  let coverUrl: string | null = null;
  try {
    coverUrl = await parseBookCoverInput(formData, user.id, null);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "تعذّر حفظ صورة الغلاف.",
    };
  }

  const maxPosition = await prisma.bookListItem.aggregate({
    where: { listId },
    _max: { position: true },
  });

  await prisma.bookListItem.create({
    data: {
      listId,
      position: (maxPosition._max.position ?? -1) + 1,
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      author: parsed.data.author,
      pages: parsed.data.pages,
      coverUrl,
    },
  });

  revalidateListPaths(listId, list.publicId);
  return { ok: true };
}

export async function removeListItem(
  listId: string,
  itemId: string,
): Promise<ListActionResult> {
  const user = await requireUser();
  const list = await requireOwnedList(listId, user.id);
  if (!list) return { ok: false, error: "القائمة غير موجودة." };

  const item = await prisma.bookListItem.findFirst({
    where: { id: itemId, listId },
  });
  if (!item) return { ok: false, error: "العنصر غير موجود." };

  if (!item.bookId) {
    await deleteBookCover(item.coverUrl);
  }

  await prisma.bookListItem.delete({ where: { id: itemId } });
  revalidateListPaths(listId, list.publicId);
  return { ok: true };
}

export async function reorderListItems(
  listId: string,
  orderedItemIds: string[],
): Promise<ListActionResult> {
  const user = await requireUser();
  const list = await requireOwnedList(listId, user.id);
  if (!list) return { ok: false, error: "القائمة غير موجودة." };

  const items = await prisma.bookListItem.findMany({
    where: { listId },
    select: { id: true },
  });
  const itemIds = new Set(items.map((item) => item.id));
  if (
    orderedItemIds.length !== items.length ||
    orderedItemIds.some((id) => !itemIds.has(id))
  ) {
    return { ok: false, error: "ترتيب غير صالح." };
  }

  await prisma.$transaction(
    orderedItemIds.map((id, position) =>
      prisma.bookListItem.update({
        where: { id },
        data: { position },
      }),
    ),
  );

  revalidateListPaths(listId, list.publicId);
  return { ok: true };
}

export async function getPublicList(publicId: string) {
  const list = await prisma.bookList.findFirst({
    where: { publicId, isPublic: true },
    include: {
      user: { select: { name: true, username: true, image: true } },
      items: {
        include: {
          book: {
            select: {
              title: true,
              subtitle: true,
              author: true,
              pages: true,
              coverUrl: true,
            },
          },
        },
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!list) return null;

  return {
    id: list.id,
    title: list.title,
    description: list.description,
    publicId: list.publicId,
    owner: list.user,
    items: list.items.map((item) => {
      if (item.bookId && item.book) {
        return {
          id: item.id,
          source: "library" as const,
          title: item.book.title,
          subtitle: item.book.subtitle,
          author: item.book.author,
          pages: item.book.pages,
          coverUrl: item.book.coverUrl,
        };
      }
      return {
        id: item.id,
        source: "list_only" as const,
        title: item.title ?? "",
        subtitle: item.subtitle,
        author: item.author,
        pages: item.pages,
        coverUrl: item.coverUrl,
      };
    }),
  };
}
