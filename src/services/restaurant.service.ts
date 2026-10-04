import { connectToDatabase } from "@/lib/mongodb";
import { Restaurant } from "@/models/Restaurant";
import { Menu } from "@/models/Menu";
import { Order } from "@/models/Order";
import { serializeMenu, serializeRestaurant } from "@/lib/serialize";
import type { OrderStatus, SerializedMenu, SerializedRestaurant } from "@/types";

const ACTIVE_STATUSES: OrderStatus[] = ["ORDER_RECEIVED", "PREPARING"];

export async function listRestaurants(): Promise<SerializedRestaurant[]> {
  await connectToDatabase();
  const restaurants = await Restaurant.find().sort({ rating: -1 });

  const counts = await Order.aggregate<{ _id: string; count: number }>([
    { $match: { status: { $in: ACTIVE_STATUSES } } },
    { $group: { _id: "$restaurantId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));

  return restaurants.map((r) => serializeRestaurant(r, countMap.get(r._id.toString()) ?? 0));
}

export async function getRestaurantById(id: string): Promise<SerializedRestaurant | null> {
  await connectToDatabase();
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) return null;

  const activeOrderCount = await Order.countDocuments({
    restaurantId: id,
    status: { $in: ACTIVE_STATUSES },
  });

  return serializeRestaurant(restaurant, activeOrderCount);
}

export async function listAllMenu(): Promise<SerializedMenu[]> {
  await connectToDatabase();
  const menus = await Menu.find().sort({ createdAt: -1 });
  const restaurants = await Restaurant.find().select("name");
  const nameMap = new Map(restaurants.map((r) => [r._id.toString(), r.name]));

  return menus.map((m) => serializeMenu(m, nameMap.get(m.restaurantId.toString()) ?? ""));
}

export async function listMenuForRestaurant(restaurantId: string): Promise<SerializedMenu[]> {
  await connectToDatabase();
  const [restaurant, menus] = await Promise.all([
    Restaurant.findById(restaurantId).select("name"),
    Menu.find({ restaurantId }).sort({ popular: -1, name: 1 }),
  ]);

  return menus.map((m) => serializeMenu(m, restaurant?.name ?? ""));
}

export async function getPopularMenu(limit = 8): Promise<SerializedMenu[]> {
  await connectToDatabase();
  const menus = await Menu.find({ popular: true, isAvailable: true })
    .sort({ rating: -1 })
    .limit(limit);
  const restaurantIds = [...new Set(menus.map((m) => m.restaurantId.toString()))];
  const restaurants = await Restaurant.find({ _id: { $in: restaurantIds } }).select("name");
  const nameMap = new Map(restaurants.map((r) => [r._id.toString(), r.name]));

  return menus.map((m) => serializeMenu(m, nameMap.get(m.restaurantId.toString()) ?? ""));
}

export async function getRandomMenu(): Promise<SerializedMenu | null> {
  await connectToDatabase();
  const openRestaurantIds = await Restaurant.find({ isOpen: true }).distinct("_id");
  if (openRestaurantIds.length === 0) return null;

  const [menu] = await Menu.aggregate([
    { $match: { restaurantId: { $in: openRestaurantIds }, isAvailable: true } },
    { $sample: { size: 1 } },
  ]);
  if (!menu) return null;

  const restaurant = await Restaurant.findById(menu.restaurantId).select("name");
  return serializeMenu(menu, restaurant?.name ?? "");
}
