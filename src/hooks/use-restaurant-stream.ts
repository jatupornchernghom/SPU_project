"use client";

import { useEffect, useState } from "react";
import type { SerializedChatMessage, SerializedOrder } from "@/types";

export function useRestaurantStream(
  restaurantId: string,
  onOrder: (order: SerializedOrder) => void,
  onChat?: (message: SerializedChatMessage) => void
) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const source = new EventSource(`/api/restaurants/${restaurantId}/stream`);

    source.addEventListener("ready", () => setConnected(true));
    source.addEventListener("order", (event) => {
      const data = JSON.parse((event as MessageEvent).data) as SerializedOrder;
      onOrder(data);
    });
    source.addEventListener("chat", (event) => {
      onChat?.(JSON.parse((event as MessageEvent).data) as SerializedChatMessage);
    });
    source.onerror = () => setConnected(false);

    return () => {
      source.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [restaurantId]);

  return connected;
}
