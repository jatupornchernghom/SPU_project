"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { UtensilsCrossed, type LucideIcon } from "lucide-react";
import { SignOutButton } from "@/components/auth/sign-out-button";

export type SidebarItem = { href: string; label: string; icon: LucideIcon };

export function Sidebar({ title, items }: { title: string; items: SidebarItem[] }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-card">
      <div className="h-16 flex items-center gap-2 px-5 border-b border-border">
        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
          <UtensilsCrossed size={16} />
        </div>
        <span className="font-display font-bold text-foreground">{title}</span>
      </div>
      <nav className="flex-1 flex flex-col gap-1 p-3">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 h-10 px-3 rounded-lg text-sm font-semibold transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border">
        <SignOutButton />
      </div>
    </aside>
  );
}
