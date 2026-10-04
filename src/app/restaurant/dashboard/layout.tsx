"use client";

import { LayoutDashboard } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileStaffHeader } from "@/components/layout/mobile-staff-header";

const ITEMS = [{ href: "/restaurant/dashboard", label: "คิวออเดอร์", icon: LayoutDashboard }];

export default function RestaurantDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex w-full">
      <Sidebar title="Restaurant Staff" items={ITEMS} />
      <div className="flex-1 md:ml-64 flex flex-col">
        <MobileStaffHeader title="Restaurant Staff" />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
