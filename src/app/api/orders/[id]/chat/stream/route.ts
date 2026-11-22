import { handleApiError, requireSession } from "@/lib/api";
import { chatChannel, subscribeChat } from "@/lib/eventBus";
import { getChat } from "@/services/chat.service";
import type { SerializedChatMessage } from "@/types";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** SSE: new messages in one order's conversation. */
export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await requireSession();
    const { id } = await params;
    await getChat(id, session.user); // access check

    const encoder = new TextEncoder();
    let unsubscribe: (() => void) | null = null;
    let heartbeat: ReturnType<typeof setInterval> | null = null;

    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`event: ready\ndata: {}\n\n`));
        unsubscribe = subscribeChat(chatChannel(id), (message: SerializedChatMessage) => {
          controller.enqueue(encoder.encode(`event: message\ndata: ${JSON.stringify(message)}\n\n`));
        });
        heartbeat = setInterval(() => controller.enqueue(encoder.encode(`: heartbeat\n\n`)), 25000);
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
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
