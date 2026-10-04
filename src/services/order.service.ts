import { connectToDatabase } from "@/lib/mongodb";
import { Menu } from "@/models/Menu";
import { Restaurant } from "@/models/Restaurant";
import { Order, type IOrderItem } from "@/models/Order";
import { Queue } from "@/models/Queue";
import { serializeOrder } from "@/lib/serialize";
import { estimateWaitTime, generatePickupCode, getNextQueueNumber } from "@/services/queue.service";
import { processPayment } from "@/services/payment.service";
import { notify } from "@/services/notification.service";
import { publishOrderUpdate } from "@/lib/eventBus";
import type { CreateOrderInput } from "@/lib/validations/order";
import { NOTIFICATION_TYPES, type OrderStatus, type PaymentStatus, type SerializedOrder } from "@/types";

export class OrderError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  ORDER_RECEIVED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY_FOR_PICKUP", "CANCELLED"],
  READY_FOR_PICKUP: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

function todayOrderNumber(sequence: number) {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `ORD-${y}${m}${d}-${String(sequence).padStart(5, "0")}`;
}

export async function createOrder(userId: string, input: CreateOrderInput): Promise<SerializedOrder> {
  await connectToDatabase();

  const restaurant = await Restaurant.findById(input.restaurantId);
  if (!restaurant) throw new OrderError("ไม่พบร้านอาหารนี้", 404);
  if (!restaurant.isOpen) throw new OrderError("ร้านนี้ปิดอยู่ในขณะนี้", 400);

  const menuIds = input.items.map((i) => i.menuId);
  const menus = await Menu.find({ _id: { $in: menuIds }, restaurantId: restaurant._id });
  if (menus.length !== menuIds.length) {
    throw new OrderError("มีเมนูบางรายการไม่พบในร้านนี้", 400);
  }

  const menuMap = new Map(menus.map((m) => [m._id.toString(), m]));
  const orderItems: IOrderItem[] = input.items.map((item) => {
    const menu = menuMap.get(item.menuId)!;
    if (!menu.isAvailable) {
      throw new OrderError(`เมนู "${menu.name}" หมดแล้ว`, 400);
    }
    return {
      menuId: menu._id,
      name: menu.name,
      price: menu.price,
      quantity: item.quantity,
      subtotal: menu.price * item.quantity,
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
  const total = subtotal;

  // QR_PAYMENT pays the restaurant's own PromptPay account directly — the
  // platform has no way to verify that automatically, so the order is
  // created with payment PENDING and the restaurant confirms receipt
  // themselves (see confirmPayment()). Other methods go through the mock
  // gateway as before.
  let paymentStatus: PaymentStatus;
  if (input.paymentMethod === "QR_PAYMENT") {
    paymentStatus = "PENDING";
  } else {
    const payment = await processPayment({ amount: total, method: input.paymentMethod });
    if (payment.status !== "PAID") {
      throw new OrderError("การชำระเงินไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", 402);
    }
    paymentStatus = payment.status;
  }

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [queueNumber, pickupCode, estimatedWaitTime, ordersTodayCount] = await Promise.all([
    getNextQueueNumber(restaurant),
    generatePickupCode(),
    estimateWaitTime(restaurant._id.toString()),
    Order.countDocuments({ createdAt: { $gte: startOfToday } }),
  ]);

  const order = await Order.create({
    orderNumber: todayOrderNumber(ordersTodayCount + 1),
    userId,
    restaurantId: restaurant._id,
    items: orderItems,
    subtotal,
    total,
    pickupTime: input.pickupTime,
    queueNumber,
    pickupCode,
    status: "ORDER_RECEIVED",
    paymentStatus,
    paymentMethod: input.paymentMethod,
    estimatedWaitTime,
  });

  await Queue.create({
    restaurantId: restaurant._id,
    orderId: order._id,
    queueNumber,
    status: "ORDER_RECEIVED",
    estimatedWaitTime,
  });

  await notify(userId, order._id.toString(), "ORDER_RECEIVED");

  const serialized = serializeOrder(order, restaurant.name);
  publishOrderUpdate(serialized);

  return serialized;
}

export async function updateOrderStatus(
  orderId: string,
  nextStatus: OrderStatus,
  actor: { role: string; restaurantId?: string }
): Promise<SerializedOrder> {
  await connectToDatabase();

  const order = await Order.findById(orderId);
  if (!order) throw new OrderError("ไม่พบคำสั่งซื้อนี้", 404);

  if (actor.role === "RESTAURANT_STAFF" && order.restaurantId.toString() !== actor.restaurantId) {
    throw new OrderError("คุณไม่มีสิทธิ์แก้ไขคำสั่งซื้อนี้", 403);
  }

  const allowed = STATUS_TRANSITIONS[order.status];
  if (!allowed.includes(nextStatus)) {
    throw new OrderError(`ไม่สามารถเปลี่ยนสถานะจาก ${order.status} เป็น ${nextStatus} ได้`, 400);
  }

  if (nextStatus === "PREPARING" && order.paymentStatus === "PENDING") {
    throw new OrderError("กรุณายืนยันรับยอดชำระเงินก่อนเริ่มปรุงอาหาร", 400);
  }

  order.status = nextStatus;
  await order.save();
  await Queue.updateOne({ orderId: order._id }, { status: nextStatus });
  if (NOTIFICATION_TYPES.includes(nextStatus as (typeof NOTIFICATION_TYPES)[number])) {
    await notify(order.userId.toString(), order._id.toString(), nextStatus as (typeof NOTIFICATION_TYPES)[number]);
  }

  const restaurant = await Restaurant.findById(order.restaurantId).select("name");
  const serialized = serializeOrder(order, restaurant?.name ?? "");
  publishOrderUpdate(serialized);

  return serialized;
}

/**
 * Restaurant staff manually confirming they received the PromptPay transfer
 * for an order (see the note in `createOrder`). This only flips
 * `paymentStatus`; it does not change `status` — staff still click through
 * ORDER_RECEIVED -> PREPARING separately once they're ready to cook.
 */
export async function confirmPayment(
  orderId: string,
  actor: { role: string; restaurantId?: string }
): Promise<SerializedOrder> {
  await connectToDatabase();

  const order = await Order.findById(orderId);
  if (!order) throw new OrderError("ไม่พบคำสั่งซื้อนี้", 404);

  if (actor.role === "RESTAURANT_STAFF" && order.restaurantId.toString() !== actor.restaurantId) {
    throw new OrderError("คุณไม่มีสิทธิ์แก้ไขคำสั่งซื้อนี้", 403);
  }

  if (order.paymentStatus !== "PENDING") {
    throw new OrderError("คำสั่งซื้อนี้ไม่ได้อยู่ในสถานะรอยืนยันการชำระเงิน", 400);
  }

  order.paymentStatus = "PAID";
  await order.save();

  const restaurant = await Restaurant.findById(order.restaurantId).select("name");
  const serialized = serializeOrder(order, restaurant?.name ?? "");
  publishOrderUpdate(serialized);

  return serialized;
}

export async function getOrderById(
  orderId: string,
  actor: { id: string; role: string; restaurantId?: string }
): Promise<SerializedOrder | null> {
  await connectToDatabase();
  const order = await Order.findById(orderId);
  if (!order) return null;

  const isOwner = order.userId.toString() === actor.id;
  const isRestaurantStaff =
    actor.role === "RESTAURANT_STAFF" && order.restaurantId.toString() === actor.restaurantId;
  const isAdmin = actor.role === "ADMIN";

  if (!isOwner && !isRestaurantStaff && !isAdmin) {
    throw new OrderError("คุณไม่มีสิทธิ์เข้าถึงคำสั่งซื้อนี้", 403);
  }

  const restaurant = await Restaurant.findById(order.restaurantId).select("name");
  return serializeOrder(order, restaurant?.name ?? "");
}

export async function listOrdersForUser(userId: string): Promise<SerializedOrder[]> {
  await connectToDatabase();
  const orders = await Order.find({ userId }).sort({ createdAt: -1 });
  const restaurantIds = [...new Set(orders.map((o) => o.restaurantId.toString()))];
  const restaurants = await Restaurant.find({ _id: { $in: restaurantIds } }).select("name");
  const nameMap = new Map(restaurants.map((r) => [r._id.toString(), r.name]));

  return orders.map((o) => serializeOrder(o, nameMap.get(o.restaurantId.toString()) ?? ""));
}

export async function listOrdersForRestaurant(restaurantId: string): Promise<SerializedOrder[]> {
  await connectToDatabase();
  const restaurant = await Restaurant.findById(restaurantId).select("name");
  const orders = await Order.find({ restaurantId }).sort({ createdAt: -1 });
  return orders.map((o) => serializeOrder(o, restaurant?.name ?? ""));
}

export async function listAllOrdersForAdmin(filters: {
  restaurantId?: string;
  status?: OrderStatus;
  date?: string;
  userEmail?: string;
}): Promise<SerializedOrder[]> {
  await connectToDatabase();

  const query: Record<string, unknown> = {};
  if (filters.restaurantId) query.restaurantId = filters.restaurantId;
  if (filters.status) query.status = filters.status;
  if (filters.date) {
    const start = new Date(filters.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    query.createdAt = { $gte: start, $lt: end };
  }
  if (filters.userEmail) {
    const { User } = await import("@/models/User");
    const user = await User.findOne({ email: filters.userEmail.toLowerCase() }).select("_id");
    query.userId = user?._id ?? null;
  }

  const orders = await Order.find(query).sort({ createdAt: -1 }).limit(200);
  const restaurantIds = [...new Set(orders.map((o) => o.restaurantId.toString()))];
  const restaurants = await Restaurant.find({ _id: { $in: restaurantIds } }).select("name");
  const nameMap = new Map(restaurants.map((r) => [r._id.toString(), r.name]));

  return orders.map((o) => serializeOrder(o, nameMap.get(o.restaurantId.toString()) ?? ""));
}

export async function completeOrderByPickupCode(
  restaurantId: string,
  pickupCode: string
): Promise<SerializedOrder> {
  await connectToDatabase();
  const order = await Order.findOne({ restaurantId, pickupCode, status: "READY_FOR_PICKUP" });
  if (!order) throw new OrderError("ไม่พบคำสั่งซื้อที่พร้อมรับด้วยรหัสนี้", 404);

  return updateOrderStatus(order._id.toString(), "COMPLETED", { role: "RESTAURANT_STAFF", restaurantId });
}
