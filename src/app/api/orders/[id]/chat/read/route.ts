import { NextResponse } from "next/server";
import { handleApiError, requireSession } from "@/lib/api";
import { markChatRead } from "@/services/chat.service";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    await markChatRead(id, session.user);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
