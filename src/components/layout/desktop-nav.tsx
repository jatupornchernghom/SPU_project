"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { CUSTOMER_NAV_ITEMS, isNavItemActive } from "@/lib/nav-items";

/** Horizontal nav shown only at md+ — the bottom tab bar is mobile-only, so
 * without this there'd be no way to reach "คิวของฉัน"/"ประวัติ" on desktop. */
export function DesktopNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {CUSTOMER_NAV_ITEMS.filter((item) => item.href !== "/profile").map((item) => {
        const active = isNavItemActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-1.5 h-9 px-3 rounded-full text-sm font-semibold transition-colors",
              active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
            )}
          >
            <Icon size={16} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
