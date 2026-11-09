import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { Order } from "@/models/Order";
import { Restaurant } from "@/models/Restaurant";
import { Review, type IReview } from "@/models/Review";
import { User } from "@/models/User";
import { OrderError } from "@/services/order.service";
import type { CreateReviewInput } from "@/lib/validations/review";
import type { SerializedReview } from "@/types";

function serializeReview(review: IReview, userName: string): SerializedReview {
  return {
    id: review._id.toString(),
    orderId: review.orderId.toString(),
    restaurantId: review.restaurantId.toString(),
    userName,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt.toISOString(),
  };
}

/** Recompute a restaurant's rating as the average of its reviews. */
async function refreshRestaurantRating(restaurantId: Types.ObjectId) {
  const [stats] = await Review.aggregate<{ avg: number; count: number }>([
    { $match: { restaurantId } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  if (!stats) return;
  await Restaurant.updateOne(
    { _id: restaurantId },
    { rating: Math.round(stats.avg * 10) / 10, reviewCount: stats.count }
  );
}

export async function createReview(
  userId: string,
  orderId: string,
  input: CreateReviewInput
): Promise<SerializedReview> {
  await connectToDatabase();

  const order = await Order.findById(orderId);
  if (!order || order.userId.toString() !== userId) throw new OrderError("ไม่พบคำสั่งซื้อนี้", 404);
  if (order.status !== "COMPLETED") throw new OrderError("รีวิวได้หลังรับอาหารแล้วเท่านั้น", 400);
  if (await Review.exists({ orderId: order._id })) throw new OrderError("คุณรีวิวออเดอร์นี้ไปแล้ว", 409);

  let review: IReview;
  try {
    review = await Review.create({
      orderId: order._id,
      userId: order.userId,
      restaurantId: order.restaurantId,
      rating: input.rating,
      comment: input.comment,
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) throw new OrderError("คุณรีวิวออเดอร์นี้ไปแล้ว", 409);
    throw error;
  }

  await refreshRestaurantRating(order.restaurantId);

  const user = await User.findById(userId).select("name");
  return serializeReview(review, user?.name ?? "");
}

export async function getReviewForOrder(orderId: string): Promise<SerializedReview | null> {
  if (!Types.ObjectId.isValid(orderId)) return null;
  await connectToDatabase();
  const review = await Review.findOne({ orderId });
  if (!review) return null;
  const user = await User.findById(review.userId).select("name");
  return serializeReview(review, user?.name ?? "");
}

export async function listReviewsForRestaurant(restaurantId: string, limit = 20): Promise<SerializedReview[]> {
  if (!Types.ObjectId.isValid(restaurantId)) return [];
  await connectToDatabase();
  const reviews = await Review.find({ restaurantId }).sort({ createdAt: -1 }).limit(limit);
  const users = await User.find({ _id: { $in: reviews.map((r) => r.userId) } }).select("name");
  const nameMap = new Map(users.map((u) => [u._id.toString(), u.name]));
  return reviews.map((r) => serializeReview(r, nameMap.get(r.userId.toString()) ?? ""));
}
