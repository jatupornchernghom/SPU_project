import { NextResponse } from "next/server";
import { handleApiError, requireSession } from "@/lib/api";
import { createReviewSchema } from "@/lib/validations/review";
import { createReview } from "@/services/review.service";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    const input = createReviewSchema.parse(await request.json());

    const review = await createReview(session.user.id, id, input);
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
