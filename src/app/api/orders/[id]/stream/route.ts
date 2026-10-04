import { ApiError, handleApiError, requireSession } from "@/lib/api";
import { orderChannel, subscribe } from "@/lib/eventBus";
import { getOrderById } from "@/services/order.service";
import type { SerializedOrder } from "@/types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;

    const order = await getOrderById(id, {
      id: session.user.id,
      role: session.user.role,
      restaurantId: session.user.restaurantId,
    });
    if (!order) throw new ApiError("ไม่พบคำสั่งซื้อนี้", 404);

    const encoder = new TextEncoder();
    let unsubscribe: (() => void) | null = null;
    let heartbeat: ReturnType<typeof setInterval> | null = null;

    const stream = new ReadableStream({
      start(controller) {
        const send = (updated: SerializedOrder) => {
          controller.enqueue(encoder.encode(`event: order\ndata: ${JSON.stringify(updated)}\n\n`));
        };

        controller.enqueue(encoder.encode(`event: order\ndata: ${JSON.stringify(order)}\n\n`));
        unsubscribe = subscribe(orderChannel(id), send);

        heartbeat = setInterval(() => {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        }, 25000);
      },
      cancel() {
        unsubscribe?.();
        if (heartbeat) clearInterval(heartbeat);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
