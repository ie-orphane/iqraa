import type { BookStatus } from "@prisma/client";
import { BOOK_STATUS_LABELS, BOOK_STATUSES } from "@/lib/books";
import Link from "next/link";

export function StatusFilter({ current }: { current?: BookStatus | "all" }) {
  const items: Array<{ value: "all" | BookStatus; label: string }> = [
    { value: "all", label: "الكل" },
    ...BOOK_STATUSES.map((status) => ({
      value: status,
      label: BOOK_STATUS_LABELS[status],
    })),
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = (current ?? "all") === item.value;
        const href =
          item.value === "all" ? "/library" : `/library?status=${item.value}`;
        return (
          <Link
            key={item.value}
            href={href}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              active
                ? "bg-accent text-surface"
                : "border border-border bg-surface text-muted hover:text-foreground"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
