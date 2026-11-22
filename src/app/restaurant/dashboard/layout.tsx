"use client";

import { History, LayoutDashboard, UtensilsCrossed } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileStaffHeader } from "@/components/layout/mobile-staff-header";

const ITEMS = [
  { href: "/restaurant/dashboard", label: "คิวออเดอร์", icon: LayoutDashboard },
  { href: "/restaurant/dashboard/menu", label: "เมนูของร้าน", icon: UtensilsCrossed },
  { href: "/restaurant/dashboard/history", label: "สรุป/ประวัติ", icon: History },
];

export default function RestaurantDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex w-full">
      <Sidebar title="Restaurant Staff" items={ITEMS} />
      <div className="flex-1 md:ml-64 flex flex-col">
        <MobileStaffHeader title="Restaurant Staff" items={ITEMS} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
