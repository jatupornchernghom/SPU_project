import { Utensils, Dices, Ticket, Receipt, User, type LucideIcon } from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const CUSTOMER_NAV_ITEMS: NavItem[] = [
  { href: "/", label: "หน้าหลัก", icon: Utensils },
  { href: "/random", label: "สุ่มเมนู", icon: Dices },
  { href: "/orders", label: "คิวของฉัน", icon: Ticket },
  { href: "/orders/history", label: "ประวัติ", icon: Receipt },
  { href: "/profile", label: "โปรไฟล์", icon: User },
];

/**
 * "/orders" and "/orders/history" share a prefix, so a plain startsWith
 * would highlight "คิวของฉัน" while on "/orders/history" too. This treats
 * "/orders/history" as its own branch and everything else under "/orders"
 * (the list itself, and "/orders/[id]" live trackers) as "คิวของฉัน".
 */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/orders") return pathname === "/orders" || /^\/orders\/(?!history$)/.test(pathname);
  return pathname === href || pathname.startsWith(`${href}/`);
}
