import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Menu } from "@/models/Menu";
import { menuUpdateSchema } from "@/lib/validations/restaurant";
import { ApiError, handleApiError, requireRole } from "@/lib/api";
import { serializeMenu } from "@/lib/serialize";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await params;
    const body = await request.json();
    const input = menuUpdateSchema.parse(body);

    await connectToDatabase();
    const menu = await Menu.findByIdAndUpdate(id, input, { new: true });
    if (!menu) throw new ApiError("ไม่พบเมนูนี้", 404);

    return NextResponse.json({ menu: serializeMenu(menu) });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireRole(["ADMIN"]);
    const { id } = await params;

    await connectToDatabase();
    const menu = await Menu.findByIdAndDelete(id);
    if (!menu) throw new ApiError("ไม่พบเมนูนี้", 404);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
