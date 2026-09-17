import { listBookFilterOptions, listBooks } from "@/actions/books";
import { AppHeader } from "@/components/app-header";
import { LibraryBooks } from "@/components/library-books";
import { isBookStatus } from "@/lib/books";
import { requireUser } from "@/lib/session";

function parseStatus(value?: string) {
  if (!value || !isBookStatus(value)) return undefined;
  return value;
}

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    category?: string;
    author?: string;
    q?: string;
    view?: string;
  }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const status = parseStatus(params.status);
  const category = params.category?.trim() || undefined;
  const author = params.author?.trim() || undefined;
  const q = params.q?.trim() || undefined;
  const view = params.view === "grid" ? "grid" : "list";

  const [books, options] = await Promise.all([
    listBooks({ status, category, author, q }),
    listBookFilterOptions(),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10">
      <AppHeader
        name={user.name}
        username={user.username}
        image={user.image}
      />

      <LibraryBooks
        books={books}
        authors={options.authors}
        categories={options.categories}
        stats={options.stats}
        filters={{ status, category, author, q, view }}
      />
    </main>
  );
}
