"use client";

import { LayoutDashboard, Store, UtensilsCrossed, Receipt, Users } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileStaffHeader } from "@/components/layout/mobile-staff-header";

const ITEMS = [
  { href: "/admin", label: "ภาพรวม", icon: LayoutDashboard },
  { href: "/admin/restaurants", label: "ร้านอาหาร", icon: Store },
  { href: "/admin/menu", label: "เมนู", icon: UtensilsCrossed },
  { href: "/admin/orders", label: "คำสั่งซื้อ", icon: Receipt },
  { href: "/admin/users", label: "บัญชีผู้ใช้", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex w-full">
      <Sidebar title="Admin" items={ITEMS} />
      <div className="flex-1 md:ml-64 flex flex-col">
        <MobileStaffHeader title="Admin" items={ITEMS} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
