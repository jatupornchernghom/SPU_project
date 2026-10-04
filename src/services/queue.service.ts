import { Order } from "@/models/Order";
import { Restaurant, type IRestaurant } from "@/models/Restaurant";

const ACTIVE_STATUSES = ["ORDER_RECEIVED", "PREPARING"] as const;

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Generates the next human-readable queue number for a restaurant, e.g. "A-27".
 * Based on a per-restaurant, per-day counter. Swappable later for a different
 * numbering scheme (e.g. per-zone, reset-on-close) without touching callers.
 */
export async function getNextQueueNumber(restaurant: Pick<IRestaurant, "_id" | "queuePrefix">) {
  const countToday = await Order.countDocuments({
    restaurantId: restaurant._id,
    createdAt: { $gte: startOfToday() },
  });

  return `${restaurant.queuePrefix}-${countToday + 1}`;
}

/**
 * Estimated wait time formula (minutes): active orders in the kitchen ×
 * the restaurant's average preparation time. Documented here so the
 * algorithm can be swapped (e.g. divide by kitchen concurrency) in one place.
 */
export async function estimateWaitTime(restaurantId: string) {
  const restaurant = await Restaurant.findById(restaurantId).select("averagePreparationTime");
  if (!restaurant) return 0;

  const activeOrders = await Order.countDocuments({
    restaurantId,
    status: { $in: ACTIVE_STATUSES },
  });

  return activeOrders * restaurant.averagePreparationTime;
}

/**
 * Generates a unique 6-digit pickup code, checked against currently-active
 * orders (collisions with completed/cancelled orders don't matter).
 */
export async function generatePickupCode(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const exists = await Order.exists({
      pickupCode: code,
      status: { $in: [...ACTIVE_STATUSES, "READY_FOR_PICKUP"] },
    });
    if (!exists) return code;
  }
  throw new Error("Could not generate a unique pickup code, please retry");
}
