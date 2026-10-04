"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { useCartHydrated } from "@/hooks/use-cart-hydrated";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const hydrated = useCartHydrated();
  const { items, restaurantName, setQuantity, removeItem, subtotal } = useCartStore();

  if (!hydrated) return null;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 px-4 text-center">
        <ShoppingBag size={48} className="text-muted-foreground" />
        <h1 className="font-display text-lg font-bold text-foreground">ตะกร้าว่างเปล่า</h1>
        <p className="text-sm text-muted-foreground">เลือกเมนูที่อยากกินแล้วกลับมาสั่งได้เลย</p>
        <Button render={<Link href="/" />} nativeButton={false} className="h-11 px-6 rounded-full mt-2">
          ไปเลือกเมนู
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 py-4 pb-32">
      <h1 className="font-display text-xl font-bold text-foreground">ตะกร้าของฉัน</h1>
      <p className="text-sm text-muted-foreground -mt-2">ร้าน {restaurantName}</p>

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.menuId} className="bg-card border border-border rounded-xl p-3 flex gap-3">
            <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
              {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-foreground truncate">{item.name}</h3>
                <button
                  type="button"
                  onClick={() => removeItem(item.menuId)}
                  aria-label="ลบรายการ"
                  className="text-muted-foreground hover:text-destructive flex-shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-auto pt-1">
                <span className="font-bold text-foreground">฿{item.price * item.quantity}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(item.menuId, item.quantity - 1)}
                    className="w-7 h-7 rounded-full bg-muted flex items-center justify-center active:scale-90"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity(item.menuId, item.quantity + 1)}
                    className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center active:scale-90"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-16 md:bottom-0 inset-x-0 bg-background border-t border-border p-4 pb-safe">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">ยอดรวม</span>
            <span className="font-display text-xl font-bold text-foreground">฿{subtotal()}</span>
          </div>
          <Button
            render={<Link href="/checkout" />}
            nativeButton={false}
            className="h-12 px-8 rounded-full text-base flex-1 max-w-xs"
          >
            ไปหน้าชำระเงิน
          </Button>
        </div>
      </div>
    </div>
  );
}
