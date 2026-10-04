import { LogOut } from "lucide-react";
import { cn } from "cn";
import { signOutAction } from "@/lib/actions/auth-actions";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className={cn(
          "w-full rounded-xl border border-border flex items-center justify-center gap-2 text-destructive font-semibold",
          compact ? "h-9 text-xs" : "h-12"
        )}
      >
        <LogOut size={compact ? 14 : 18} />
        ออกจากระบบ
      </button>
    </form>
  );
}
