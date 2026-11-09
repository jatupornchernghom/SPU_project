"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";
import { useCartHydrated } from "@/hooks/use-cart-hydrated";

/** Clears a cart left behind by a different account on this browser. */
export function CartOwnerSync({ userId }: { userId: string | null }) {
  const hydrated = useCartHydrated();
  const syncOwner = useCartStore((s) => s.syncOwner);

  useEffect(() => {
    if (hydrated) syncOwner(userId);
  }, [hydrated, userId, syncOwner]);

  return null;
}
