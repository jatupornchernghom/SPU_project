import { EventEmitter } from "node:events";
import type { SerializedOrder } from "@/types";

/**
 * In-memory pub/sub for pushing order-status changes to open SSE connections.
 * Single-instance only — fine for this MVP/demo. For multi-instance deploys,
 * swap this for MongoDB change streams or a Redis pub/sub channel without
 * touching any of the callers below.
 */

declare global {
  var _skipqEventBus: EventEmitter | undefined;
}

const bus = global._skipqEventBus ?? new EventEmitter();
bus.setMaxListeners(0);
global._skipqEventBus = bus;

export function orderChannel(orderId: string) {
  return `order:${orderId}`;
}

export function restaurantChannel(restaurantId: string) {
  return `restaurant:${restaurantId}`;
}

export function publishOrderUpdate(order: SerializedOrder) {
  bus.emit(orderChannel(order.id), order);
  bus.emit(restaurantChannel(order.restaurantId), order);
}

export function subscribe(channel: string, listener: (order: SerializedOrder) => void) {
  bus.on(channel, listener);
  return () => bus.off(channel, listener);
}
