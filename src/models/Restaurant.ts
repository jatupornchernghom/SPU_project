import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IRestaurant {
  _id: Types.ObjectId;
  name: string;
  description: string;
  image: string;
  location: string;
  category: string;
  isOpen: boolean;
  openingHours: string;
  averagePreparationTime: number;
  rating: number;
  queuePrefix: string;
  promptPayId: string;
  createdAt: Date;
  updatedAt: Date;
}

const restaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    location: { type: String, required: true },
    category: { type: String, required: true },
    isOpen: { type: Boolean, default: true },
    openingHours: { type: String, default: "08:00 - 16:00" },
    averagePreparationTime: { type: Number, required: true, min: 1 },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    queuePrefix: { type: String, required: true, uppercase: true, minlength: 1, maxlength: 2 },
    // Restaurant's own PromptPay ID (mobile/national ID/e-Wallet) — each
    // restaurant receives payment directly into its own account, so this is
    // per-restaurant rather than a single platform-wide account.
    promptPayId: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

export const Restaurant: Model<IRestaurant> =
  models.Restaurant ?? model<IRestaurant>("Restaurant", restaurantSchema);
