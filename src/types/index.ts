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

export const PAYMENT_METHODS = ["QR_PAYMENT", "MOBILE_BANKING", "WALLET"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

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
