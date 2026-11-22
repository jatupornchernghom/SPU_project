import { EventEmitter } from "node:events";
import type { SerializedChatMessage, SerializedOrder } from "@/types";

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

// Chat: one channel per order (the open conversation) and one per restaurant
// (unread badges / alerts on the staff dashboard).
export function chatChannel(orderId: string) {
  return `chat:${orderId}`;
}

export function restaurantChatChannel(restaurantId: string) {
  return `restaurant-chat:${restaurantId}`;
}

export function publishChatMessage(restaurantId: string, message: SerializedChatMessage) {
  bus.emit(chatChannel(message.orderId), message);
  bus.emit(restaurantChatChannel(restaurantId), message);
}

export function subscribeChat(channel: string, listener: (message: SerializedChatMessage) => void) {
  bus.on(channel, listener);
  return () => bus.off(channel, listener);
}
