import { connectToDatabase } from "@/lib/mongodb";
import { User, type IUser } from "@/models/User";
import { Restaurant } from "@/models/Restaurant";
import type { SerializedUser } from "@/types";

export function serializeUser(
  user: Pick<IUser, "_id" | "name" | "email" | "phone" | "role" | "restaurantId" | "createdAt">,
  restaurantName?: string
): SerializedUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    restaurantId: user.restaurantId?.toString(),
    restaurantName,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function listUsers(): Promise<SerializedUser[]> {
  await connectToDatabase();
  const [users, restaurants] = await Promise.all([
    User.find().select("name email phone role restaurantId createdAt").sort({ createdAt: -1 }).lean(),
    Restaurant.find().select("name").lean(),
  ]);
  const names = new Map(restaurants.map((r) => [r._id.toString(), r.name]));
  return users.map((u) => serializeUser(u, u.restaurantId ? names.get(u.restaurantId.toString()) : undefined));
}
