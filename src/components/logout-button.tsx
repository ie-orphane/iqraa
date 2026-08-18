"use client";

import { logout } from "@/actions/auth";
import { SignOut } from "@phosphor-icons/react";

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        aria-label="تسجيل الخروج"
        title="تسجيل الخروج"
        className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-surface text-foreground transition hover:bg-background"
      >
        <SignOut className="size-4" weight="bold" />
      </button>
    </form>
  );
}
