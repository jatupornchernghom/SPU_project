import { Schema, model, models, type Model, type Types } from "mongoose";
import { ORDER_STATUSES, type OrderStatus } from "@/types";

export interface IQueue {
  _id: Types.ObjectId;
  restaurantId: Types.ObjectId;
  orderId: Types.ObjectId;
  queueNumber: string;
  status: OrderStatus;
  estimatedWaitTime: number;
  createdAt: Date;
  updatedAt: Date;
}

const queueSchema = new Schema<IQueue>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    queueNumber: { type: String, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: "ORDER_RECEIVED" },
    estimatedWaitTime: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export const Queue: Model<IQueue> = models.Queue ?? model<IQueue>("Queue", queueSchema);
