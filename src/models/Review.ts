import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IReview {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  restaurantId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    // One review per order — the unique index also guards against double submits.
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", trim: true, maxlength: 300 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Review: Model<IReview> = models.Review ?? model<IReview>("Review", reviewSchema);
