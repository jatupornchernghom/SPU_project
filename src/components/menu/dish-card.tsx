"use client";

import Image from "next/image";
import { Plus, Star } from "lucide-react";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import type { SerializedMenu } from "@/types";

export function DishCard({ menu, restaurantOpen = true }: { menu: SerializedMenu; restaurantOpen?: boolean }) {
  const { requestAdd, confirmDialog } = useAddToCart();
  const canAdd = menu.isAvailable && restaurantOpen;

  function handleAdd() {
    if (!canAdd) return;
    requestAdd(menu);
  }

  return (
    <div className="bg-card rounded-xl border border-border p-3 flex gap-3">
      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
        {menu.image && <Image src={menu.image} alt={menu.name} fill className="object-cover" />}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <h4 className="font-semibold text-foreground truncate">{menu.name}</h4>
        {menu.description && (
          <p className="text-xs text-muted-foreground line-clamp-1">{menu.description}</p>
        )}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
          <Star size={12} className="text-secondary fill-secondary" />
          {menu.rating.toFixed(1)}
        </div>
        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="font-bold text-foreground">฿{menu.price}</span>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!canAdd}
            className="h-8 px-3 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1 active:scale-90 transition-transform disabled:opacity-40 disabled:pointer-events-none"
          >
            <Plus size={14} />
            {!restaurantOpen ? "ร้านปิด" : menu.isAvailable ? "เพิ่ม" : "หมด"}
          </button>
        </div>
      </div>
      {confirmDialog}
    </div>
  );
}
