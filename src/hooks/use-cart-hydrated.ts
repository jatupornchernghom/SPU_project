"use client";

import { useSyncExternalStore } from "react";
import { useCartStore } from "@/lib/cart-store";

function subscribe(callback: () => void) {
  return useCartStore.persist.onFinishHydration(callback);
}

function getSnapshot() {
  return useCartStore.persist.hasHydrated();
}

function getServerSnapshot() {
  return false;
}

export function useCartHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
