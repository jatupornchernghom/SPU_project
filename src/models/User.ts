import { Schema, model, models, type Model, type Types } from "mongoose";
import { USER_ROLES, type UserRole } from "@/types";

export interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  /** Absent for accounts that only sign in with Google. */
  passwordHash?: string;
  studentId?: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  restaurantId?: Types.ObjectId;
  favoriteMenuIds: Types.ObjectId[];
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    studentId: { type: String, trim: true },
    phone: { type: String, trim: true },
    role: { type: String, enum: USER_ROLES, required: true, default: "STUDENT" },
    avatar: { type: String },
    restaurantId: { type: Schema.Types.ObjectId, ref: "Restaurant" },
    favoriteMenuIds: [{ type: Schema.Types.ObjectId, ref: "Menu" }],
    notificationsEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User: Model<IUser> = models.User ?? model<IUser>("User", userSchema);
