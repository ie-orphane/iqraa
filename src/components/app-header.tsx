import { UserMenu } from "@/components/user-menu";
import Link from "next/link";

export function AppHeader({
  name,
  username,
  image,
}: {
  name?: string | null;
  username?: string | null;
  image?: string | null;
}) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <Link
        href="/"
        className="font-handjet text-3xl font-extrabold text-accent"
      >
        اقرأ
      </Link>
      <UserMenu name={name} username={username} image={image} />
    </header>
  );
}
