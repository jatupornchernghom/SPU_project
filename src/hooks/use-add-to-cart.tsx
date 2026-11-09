"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/cart-store";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { SerializedMenu } from "@/types";

/**
 * An order can only come from one restaurant, so adding a dish from a
 * different restaurant than what's already in the cart asks first instead of
 * silently replacing the cart. Render `confirmDialog` next to the add button.
 */
export function useAddToCart() {
  const addItem = useCartStore((s) => s.addItem);
  const [pending, setPending] = useState<SerializedMenu | null>(null);

  function add(menu: SerializedMenu) {
    addItem(menu.restaurantId, menu.restaurantName, {
      menuId: menu.id,
      name: menu.name,
      price: menu.price,
      image: menu.image,
    });
    toast.success(`เพิ่ม "${menu.name}" ลงตะกร้าแล้ว`);
  }

  function requestAdd(menu: SerializedMenu) {
    const { restaurantId, items } = useCartStore.getState();
    if (items.length > 0 && restaurantId !== menu.restaurantId) {
      setPending(menu);
      return;
    }
    add(menu);
  }

  const cartRestaurantName = useCartStore((s) => s.restaurantName);

  const confirmDialog = (
    <AlertDialog open={pending !== null} onOpenChange={(open) => !open && setPending(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>เปลี่ยนไปสั่งร้าน {pending?.restaurantName}?</AlertDialogTitle>
          <AlertDialogDescription>
            ตะกร้ามีเมนูจากร้าน {cartRestaurantName} อยู่แล้ว สั่งได้ครั้งละ 1 ร้านเท่านั้น
            ถ้าเพิ่มเมนูนี้ รายการเดิมในตะกร้าจะถูกล้างออก
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>เก็บตะกร้าเดิมไว้</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (pending) add(pending);
              setPending(null);
            }}
          >
            ล้างตะกร้าแล้วเพิ่ม
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return { requestAdd, confirmDialog };
}
