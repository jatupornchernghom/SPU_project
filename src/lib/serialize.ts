import type { IRestaurant } from "@/models/Restaurant";
import type { IMenu } from "@/models/Menu";
import type { IOrder } from "@/models/Order";
import type { INotification } from "@/models/Notification";
import type {
  SerializedMenu,
  SerializedNotification,
  SerializedOrder,
  SerializedRestaurant,
} from "@/types";

export function serializeRestaurant(
  restaurant: IRestaurant,
  activeOrderCount = 0
): SerializedRestaurant {
  return {
    id: restaurant._id.toString(),
    name: restaurant.name,
    description: restaurant.description,
    image: restaurant.image,
    location: restaurant.location,
    category: restaurant.category,
    isOpen: restaurant.isOpen,
    openingHours: restaurant.openingHours,
    averagePreparationTime: restaurant.averagePreparationTime,
    rating: restaurant.rating,
    queuePrefix: restaurant.queuePrefix,
    promptPayId: restaurant.promptPayId,
    activeOrderCount,
  };
}

export function serializeMenu(menu: IMenu, restaurantName = ""): SerializedMenu {
  return {
    id: menu._id.toString(),
    restaurantId: menu.restaurantId.toString(),
    restaurantName,
    name: menu.name,
    description: menu.description,
    image: menu.image,
    price: menu.price,
    category: menu.category,
    rating: menu.rating,
    isAvailable: menu.isAvailable,
    preparationTime: menu.preparationTime,
    popular: menu.popular,
  };
}

export function serializeOrder(order: IOrder, restaurantName = ""): SerializedOrder {
  return {
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    userId: order.userId.toString(),
    restaurantId: order.restaurantId.toString(),
    restaurantName,
    items: order.items.map((item) => ({
      menuId: item.menuId.toString(),
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      subtotal: item.subtotal,
    })),
    subtotal: order.subtotal,
    total: order.total,
    pickupTime: order.pickupTime,
    queueNumber: order.queueNumber,
    pickupCode: order.pickupCode,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    estimatedWaitTime: order.estimatedWaitTime,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
  };
}

export function serializeNotification(notification: INotification): SerializedNotification {
  return {
    id: notification._id.toString(),
    userId: notification.userId.toString(),
    orderId: notification.orderId?.toString(),
    title: notification.title,
    message: notification.message,
    type: notification.type,
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
  };
}
