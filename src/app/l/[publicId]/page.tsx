import { getPublicList } from "@/actions/lists";
import { PublicListBooks, ViewToggle } from "@/components/lists-ui";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ publicId: string }>;
}): Promise<Metadata> {
  const { publicId } = await params;
  const list = await getPublicList(publicId);
  if (!list) return { title: "اقرأ" };
  return {
    title: `${list.title} · اقرأ`,
    description: list.description ?? `قائمة كتب: ${list.title}`,
  };
}

export default async function PublicListPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<{ view?: string }>;
}) {
  const { publicId } = await params;
  const { view: viewParam } = await searchParams;
  const view = viewParam === "grid" ? "grid" : "list";
  const list = await getPublicList(publicId);
  if (!list) notFound();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-10">
      <header className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="font-handjet text-3xl font-extrabold text-accent"
        >
          اقرأ
        </Link>
      </header>

      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            {list.title}
          </h1>
          {list.description ? (
            <p className="mt-3 text-muted">{list.description}</p>
          ) : null}
          <p className="mt-2 text-sm text-muted">{list.items.length} كتاب</p>
        </div>
        <ViewToggle view={view} />
      </div>

      <PublicListBooks
        view={view}
        items={list.items.map((item) => ({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle,
          author: item.author,
          pages: item.pages,
          coverUrl: item.coverUrl,
        }))}
      />
    </main>
  );
}
