import { listBooks } from "@/actions/books";
import { getMyList } from "@/actions/lists";
import { AppHeader } from "@/components/app-header";
import { ListManager, type ManagedListItem } from "@/components/lists-ui";
import env from "@/env";
import { requireUser } from "@/lib/session";
import { notFound } from "next/navigation";

export default async function ListDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const { view: viewParam } = await searchParams;
  const view = viewParam === "grid" ? "grid" : "list";

  const [list, libraryBooks] = await Promise.all([
    getMyList(id),
    listBooks(),
  ]);

  if (!list) notFound();

  const items: ManagedListItem[] = list.items.map((item) => {
    if (item.bookId && item.book) {
      return {
        id: item.id,
        bookId: item.bookId,
        title: item.book.title,
        subtitle: item.book.subtitle,
        author: item.book.author,
        pages: item.book.pages,
        coverUrl: item.book.coverUrl,
        source: "library",
      };
    }
    return {
      id: item.id,
      bookId: null,
      title: item.title ?? "",
      subtitle: item.subtitle,
      author: item.author,
      pages: item.pages,
      coverUrl: item.coverUrl,
      source: "list_only",
    };
  });

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10">
      <AppHeader
        name={user.name}
        username={user.username}
        image={user.image}
      />

      <ListManager
        list={{
          id: list.id,
          title: list.title,
          description: list.description,
          isPublic: list.isPublic,
          publicId: list.publicId,
        }}
        items={items}
        libraryBooks={libraryBooks.map((book) => ({
          id: book.id,
          title: book.title,
          author: book.author,
          coverUrl: book.coverUrl,
        }))}
        shareUrl={`${env.APP_URL}/l/${list.publicId}`}
        view={view}
      />
    </main>
  );
}
