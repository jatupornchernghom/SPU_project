import { NextResponse } from "next/server";
import { listMenuForRestaurant } from "@/services/restaurant.service";
import { handleApiError } from "@/lib/api";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const menu = await listMenuForRestaurant(id);
    return NextResponse.json({ menu });
  } catch (error) {
    return handleApiError(error);
  }
}
