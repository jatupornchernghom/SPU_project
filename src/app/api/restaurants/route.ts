import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Restaurant } from "@/models/Restaurant";
import { listRestaurants } from "@/services/restaurant.service";
import { restaurantInputSchema } from "@/lib/validations/restaurant";
import { handleApiError, requireRole } from "@/lib/api";
import { serializeRestaurant } from "@/lib/serialize";

export async function GET() {
  try {
    const restaurants = await listRestaurants();
    return NextResponse.json({ restaurants });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(["ADMIN"]);
    const body = await request.json();
    const input = restaurantInputSchema.parse(body);

    await connectToDatabase();
    const restaurant = await Restaurant.create(input);

    return NextResponse.json({ restaurant: serializeRestaurant(restaurant, 0) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
