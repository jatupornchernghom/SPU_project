"use client";

import { useEffect, useState } from "react";
import type { SerializedOrder } from "@/types";

export function useRestaurantStream(restaurantId: string, onOrder: (order: SerializedOrder) => void) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const source = new EventSource(`/api/restaurants/${restaurantId}/stream`);

    source.addEventListener("ready", () => setConnected(true));
    source.addEventListener("order", (event) => {
      const data = JSON.parse((event as MessageEvent).data) as SerializedOrder;
      onOrder(data);
    });
    source.onerror = () => setConnected(false);

    return () => {
      source.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  return connected;
}
