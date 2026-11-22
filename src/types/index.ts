export const USER_ROLES = ["STUDENT", "STAFF", "RESTAURANT_STAFF", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ORDER_STATUSES = [
  "ORDER_RECEIVED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "COMPLETED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYMENT_STATUSES = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

/** Every method an order may carry, including retired ones kept for old orders. */
export const PAYMENT_METHODS = ["QR_PAYMENT", "CASH", "MOBILE_BANKING", "WALLET"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

/** What customers can pick at checkout. */
export const CHECKOUT_PAYMENT_METHODS = ["QR_PAYMENT", "CASH"] as const satisfies readonly PaymentMethod[];

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  QR_PAYMENT: "QR พร้อมเพย์",
  CASH: "เงินสด",
  MOBILE_BANKING: "Mobile Banking",
  WALLET: "SPU Wallet",
};

export const NOTIFICATION_TYPES = [
  "ORDER_RECEIVED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "COMPLETED",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type OrderItemInput = {
  menuId: string;
  quantity: number;
};

export type SerializedOrderItem = {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  note?: string;
};

export type SerializedOrder = {
  id: string;
  orderNumber: string;
  userId: string;
  restaurantId: string;
  restaurantName: string;
  items: SerializedOrderItem[];
  subtotal: number;
  total: number;
  pickupTime: string;
  queueNumber: string;
  pickupCode: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  estimatedWaitTime: number;
  createdAt: string;
  updatedAt: string;
};

export type SerializedRestaurant = {
  id: string;
  name: string;
  description: string;
  image: string;
  location: string;
  category: string;
  isOpen: boolean;
  openingHours: string;
  averagePreparationTime: number;
  rating: number;
  reviewCount: number;
  queuePrefix: string;
  promptPayId: string;
  activeOrderCount: number;
};

export type SerializedMenu = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  rating: number;
  isAvailable: boolean;
  preparationTime: number;
  popular: boolean;
};

export type SerializedReview = {
  id: string;
  orderId: string;
  restaurantId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type SerializedNotification = {
  id: string;
  userId: string;
  orderId?: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
};

export type SerializedUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  restaurantId?: string;
  restaurantName?: string;
  createdAt: string;
};

export const CHAT_SENDERS = ["CUSTOMER", "RESTAURANT"] as const;
export type ChatSender = (typeof CHAT_SENDERS)[number];

export type SerializedChatMessage = {
  id: string;
  orderId: string;
  sender: ChatSender;
  text: string;
  createdAt: string;
  readAt: string | null;
};

/** Per order, for the restaurant dashboard: unread customer messages and total messages. */
export type ChatSummary = { unread: number; total: number };
