import { getCurrentUser } from "@/lib/auth-server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await getCurrentUser();
  if (user) redirect("/library");

  return (
    <main className="flex min-h-full flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="flex w-full max-w-lg flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-2">
          <h1 className="font-amiri text-3xl leading-relaxed text-accent sm:text-4xl">
            ﴿ اقرَأ بِاسمِ رَبِّكَ الذِے خَلَق ﴾
          </h1>
          <p className="text-xs text-muted">[العلق: 1]</p>
        </div>

        <p className="text-muted">
          تابع الكتب التي تريد قراءتها، والتي تقرأها الآن، والتي أنهيتها.
        </p>
        <Link
          href="/login"
          className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-surface transition hover:opacity-90"
        >
          تسجيل الدخول
        </Link>
      </div>
    </main>
  );
}
