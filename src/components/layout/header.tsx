import Link from "next/link";
import { Bell, UtensilsCrossed } from "lucide-react";

export function Header({ userName }: { userName?: string | null }) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border pt-safe">
      <div className="h-16 px-4 flex items-center justify-between gap-2 max-w-5xl mx-auto">
        <Link href="/" className="flex items-center gap-2 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 text-primary-foreground">
            <UtensilsCrossed size={18} />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-display text-base font-bold text-foreground truncate">SPU SkipQ</span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                Live
              </span>
            </div>
          </div>
        </Link>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Link
            href="/notifications"
            aria-label="Notifications"
            className="w-11 h-11 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted active:scale-95 transition-all"
          >
            <Bell size={22} />
          </Link>
          <Link
            href="/profile"
            aria-label="Profile"
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted active:scale-95 transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-foreground">
              {userName?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
