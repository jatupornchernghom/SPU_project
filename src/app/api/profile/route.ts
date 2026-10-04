import { NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import { User } from "@/models/User";
import { handleApiError, requireSession } from "@/lib/api";

const updateSchema = z.object({
  notificationsEnabled: z.boolean().optional(),
  phone: z.string().optional(),
});

export async function PATCH(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json();
    const input = updateSchema.parse(body);

    await connectToDatabase();
    await User.updateOne({ _id: session.user.id }, input);

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
