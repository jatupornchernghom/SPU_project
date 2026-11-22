import { ApiError, handleApiError, requireRole } from "@/lib/api";
import { restaurantChannel, restaurantChatChannel, subscribe, subscribeChat } from "@/lib/eventBus";
import type { SerializedChatMessage, SerializedOrder } from "@/types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await requireRole(["RESTAURANT_STAFF", "ADMIN"]);
    const { id } = await params;

    if (session.user.role === "RESTAURANT_STAFF" && session.user.restaurantId !== id) {
      throw new ApiError("คุณไม่มีสิทธิ์เข้าถึงข้อมูลร้านนี้", 403);
    }

    const encoder = new TextEncoder();
    let unsubscribe: (() => void) | null = null;
    let unsubscribeChat: (() => void) | null = null;
    let heartbeat: ReturnType<typeof setInterval> | null = null;

    const stream = new ReadableStream({
      start(controller) {
        const send = (order: SerializedOrder) => {
          controller.enqueue(encoder.encode(`event: order\ndata: ${JSON.stringify(order)}\n\n`));
        };

        controller.enqueue(encoder.encode(`event: ready\ndata: {}\n\n`));
        unsubscribe = subscribe(restaurantChannel(id), send);
        unsubscribeChat = subscribeChat(restaurantChatChannel(id), (message: SerializedChatMessage) => {
          controller.enqueue(encoder.encode(`event: chat\ndata: ${JSON.stringify(message)}\n\n`));
        });

        heartbeat = setInterval(() => {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        }, 25000);
      },
      cancel() {
        unsubscribe?.();
        unsubscribeChat?.();
        if (heartbeat) clearInterval(heartbeat);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        // Tell nginx-style reverse proxies (common in front of hosts like
        // Render) not to buffer this response — otherwise live events can
        // sit in a proxy buffer instead of reaching the client immediately.
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
