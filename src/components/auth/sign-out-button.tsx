"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "cn";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className={cn(
        "w-full rounded-xl border border-border flex items-center justify-center gap-2 text-destructive font-semibold",
        compact ? "h-9 text-xs" : "h-12"
      )}
    >
      <LogOut size={compact ? 14 : 18} />
      ออกจากระบบ
    </button>
  );
}
