import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Menu } from "@/models/Menu";
import { Restaurant } from "@/models/Restaurant";
import { menuInputSchema } from "@/lib/validations/restaurant";
import { ApiError, handleApiError, requireRole } from "@/lib/api";
import { serializeMenu } from "@/lib/serialize";

export async function POST(request: Request) {
  try {
    const session = await requireRole(["ADMIN", "RESTAURANT_STAFF"]);
    const input = menuInputSchema.parse(await request.json());

    if (session.user.role === "RESTAURANT_STAFF") {
      // Staff add dishes to their own restaurant only, and don't pick the
      // rating: a new dish starts at the restaurant's customer rating.
      if (!session.user.restaurantId) throw new ApiError("บัญชีนี้ยังไม่ได้ผูกกับร้านอาหาร", 403);
      await connectToDatabase();
      const restaurant = await Restaurant.findById(session.user.restaurantId).select("rating").lean();
      input.restaurantId = session.user.restaurantId;
      input.rating = restaurant?.rating ?? 0;
    }

    await connectToDatabase();
    const menu = await Menu.create(input);

    return NextResponse.json({ menu: serializeMenu(menu) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
