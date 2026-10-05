"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { CUSTOMER_NAV_ITEMS, isNavItemActive } from "@/lib/nav-items";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-background/90 backdrop-blur-xl border-t border-border md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {CUSTOMER_NAV_ITEMS.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-12 transition-colors",
                active ? "text-primary font-bold" : "text-muted-foreground"
              )}
            >
              <Icon size={24} strokeWidth={active ? 2.5 : 2} />
              <span className="text-[11px] font-bold tracking-wide truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
