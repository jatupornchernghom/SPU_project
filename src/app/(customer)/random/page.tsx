"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Dices, Loader2, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/cart-store";
import { Button } from "@/components/ui/button";
import type { SerializedMenu } from "@/types";

export default function RandomMenuPage() {
  const [menu, setMenu] = useState<SerializedMenu | null>(null);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  async function spin() {
    setLoading(true);
    try {
      const res = await fetch("/api/menu/random");
      const data = await res.json();
      setMenu(data.menu);
      setChecked(true);
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() {
    if (!menu) return;
    addItem(menu.restaurantId, menu.restaurantName, {
      menuId: menu.id,
      name: menu.name,
      price: menu.price,
      image: menu.image,
    });
    toast.success(`เพิ่ม "${menu.name}" ลงตะกร้าแล้ว`);
  }

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-10 text-center min-h-[70vh] justify-center">
      <h1 className="font-display text-2xl font-bold text-foreground">ไม่รู้จะกินอะไร?</h1>
      <p className="text-sm text-muted-foreground -mt-4">กดสุ่มแล้วให้ SkipQ เลือกให้เลย</p>

      {menu && (
        <div className="w-full max-w-sm bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="relative w-full h-44 bg-muted">
            {menu.image && <Image src={menu.image} alt={menu.name} fill className="object-cover" />}
          </div>
          <div className="p-4 flex flex-col gap-1 text-left">
            <h2 className="font-display text-lg font-bold text-foreground">{menu.name}</h2>
            <p className="text-sm text-muted-foreground">{menu.restaurantName}</p>
            <div className="flex items-center gap-1 text-sm">
              <Star size={14} className="text-secondary fill-secondary" />
              {menu.rating.toFixed(1)}
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="font-bold text-lg text-foreground">฿{menu.price}</span>
              <Button onClick={handleAdd} className="rounded-full h-10 px-4">
                <Plus size={16} /> เพิ่มลงตะกร้า
              </Button>
            </div>
            <Link href={`/restaurants/${menu.restaurantId}`} className="text-xs text-primary font-semibold mt-1">
              ดูเมนูอื่นของร้านนี้ →
            </Link>
          </div>
        </div>
      )}

      {checked && !menu && (
        <p className="text-sm text-muted-foreground">ตอนนี้ยังไม่มีร้านเปิดอยู่ ลองใหม่อีกครั้งนะ</p>
      )}

      <Button
        onClick={spin}
        disabled={loading}
        className="h-14 px-8 rounded-full text-base gap-2 bg-gradient-to-br from-primary to-secondary"
      >
        {loading ? <Loader2 size={20} className="animate-spin" /> : <Dices size={20} />}
        {menu ? "สุ่มใหม่อีกครั้ง" : "กดสุ่มเลย"}
      </Button>
    </div>
  );
}
