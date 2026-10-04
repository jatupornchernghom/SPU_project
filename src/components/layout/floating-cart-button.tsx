"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingBag, ChevronRight } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";

const HIDDEN_ON = ["/cart", "/checkout"];

export function FloatingCartButton() {
  const pathname = usePathname();
  const items = useCartStore((s) => s.items);
  const restaurantName = useCartStore((s) => s.restaurantName);
  const subtotal = useCartStore((s) => s.subtotal());
  const totalItems = useCartStore((s) => s.totalItems());

  if (items.length === 0 || HIDDEN_ON.some((p) => pathname.startsWith(p))) return null;

  return (
    <div className="fixed left-0 right-0 z-40 px-4 bottom-20 md:bottom-6 flex justify-center">
      <Link
        href="/cart"
        className="w-full max-w-md flex items-center justify-between gap-3 rounded-2xl bg-foreground text-background px-4 py-3 shadow-lg active:scale-[0.98] transition-transform"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex-shrink-0">
            <ShoppingBag size={22} />
            <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {totalItems}
            </span>
          </div>
          <div className="flex flex-col min-w-0 text-left">
            <span className="text-sm font-semibold truncate">{restaurantName}</span>
            <span className="text-xs opacity-70">฿{subtotal.toFixed(0)}</span>
          </div>
        </div>
        <ChevronRight size={20} className="flex-shrink-0" />
      </Link>
    </div>
  );
}
