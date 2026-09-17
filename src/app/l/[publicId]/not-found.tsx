import Link from "next/link";

export default function PublicListNotFound() {
  return (
    <main className="relative flex min-h-full flex-1 flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 20%, #ebe3d6 0%, transparent 55%), linear-gradient(165deg, #f7f2ea 0%, #f3eee6 50%, #ebe4d8 100%)",
        }}
      />

      <header className="relative z-10 flex items-center px-6 py-6 sm:px-10">
        <Link
          href="/"
          className="font-handjet text-3xl font-extrabold text-accent"
        >
          اقرأ
        </Link>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-20 text-center">
        <p className="font-handjet text-7xl font-extrabold tabular-nums text-accent/20 sm:text-8xl">
          404
        </p>
        <h1 className="mt-4 max-w-md font-handjet text-3xl font-bold text-accent sm:text-4xl">
          القائمة غير موجودة
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted sm:text-base">
          الرابط قد يكون خاطئًا، أو أن القائمة خاصة ولم تُنشر للعامة بعد.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-surface transition hover:opacity-90"
          >
            الصفحة الرئيسية
          </Link>
          <Link
            href="/login"
            className="inline-flex rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition hover:bg-background"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </main>
  );
}
