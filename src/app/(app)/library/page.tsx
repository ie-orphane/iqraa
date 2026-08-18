import { logout } from "@/actions/auth";
import { listBooks } from "@/actions/books";
import { StatusFilter } from "@/components/books";
import { LibraryBooks } from "@/components/library-books";
import { BOOK_STATUSES } from "@/lib/books";
import { requireUser } from "@/lib/session";
import type { BookStatus } from "@prisma/client";
import Image from "next/image";
import Link from "next/link";

function parseStatus(value?: string): BookStatus | undefined {
  if (!value) return undefined;
  return BOOK_STATUSES.includes(value as BookStatus)
    ? (value as BookStatus)
    : undefined;
}

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await requireUser();
  const { status: statusParam } = await searchParams;
  const status = parseStatus(statusParam);
  const books = await listBooks(status);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="font-handjet text-3xl font-extrabold text-accent"
          >
            اقرأ
          </Link>
          <p className="mt-1 text-sm text-muted">مكتبتك القرائية</p>
        </div>

        <div className="flex items-center gap-3">
          {user.image ? (
            <Image
              src={user.image}
              alt=""
              width={36}
              height={36}
              className="size-9 rounded-full"
              unoptimized
            />
          ) : null}
          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium"
            >
              خروج
            </button>
          </form>
        </div>
      </header>

      <StatusFilter current={status ?? "all"} />

      <LibraryBooks books={books} />
    </main>
  );
}
