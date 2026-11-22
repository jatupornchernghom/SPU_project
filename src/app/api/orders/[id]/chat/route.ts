import { NextResponse } from "next/server";
import { z } from "zod";
import { handleApiError, requireSession } from "@/lib/api";
import { getChat, sendChatMessage } from "@/services/chat.service";

type Params = { params: Promise<{ id: string }> };

const messageSchema = z.object({
  text: z.string().trim().min(1, "พิมพ์ข้อความก่อนส่ง").max(500, "ข้อความยาวเกิน 500 ตัวอักษร"),
});

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    return NextResponse.json(await getChat(id, session.user));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const { text } = messageSchema.parse(await request.json());
    const message = await sendChatMessage(id, session.user, text);
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
