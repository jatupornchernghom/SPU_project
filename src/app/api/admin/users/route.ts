import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { isValidObjectId } from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { Restaurant } from "@/models/Restaurant";
import { adminCreateUserSchema } from "@/lib/validations/auth";
import { ApiError, handleApiError, requireRole } from "@/lib/api";
import { listUsers, serializeUser } from "@/services/user.service";

export async function GET() {
  try {
    await requireRole(["ADMIN"]);
    return NextResponse.json({ users: await listUsers() });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["ADMIN"]);
    const input = adminCreateUserSchema.parse(await request.json());

    await connectToDatabase();
    if (await User.exists({ email: input.email })) {
      throw new ApiError("อีเมลนี้ถูกใช้งานแล้ว", 409);
    }

    let restaurantName: string | undefined;
    if (input.role === "RESTAURANT_STAFF") {
      const restaurant = isValidObjectId(input.restaurantId)
        ? await Restaurant.findById(input.restaurantId).select("name").lean()
        : null;
      if (!restaurant) throw new ApiError("ไม่พบร้านอาหารที่เลือก", 400);
      restaurantName = restaurant.name;
    }

    const user = await User.create({
      name: input.name,
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 10),
      phone: input.phone,
      role: input.role,
      restaurantId: input.role === "RESTAURANT_STAFF" ? input.restaurantId : undefined,
    });

    return NextResponse.json({ user: serializeUser(user, restaurantName) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
