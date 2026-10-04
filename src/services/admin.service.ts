import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Menu } from "@/models/Menu";

export type AdminStats = {
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  revenue: number;
  popularMenu: { name: string; count: number }[];
  averagePreparationTime: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  await connectToDatabase();

  const [totalOrders, activeOrders, completedOrders, revenueAgg, popularMenuAgg, avgPrepAgg] =
    await Promise.all([
      Order.countDocuments({}),
      Order.countDocuments({
        status: { $in: ["ORDER_RECEIVED", "PREPARING", "READY_FOR_PICKUP"] as const },
      }),
      Order.countDocuments({ status: "COMPLETED" }),
      Order.aggregate([
        { $match: { paymentStatus: "PAID" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.aggregate([
        { $unwind: "$items" },
        { $group: { _id: "$items.name", count: { $sum: "$items.quantity" } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      Menu.aggregate([{ $group: { _id: null, avg: { $avg: "$preparationTime" } } }]),
    ]);

  return {
    totalOrders,
    activeOrders,
    completedOrders,
    revenue: revenueAgg[0]?.total ?? 0,
    popularMenu: popularMenuAgg.map((m) => ({ name: m._id as string, count: m.count as number })),
    averagePreparationTime: Math.round(avgPrepAgg[0]?.avg ?? 0),
  };
}
