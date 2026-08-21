import { BookStatusIcon } from "@/components/book-status-icon";
import { BOOK_STATUS_BADGE, BOOK_STATUS_LABELS } from "@/lib/books";
import type { BookStatus } from "@/lib/books";
import { NotebookIcon, StackIcon, TagIcon } from "@phosphor-icons/react/ssr";
import Link from "next/link";

const whyItems = [
  {
    icon: StackIcon,
    title: "تتبع الحالة",
    body: "اعرف ما تقرأه الآن، وما تنتظره، وما أنهيتَه.",
  },
  {
    icon: TagIcon,
    title: "تصنيفات وملاحظات",
    body: "نظّم كتبك واترك ملاحظاتك بجانب كل عنوان.",
  },
  {
    icon: NotebookIcon,
    title: "غلاف لكل كتاب",
    body: "أضف صورة الغلاف ليبقى مكتبتك واضحة وحيّة.",
  },
] as const;

const steps = [
  { n: "1", title: "سجّل الدخول", body: "عبر Discord أو Telegram بسرعة." },
  { n: "2", title: "أضف كتابك", body: "العنوان، الحالة، التصنيف، والغلاف." },
  { n: "3", title: "تابع تقدمك", body: "إحصاءات وحالات تبقى معك دائمًا." },
] as const;

const mockStats: { status: BookStatus; value: number }[] = [
  { status: "reading", value: 3 },
  { status: "finished", value: 12 },
  { status: "want_to_read", value: 7 },
];

const mockBooks = [
  {
    title: "مقدمة ابن خلدون",
    author: "عبد الرحمن ابن خلدون",
    status: "reading" as const,
  },
  {
    title: "حي بن يقظان",
    author: "ابن طفيل",
    status: "want_to_read" as const,
  },
  {
    title: "كليلة ودمنة",
    author: "ابن المقفع",
    status: "finished" as const,
  },
];

export function LandingPage({
  isAuthenticated = false,
}: {
  isAuthenticated?: boolean;
}) {
  const primaryHref = isAuthenticated ? "/library" : "/login";
  const primaryLabel = isAuthenticated ? "مكتبتي" : "ابدأ مكتبتك";
  const headerActionHref = isAuthenticated ? "/library" : "/login";
  const headerActionLabel = isAuthenticated ? "مكتبتي" : "تسجيل الدخول";

  return (
    <div className="flex flex-1 flex-col">
      <section className="landing-hero relative flex min-h-dvh flex-col overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 landing-hero-glow"
        />
        <div
          aria-hidden
          className="landing-hero-books pointer-events-none absolute inset-y-0 inset-s-0 w-full max-w-xl sm:max-w-2xl"
        />

        <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
          <p className="font-handjet text-2xl font-extrabold text-accent">
            اقرأ
          </p>
          <Link
            href={headerActionHref}
            className="text-sm font-medium text-muted transition hover:text-foreground"
          >
            {headerActionLabel}
          </Link>
        </header>

        <div className="relative z-10 flex flex-1 flex-col justify-center px-6 pb-20 pt-8 sm:px-10">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
            <p className="landing-fade-up landing-delay-1 font-amiri text-4xl leading-relaxed text-muted sm:text-5xl">
              ﴿ اقرَأ بِاسمِ رَبِّكَ الذِے خَلَق ﴾
              <span className="ms-2 align-middle font-tajawal text-xs">
                [العلق: 1]
              </span>
            </p>
            <p className="landing-fade-up landing-delay-2 mt-4 max-w-md text-lg text-foreground sm:text-xl">
              مكتبتك القرائية في مكان واحد
            </p>
            <div className="landing-fade-up landing-delay-3 mt-10">
              <Link
                href={primaryHref}
                className="inline-flex rounded-lg bg-accent px-6 py-3 text-sm font-medium text-surface transition hover:opacity-90"
              >
                {primaryLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-handjet text-3xl font-bold text-accent sm:text-4xl">
            لماذا اقرأ؟
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            أداة بسيطة لتبقى قريبًا من كتبك دون تشتيت.
          </p>
          <ul className="mt-12 grid gap-10 sm:grid-cols-3">
            {whyItems.map((item) => (
              <li key={item.title} className="flex flex-col gap-3">
                <item.icon
                  className="size-7 text-accent"
                  weight="bold"
                  aria-hidden
                />
                <h3 className="text-base font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-border bg-surface/60 px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-handjet text-3xl font-bold text-accent sm:text-4xl">
            كيف تعمل؟
          </h2>
          <p className="mt-3 max-w-xl text-muted">ثلاث خطوات وتبدأ.</p>
          <ol className="mt-12 grid gap-10 sm:grid-cols-3">
            {steps.map((step) => (
              <li key={step.n} className="flex flex-col gap-2">
                <span className="font-handjet text-4xl font-bold tabular-nums text-accent/35">
                  {step.n}
                </span>
                <h3 className="text-base font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="px-6 py-20 sm:px-10">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-handjet text-3xl font-bold text-accent sm:text-4xl">
            نظرة على مكتبتك
          </h2>
          <p className="mt-3 max-w-xl text-muted">
            إحصاءات وحالات كتب في واجهة هادئة بالعربية.
          </p>

          <div className="landing-glimpse mt-12 overflow-hidden rounded-2xl border border-border bg-surface p-4 sm:p-6">
            <div className="grid grid-cols-3 gap-2">
              {mockStats.map((stat) => (
                <div
                  key={stat.status}
                  className={`rounded-xl px-2 py-4 text-center ${BOOK_STATUS_BADGE[stat.status]}`}
                >
                  <p className="font-handjet text-2xl font-bold tabular-nums">
                    {stat.value}
                  </p>
                  <p className="mt-0.5 flex items-center justify-center gap-1 text-[10px] opacity-80 sm:text-[11px]">
                    <BookStatusIcon status={stat.status} className="size-3.5" />
                    <span>{BOOK_STATUS_LABELS[stat.status]}</span>
                  </p>
                </div>
              ))}
            </div>

            <ul className="mt-4 flex flex-col gap-3">
              {mockBooks.map((book) => (
                <li
                  key={book.title}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background/70 px-3 py-3"
                >
                  <div className="h-14 w-9 shrink-0 rounded-md bg-accent/10" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium text-foreground">
                        {book.title}
                      </p>
                      <span
                        className={`inline-flex size-7 items-center justify-center rounded-full ${BOOK_STATUS_BADGE[book.status]}`}
                      >
                        <BookStatusIcon
                          status={book.status}
                          className="size-3.5"
                        />
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-muted">
                      {book.author}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="px-6 pb-16 sm:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-base leading-relaxed text-muted sm:text-lg">
            مكتبتك خاصة بك — عربية أولًا، بسيطة، ومن غير ضوضاء.
          </p>
          <Link
            href={primaryHref}
            className="mt-8 inline-flex rounded-lg bg-accent px-6 py-3 text-sm font-medium text-surface transition hover:opacity-90"
          >
            {isAuthenticated ? "افتح مكتبتي" : "سجّل الدخول وابدأ"}
          </Link>
        </div>
      </section>

      <footer className="border-t border-border px-6 py-8 sm:px-10">
        <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">© 2026 اقرأ</p>
          <div className="flex flex-col gap-1 text-sm text-muted sm:items-end">
            <p>
              صمم من طرف{" "}
              <a
                href="https://github.com/siraj-devs"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-foreground transition hover:text-accent"
              >
                sirajdevs
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
