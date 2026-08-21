"use client";

import { logout } from "@/actions/auth";
import { SignOutIcon, UserIcon } from "@phosphor-icons/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function UserMenu({
  name,
  username,
  image,
}: {
  name?: string | null;
  username?: string | null;
  image?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const label = name || username || "حسابي";

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={label}
        title={label}
        aria-expanded={open}
        className="inline-flex size-9 items-center justify-center overflow-hidden rounded-full border border-border bg-surface text-muted transition hover:bg-background hover:text-foreground"
      >
        {image ? (
          <Image
            src={image}
            alt=""
            width={36}
            height={36}
            className="size-full object-cover"
            unoptimized
          />
        ) : (
          <UserIcon className="size-4" weight="bold" />
        )}
      </button>

      {open ? (
        <div className="absolute end-0 top-full z-20 mt-2 min-w-44 overflow-hidden rounded-xl border border-border bg-surface py-1 shadow-lg">
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-sm font-medium text-foreground">
              {label}
            </p>
            {username && name ? (
              <p className="truncate text-xs text-muted">@{username}</p>
            ) : null}
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-red-700 transition hover:bg-red-50"
            >
              <SignOutIcon className="size-4" weight="bold" />
              تسجيل الخروج
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
