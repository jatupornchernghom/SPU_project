import { NextResponse } from "next/server";
import { getRandomMenu } from "@/services/restaurant.service";
import { handleApiError } from "@/lib/api";

export async function GET() {
  try {
    const menu = await getRandomMenu();
    return NextResponse.json({ menu });
  } catch (error) {
    return handleApiError(error);
  }
}
