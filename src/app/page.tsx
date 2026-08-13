import { logout } from "@/actions/auth";
import { getCurrentUser } from "@/lib/auth-server";
import Image from "next/image";
import Link from "next/link";

const PROVIDER_LABELS: Record<string, string> = {
  discord: "ديسكورد",
  telegram: "تيليغرام",
};

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-lg flex-col items-center gap-6 text-center">
        <h1 className="font-handjet text-5xl font-extrabold tracking-tight text-accent">
          اقرأ
        </h1>

        {user ? (
          <>
            <div className="flex items-center gap-3">
              {user.image ? (
                <Image
                  src={user.image}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 rounded-full"
                  unoptimized
                />
              ) : null}
              <div className="text-right">
                <p className="font-medium text-foreground">
                  {user.name ?? user.username}
                </p>
                <p className="text-sm text-muted">
                  مسجّل عبر {PROVIDER_LABELS[user.provider] ?? user.provider}
                </p>
              </div>
            </div>

            <form action={logout}>
              <button
                type="submit"
                className="rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-background"
              >
                تسجيل الخروج
              </button>
            </form>
          </>
        ) : (
          <>
            <p className="text-muted">
              تابع الكتب التي تريد قراءتها، والتي تقرأها الآن، والتي أنهيتها.
            </p>
            <Link
              href="/login"
              className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-surface transition hover:opacity-90"
            >
              تسجيل الدخول
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
