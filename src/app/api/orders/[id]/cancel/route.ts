import { NextResponse } from "next/server";
import { handleApiError, requireSession } from "@/lib/api";
import { cancelOrderByCustomer } from "@/services/order.service";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const order = await cancelOrderByCustomer(id, session.user.id);
    return NextResponse.json({ order });
  } catch (error) {
    return handleApiError(error);
  }
}
