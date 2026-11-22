import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { ChatMessage, type IChatMessage } from "@/models/ChatMessage";
import { Order } from "@/models/Order";
import { Restaurant } from "@/models/Restaurant";
import { User } from "@/models/User";
import { publishChatMessage } from "@/lib/eventBus";
import { sendPushToUser } from "@/lib/web-push";
import { OrderError } from "@/services/order.service";
import type { ChatSender, SerializedChatMessage, UserRole } from "@/types";

type Actor = { id: string; role: UserRole; restaurantId?: string };

export function serializeChatMessage(m: Pick<IChatMessage, "_id" | "orderId" | "sender" | "text" | "createdAt" | "readAt">): SerializedChatMessage {
  return {
    id: m._id.toString(),
    orderId: m.orderId.toString(),
    sender: m.sender,
    text: m.text,
    createdAt: m.createdAt.toISOString(),
    readAt: m.readAt ? m.readAt.toISOString() : null,
  };
}

/**
 * Who may use an order's chat: its customer and the restaurant's own staff.
 * Admins can read it (side null) but not post.
 */
async function resolveChatAccess(orderId: string, actor: Actor) {
  await connectToDatabase();
  if (!Types.ObjectId.isValid(orderId)) throw new OrderError("ไม่พบคำสั่งซื้อนี้", 404);
  const order = await Order.findById(orderId).select("userId restaurantId status");
  if (!order) throw new OrderError("ไม่พบคำสั่งซื้อนี้", 404);

  let side: ChatSender | null;
  if (order.userId.toString() === actor.id) side = "CUSTOMER";
  else if (actor.role === "RESTAURANT_STAFF" && order.restaurantId.toString() === actor.restaurantId) side = "RESTAURANT";
  else if (actor.role === "ADMIN") side = null;
  else throw new OrderError("คุณไม่มีสิทธิ์เข้าถึงแชทของคำสั่งซื้อนี้", 403);

  return { order, side };
}

export async function getChat(orderId: string, actor: Actor) {
  const { side } = await resolveChatAccess(orderId, actor);
  const messages = await ChatMessage.find({ orderId }).sort({ createdAt: 1 }).limit(300);
  return { side, messages: messages.map(serializeChatMessage) };
}

export async function sendChatMessage(orderId: string, actor: Actor, text: string) {
  const { order, side } = await resolveChatAccess(orderId, actor);
  if (!side) throw new OrderError("ผู้ดูแลระบบอ่านแชทได้อย่างเดียว", 403);

  const message = await ChatMessage.create({
    orderId: order._id,
    restaurantId: order.restaurantId,
    senderId: actor.id,
    sender: side,
    text,
  });
  const serialized = serializeChatMessage(message);
  publishChatMessage(order.restaurantId.toString(), serialized);

  // The customer is usually not looking at the page — reach their phone.
  // (Staff keep the dashboard open and get a live alert there instead.)
  if (side === "RESTAURANT") {
    const customerId = order.userId.toString();
    void Promise.all([
      User.exists({ _id: customerId, notificationsEnabled: true }),
      Restaurant.findById(order.restaurantId).select("name").lean(),
    ])
      .then(([wantsPush, restaurant]) =>
        wantsPush
          ? sendPushToUser(customerId, {
              title: `ข้อความจาก${restaurant?.name ?? "ร้าน"}`,
              body: text.length > 120 ? `${text.slice(0, 117)}...` : text,
              url: `/orders/${orderId}`,
              tag: `chat-${orderId}`,
            })
          : undefined
      )
      .catch((error) => console.error("chat push failed", error));
  }

  return serialized;
}

/** Marks everything the other side sent as read by `actor`. */
export async function markChatRead(orderId: string, actor: Actor) {
  const { side } = await resolveChatAccess(orderId, actor);
  if (!side) return;
  await ChatMessage.updateMany({ orderId, sender: { $ne: side }, readAt: null }, { readAt: new Date() });
}

/** Unread customer messages per order, for a restaurant's dashboard badges. */
export async function unreadChatCountsForRestaurant(restaurantId: string): Promise<Record<string, number>> {
  await connectToDatabase();
  const rows = await ChatMessage.aggregate<{ _id: Types.ObjectId; count: number }>([
    { $match: { restaurantId: new Types.ObjectId(restaurantId), sender: "CUSTOMER", readAt: null } },
    { $group: { _id: "$orderId", count: { $sum: 1 } } },
  ]);
  return Object.fromEntries(rows.map((r) => [r._id.toString(), r.count]));
}
