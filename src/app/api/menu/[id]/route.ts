import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Menu } from "@/models/Menu";
import { menuUpdateSchema } from "@/lib/validations/restaurant";
import { ApiError, handleApiError, requireRole } from "@/lib/api";
import { serializeMenu } from "@/lib/serialize";

type Params = { params: Promise<{ id: string }> };

/** Admins manage every menu; restaurant staff only their own restaurant's. */
async function findEditableMenu(id: string, user: { role: string; restaurantId?: string }) {
  await connectToDatabase();
  const menu = await Menu.findById(id);
  if (!menu) throw new ApiError("ไม่พบเมนูนี้", 404);
  if (user.role === "RESTAURANT_STAFF" && menu.restaurantId.toString() !== user.restaurantId) {
    throw new ApiError("คุณไม่มีสิทธิ์แก้ไขเมนูของร้านอื่น", 403);
  }
  return menu;
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const session = await requireRole(["ADMIN", "RESTAURANT_STAFF"]);
    const { id } = await params;
    const input = menuUpdateSchema.parse(await request.json());
    if (session.user.role === "RESTAURANT_STAFF") delete input.rating;

    const menu = await findEditableMenu(id, session.user);
    menu.set(input);
    await menu.save();

    return NextResponse.json({ menu: serializeMenu(menu) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await requireRole(["ADMIN", "RESTAURANT_STAFF"]);
    const { id } = await params;

    const menu = await findEditableMenu(id, session.user);
    await menu.deleteOne();

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
