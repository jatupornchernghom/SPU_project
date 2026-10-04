"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import { Utensils, Dices, Ticket, Receipt, User } from "lucide-react";

const ITEMS = [
  { href: "/", label: "หน้าหลัก", icon: Utensils },
  { href: "/random", label: "สุ่มเมนู", icon: Dices },
  { href: "/orders", label: "คิวของฉัน", icon: Ticket },
  { href: "/orders?tab=history", label: "ประวัติ", icon: Receipt },
  { href: "/profile", label: "โปรไฟล์", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-background/90 backdrop-blur-xl border-t border-border md:hidden">
      <div className="flex justify-around items-center h-16 px-2">
        {ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href.split("?")[0]);
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
