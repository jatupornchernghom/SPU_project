import { Schema, model, models, type Model, type Types } from "mongoose";

export interface IMenu {
  _id: Types.ObjectId;
  restaurantId: Types.ObjectId;
  name: string;
  description: string;
  image: string;
  price: number;
  category: string;
  rating: number;
  isAvailable: boolean;
  preparationTime: number;
  popular: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const menuSchema = new Schema<IMenu>(
  {
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    isAvailable: { type: Boolean, default: true },
    preparationTime: { type: Number, required: true, min: 1 },
    popular: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Menu: Model<IMenu> = models.Menu ?? model<IMenu>("Menu", menuSchema);
