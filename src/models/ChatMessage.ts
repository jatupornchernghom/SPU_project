import { Schema, model, models, type Model, type Types } from "mongoose";
import { CHAT_SENDERS, type ChatSender } from "@/types";

/** One message in the customer <-> restaurant conversation about an order. */
export interface IChatMessage {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  restaurantId: Types.ObjectId;
  senderId: Types.ObjectId;
  sender: ChatSender;
  text: string;
  /** When the other side read it. */
  readAt?: Date;
  createdAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: String, enum: CHAT_SENDERS, required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
    readAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ChatMessage: Model<IChatMessage> =
  models.ChatMessage ?? model<IChatMessage>("ChatMessage", chatMessageSchema);
