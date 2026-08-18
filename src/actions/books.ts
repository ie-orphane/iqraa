"use server";

import { prisma } from "@/lib/prisma";
import { parseCategories, type BookStatus } from "@/lib/books";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const bookStatusSchema = z.enum(["want_to_read", "reading", "finished"]);

const bookInputSchema = z.object({
  title: z.string().trim().min(1).max(200),
  author: z.string().trim().min(1).max(200),
  pages: z
    .string()
    .trim()
    .optional()
    .transform((value) => {
      if (!value) return null;
      const n = Number(value);
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
    }),
  status: bookStatusSchema.default("want_to_read"),
  categories: z
    .string()
    .optional()
    .transform((value) => parseCategories(value ?? "")),
  notes: z
    .string()
    .trim()
    .max(2000)
    .optional()
    .transform((value) => (value ? value : null)),
});

function formDataToObject(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    author: String(formData.get("author") ?? ""),
    pages: String(formData.get("pages") ?? ""),
    status: String(formData.get("status") ?? "want_to_read"),
    categories: String(formData.get("categories") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
}

export type BookActionResult = { ok: true } | { ok: false; error: string };

export async function createBook(formData: FormData): Promise<BookActionResult> {
  const user = await requireUser();
  const parsed = bookInputSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { ok: false, error: "تحقق من الحقول وأعد المحاولة." };
  }

  await prisma.book.create({
    data: {
      title: parsed.data.title,
      author: parsed.data.author,
      pages: parsed.data.pages,
      status: parsed.data.status as BookStatus,
      categories: parsed.data.categories,
      notes: parsed.data.notes,
      userId: user.id,
    },
  });

  revalidatePath("/library");
  return { ok: true };
}

export async function updateBook(
  bookId: string,
  formData: FormData,
): Promise<BookActionResult> {
  const user = await requireUser();
  const parsed = bookInputSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return { ok: false, error: "تحقق من الحقول وأعد المحاولة." };
  }

  const existing = await prisma.book.findFirst({
    where: { id: bookId, userId: user.id },
  });
  if (!existing) {
    return { ok: false, error: "الكتاب غير موجود." };
  }

  await prisma.book.update({
    where: { id: bookId },
    data: {
      title: parsed.data.title,
      author: parsed.data.author,
      pages: parsed.data.pages,
      status: parsed.data.status as BookStatus,
      categories: parsed.data.categories,
      notes: parsed.data.notes,
    },
  });

  revalidatePath("/library");
  return { ok: true };
}

export async function deleteBook(bookId: string) {
  const user = await requireUser();

  await prisma.book.deleteMany({
    where: { id: bookId, userId: user.id },
  });

  revalidatePath("/library");
}

export async function listBooks(filters: {
  status?: BookStatus;
  category?: string;
  author?: string;
} = {}) {
  const user = await requireUser();
  return prisma.book.findMany({
    where: {
      userId: user.id,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.author ? { author: filters.author } : {}),
      ...(filters.category
        ? { categories: { has: filters.category } }
        : {}),
    },
    orderBy: [{ updatedAt: "desc" }],
  });
}

export async function listBookFilterOptions() {
  const user = await requireUser();
  const rows = await prisma.book.findMany({
    where: { userId: user.id },
    select: { author: true, categories: true, status: true, pages: true },
  });

  const authors = [...new Set(rows.map((row) => row.author).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "ar"),
  );
  const categories = [
    ...new Set(rows.flatMap((row) => row.categories ?? [])),
  ].sort((a, b) => a.localeCompare(b, "ar"));

  const stats = {
    total: rows.length,
    wantToRead: rows.filter((row) => row.status === "want_to_read").length,
    reading: rows.filter((row) => row.status === "reading").length,
    finished: rows.filter((row) => row.status === "finished").length,
    pages: rows.reduce((sum, row) => sum + (row.pages ?? 0), 0),
  };

  return { authors, categories, stats };
}
