import { Schema, model, models, type Model, type Types } from "mongoose";
import {
  ORDER_STATUSES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  type OrderStatus,
  type PaymentMethod,
  type PaymentStatus,
} from "@/types";

export interface IOrderItem {
  menuId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface IOrder {
  _id: Types.ObjectId;
  orderNumber: string;
  userId: Types.ObjectId;
  restaurantId: Types.ObjectId;
  items: IOrderItem[];
  subtotal: number;
  total: number;
  pickupTime: string;
  queueNumber: string;
  pickupCode: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  estimatedWaitTime: number;
  createdAt: Date;
  updatedAt: Date;
}

const orderItemSchema = new Schema<IOrderItem>(
  {
    menuId: { type: Schema.Types.ObjectId, ref: "Menu", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    items: { type: [orderItemSchema], required: true, validate: (v: IOrderItem[]) => v.length > 0 },
    subtotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    pickupTime: { type: String, required: true },
    queueNumber: { type: String, required: true },
    pickupCode: { type: String, required: true },
    status: { type: String, enum: ORDER_STATUSES, default: "ORDER_RECEIVED", index: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUSES, default: "PENDING" },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    estimatedWaitTime: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

export const Order: Model<IOrder> = models.Order ?? model<IOrder>("Order", orderSchema);
