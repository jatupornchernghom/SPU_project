import { NextResponse } from "next/server";
import { handleApiError, requireRole } from "@/lib/api";
import { getAdminStats } from "@/services/admin.service";

export async function GET() {
  try {
    await requireRole(["ADMIN"]);
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
