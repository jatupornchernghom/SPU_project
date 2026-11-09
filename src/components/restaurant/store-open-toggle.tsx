"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cn } from "cn";
import { Switch } from "@/components/ui/switch";

export function StoreOpenToggle({ restaurantId, initialIsOpen }: { restaurantId: string; initialIsOpen: boolean }) {
  const [isOpen, setIsOpen] = useState(initialIsOpen);
  const [saving, setSaving] = useState(false);

  async function handleChange(next: boolean) {
    setSaving(true);
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isOpen: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "เกิดข้อผิดพลาด");
        return;
      }
      setIsOpen(data.restaurant.isOpen);
      toast.success(data.restaurant.isOpen ? "เปิดร้านแล้ว — รับออเดอร์ได้" : "ปิดร้านแล้ว — หยุดรับออเดอร์ใหม่");
    } finally {
      setSaving(false);
    }
  }

  return (
    <label
      className={cn(
        "flex items-center gap-3 rounded-full border px-4 h-11 w-fit cursor-pointer select-none",
        isOpen ? "border-emerald-500/40 bg-emerald-500/10" : "border-border bg-muted"
      )}
    >
      <span className={cn("w-2 h-2 rounded-full", isOpen ? "bg-emerald-500" : "bg-slate-500")} />
      <span className="text-sm font-semibold text-foreground">{isOpen ? "ร้านเปิดอยู่" : "ร้านปิดอยู่"}</span>
      <Switch checked={isOpen} disabled={saving} onCheckedChange={handleChange} aria-label="เปิด/ปิดร้าน" />
    </label>
  );
}
