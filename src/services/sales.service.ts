import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Restaurant } from "@/models/Restaurant";

// Days are bucketed in Thai time regardless of the server's own timezone.
const TIMEZONE = "Asia/Bangkok";
const TZ_OFFSET_MS = 7 * 60 * 60 * 1000; // Thailand has no daylight saving
const DAY_MS = 24 * 60 * 60 * 1000;

export type SalesReport = {
  days: number;
  daily: { date: string; orders: number; revenue: number }[];
  topItems: { name: string; quantity: number; revenue: number }[];
  /** Admin-wide reports only. */
  byRestaurant?: { name: string; revenue: number; orders: number }[];
  totalRevenue: number;
  totalOrders: number;
};

/**
 * Daily revenue / order counts plus best sellers for the last `days` days.
 * Cancelled orders are excluded; revenue only counts orders that are PAID.
 */
export async function getSalesReport({
  restaurantId,
  days = 14,
}: {
  restaurantId?: string;
  days?: number;
}): Promise<SalesReport> {
  await connectToDatabase();

  const todayStartThai = Math.floor((Date.now() + TZ_OFFSET_MS) / DAY_MS) * DAY_MS - TZ_OFFSET_MS;
  const since = new Date(todayStartThai - (days - 1) * DAY_MS);

  const match: Record<string, unknown> = { createdAt: { $gte: since }, status: { $ne: "CANCELLED" } };
  if (restaurantId) match.restaurantId = new Types.ObjectId(restaurantId);
  const paidRevenue = { $cond: [{ $eq: ["$paymentStatus", "PAID"] }, "$total", 0] };

  const [dailyAgg, itemsAgg, restaurantAgg] = await Promise.all([
    Order.aggregate<{ _id: string; orders: number; revenue: number }>([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: TIMEZONE } },
          orders: { $sum: 1 },
          revenue: { $sum: paidRevenue },
        },
      },
    ]),
    Order.aggregate<{ _id: string; quantity: number; revenue: number }>([
      { $match: { ...match, paymentStatus: "PAID" } },
      { $unwind: "$items" },
      { $group: { _id: "$items.name", quantity: { $sum: "$items.quantity" }, revenue: { $sum: "$items.subtotal" } } },
      { $sort: { quantity: -1, revenue: -1 } },
      { $limit: 5 },
    ]),
    restaurantId
      ? Promise.resolve(null)
      : Order.aggregate<{ _id: Types.ObjectId; orders: number; revenue: number }>([
          { $match: match },
          { $group: { _id: "$restaurantId", orders: { $sum: 1 }, revenue: { $sum: paidRevenue } } },
          { $sort: { revenue: -1 } },
        ]),
  ]);

  // Every day in the range, including days with no orders.
  const byDate = new Map(dailyAgg.map((d) => [d._id, d]));
  const daily = Array.from({ length: days }, (_, i) => {
    const date = new Date(since.getTime() + TZ_OFFSET_MS + i * DAY_MS).toISOString().slice(0, 10);
    const row = byDate.get(date);
    return { date, orders: row?.orders ?? 0, revenue: row?.revenue ?? 0 };
  });

  let byRestaurant: SalesReport["byRestaurant"];
  if (restaurantAgg) {
    const restaurants = await Restaurant.find({ _id: { $in: restaurantAgg.map((r) => r._id) } }).select("name").lean();
    const names = new Map(restaurants.map((r) => [r._id.toString(), r.name]));
    byRestaurant = restaurantAgg.map((r) => ({
      name: names.get(r._id.toString()) ?? "ร้านที่ถูกลบ",
      revenue: r.revenue,
      orders: r.orders,
    }));
  }

  return {
    days,
    daily,
    topItems: itemsAgg.map((i) => ({ name: i._id, quantity: i.quantity, revenue: i.revenue })),
    byRestaurant,
    totalRevenue: daily.reduce((sum, d) => sum + d.revenue, 0),
    totalOrders: daily.reduce((sum, d) => sum + d.orders, 0),
  };
}
