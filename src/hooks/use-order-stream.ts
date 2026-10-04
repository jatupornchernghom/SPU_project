"use client";

import { useEffect, useRef, useState } from "react";
import type { SerializedOrder } from "@/types";

export function useOrderStream(orderId: string, initialOrder: SerializedOrder) {
  const [order, setOrder] = useState(initialOrder);
  const sourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const source = new EventSource(`/api/orders/${orderId}/stream`);
    sourceRef.current = source;

    source.addEventListener("order", (event) => {
      const data = JSON.parse((event as MessageEvent).data) as SerializedOrder;
      setOrder(data);
    });

    source.onerror = () => {
      // EventSource auto-reconnects; nothing to do here for this MVP.
    };

    return () => {
      source.close();
    };
  }, [orderId]);

  return order;
}
