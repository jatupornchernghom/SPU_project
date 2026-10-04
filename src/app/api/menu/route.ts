import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Menu } from "@/models/Menu";
import { menuInputSchema } from "@/lib/validations/restaurant";
import { handleApiError, requireRole } from "@/lib/api";
import { serializeMenu } from "@/lib/serialize";

export async function POST(request: Request) {
  try {
    await requireRole(["ADMIN"]);
    const body = await request.json();
    const input = menuInputSchema.parse(body);

    await connectToDatabase();
    const menu = await Menu.create(input);

    return NextResponse.json({ menu: serializeMenu(menu) }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
