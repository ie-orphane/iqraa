import { listMyLists } from "@/actions/lists";
import { AppHeader } from "@/components/app-header";
import { ListsIndex } from "@/components/lists-ui";
import { requireUser } from "@/lib/session";

export default async function ListsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;
  const view = params.view === "grid" ? "grid" : "list";
  const lists = await listMyLists();

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-6 py-10">
      <AppHeader
        name={user.name}
        username={user.username}
        image={user.image}
      />

      <ListsIndex lists={lists} view={view} />
    </main>
  );
}
