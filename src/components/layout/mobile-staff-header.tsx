"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { SignOutButton } from "@/components/auth/sign-out-button";
import type { SidebarItem } from "@/components/layout/sidebar";

export function MobileStaffHeader({ title, items }: { title: string; items: SidebarItem[] }) {
  const pathname = usePathname();

  return (
    <div className="md:hidden sticky top-0 z-40 bg-card border-b border-border">
      <div className="flex items-center justify-between px-4 h-14">
        <span className="font-display font-bold text-foreground">{title}</span>
        <div className="w-28">
          <SignOutButton compact />
        </div>
      </div>
      {items.length > 1 && (
        <nav className="flex border-t border-border">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1 h-11 px-1 text-xs font-semibold border-b-2 transition-colors",
                  active
                    ? "text-primary border-primary"
                    : "text-muted-foreground border-transparent"
                )}
              >
                <Icon size={15} className="flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
