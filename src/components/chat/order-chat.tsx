"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { MessageCircle, SendHorizontal } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { ChatSender, SerializedChatMessage } from "@/types";

const QUICK_REPLIES: Record<ChatSender, string[]> = {
  CUSTOMER: ["กำลังเดินไปรับ", "ขอไม่ใส่ผักนะ", "ขอช้อนส้อมด้วย", "ขอบคุณครับ/ค่ะ"],
  RESTAURANT: ["รับทราบ", "อีกประมาณ 5 นาที", "อาหารพร้อมแล้ว มารับได้เลย", "เมนูนี้หมด ขอเปลี่ยนได้ไหม"],
};

/**
 * Loads an order's conversation and keeps it live over SSE while mounted.
 * `active` = the thread is on screen, so incoming messages count as read.
 */
function useOrderChat(orderId: string, active: boolean) {
  const [messages, setMessages] = useState<SerializedChatMessage[]>([]);
  const [side, setSide] = useState<ChatSender | null>(null);
  const [loaded, setLoaded] = useState(false);
  const activeRef = useRef(active);
  const sideRef = useRef<ChatSender | null>(null);
  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const markAllRead = useCallback(() => {
    const now = new Date().toISOString();
    setMessages((prev) => prev.map((m) => (m.sender !== sideRef.current && !m.readAt ? { ...m, readAt: now } : m)));
    void fetch(`/api/orders/${orderId}/chat/read`, { method: "POST" });
  }, [orderId]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/orders/${orderId}/chat`)
      .then((r) => r.json())
      .then((data: { side: ChatSender | null; messages: SerializedChatMessage[] }) => {
        if (cancelled) return;
        sideRef.current = data.side;
        setSide(data.side);
        setMessages(data.messages ?? []);
        setLoaded(true);
        if (activeRef.current) markAllRead();
      })
      .catch(() => setLoaded(true));

    const source = new EventSource(`/api/orders/${orderId}/chat/stream`);
    source.addEventListener("message", (event) => {
      let message = JSON.parse((event as MessageEvent).data) as SerializedChatMessage;
      // Arrived while the thread is on screen: it's read already.
      if (activeRef.current && message.sender !== sideRef.current && !message.readAt) {
        message = { ...message, readAt: new Date().toISOString() };
        void fetch(`/api/orders/${orderId}/chat/read`, { method: "POST" });
      }
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    });
    return () => {
      cancelled = true;
      source.close();
    };
  }, [orderId, markAllRead]);

  const unread = side ? messages.filter((m) => m.sender !== side && !m.readAt).length : 0;

  const send = useCallback(
    async (text: string) => {
      const res = await fetch(`/api/orders/${orderId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "ส่งข้อความไม่สำเร็จ");
      const message = data.message as SerializedChatMessage;
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
    },
    [orderId]
  );

  return { messages, side, loaded, unread, send, markAllRead };
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" });
}

function ChatThread({ chat, emptyText }: { chat: ReturnType<typeof useOrderChat>; emptyText: string }) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [chat.messages.length]);

  async function submit(value: string) {
    const trimmed = value.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await chat.send(trimmed);
      setText("");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 flex flex-col gap-2">
        {chat.loaded && chat.messages.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">{emptyText}</p>
        )}
        {chat.messages.map((m) => {
          const mine = m.sender === chat.side;
          return (
            <div key={m.id} className={cn("flex flex-col max-w-[80%]", mine ? "self-end items-end" : "self-start items-start")}>
              <div
                className={cn(
                  "rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words",
                  mine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"
                )}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-muted-foreground mt-0.5 px-1">
                {formatTime(m.createdAt)}
                {mine && m.readAt ? " · อ่านแล้ว" : ""}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {chat.side ? (
        <div className="border-t border-border p-3 flex flex-col gap-2">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_REPLIES[chat.side].map((q) => (
              <button
                key={q}
                type="button"
                disabled={sending}
                onClick={() => submit(q)}
                className="rounded-full border border-border px-3 py-1 text-xs text-foreground hover:bg-muted"
              >
                {q}
              </button>
            ))}
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void submit(text);
            }}
            className="flex gap-2"
          >
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              placeholder="พิมพ์ข้อความ..."
              aria-label="ข้อความ"
              className="h-10 flex-1"
            />
            <Button type="submit" size="icon" disabled={sending || !text.trim()} aria-label="ส่ง" className="h-10 w-10 rounded-full">
              <SendHorizontal size={16} />
            </Button>
          </form>
        </div>
      ) : (
        chat.loaded && <p className="border-t border-border p-3 text-xs text-muted-foreground text-center">อ่านได้อย่างเดียว</p>
      )}
    </div>
  );
}

function ChatSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="data-[side=right]:w-full data-[side=right]:sm:max-w-md p-0 gap-0 flex flex-col">
        <SheetHeader className="border-b border-border">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}

/** Customer side, on the order tracker: stays connected so the badge counts new replies. */
export function CustomerChatButton({ orderId, restaurantName, queueNumber }: { orderId: string; restaurantName: string; queueNumber: string }) {
  const [open, setOpen] = useState(false);
  const chat = useOrderChat(orderId, open);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next && chat.unread > 0) chat.markAllRead();
  }

  return (
    <>
      <Button variant="outline" onClick={() => handleOpenChange(true)} className="h-11 rounded-full gap-1.5 relative">
        <MessageCircle size={16} />
        แชทกับร้าน
        {chat.unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">
            {chat.unread}
          </span>
        )}
      </Button>
      <ChatSheet open={open} onOpenChange={handleOpenChange} title={restaurantName} description={`แชทเรื่องออเดอร์คิว ${queueNumber}`}>
        <ChatThread chat={chat} emptyText="ถามร้านได้เลย เช่น ขอไม่ใส่ผัก หรือแจ้งว่ากำลังไปรับ" />
      </ChatSheet>
    </>
  );
}

/** Restaurant side: one sheet for whichever order's chat the staff opened. */
export function RestaurantChatSheet({
  order,
  onOpenChange,
}: {
  order: { id: string; queueNumber: string; items: { name: string; quantity: number }[] } | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <ChatSheet
      open={order !== null}
      onOpenChange={onOpenChange}
      title={order ? `แชทกับลูกค้า คิว ${order.queueNumber}` : ""}
      description={order ? order.items.map((i) => `${i.name} x${i.quantity}`).join(", ") : ""}
    >
      {order && <RestaurantThread key={order.id} orderId={order.id} />}
    </ChatSheet>
  );
}

function RestaurantThread({ orderId }: { orderId: string }) {
  const chat = useOrderChat(orderId, true);
  return <ChatThread chat={chat} emptyText="ยังไม่มีข้อความ — ส่งข้อความหาลูกค้าได้เลย" />;
}

/** Chat button with an unread badge for a dashboard order row. */
export function ChatBadgeButton({ unread, onClick }: { unread: number; onClick: () => void }) {
  return (
    <Button size="sm" variant="outline" onClick={onClick} aria-label={unread ? `แชท (${unread} ข้อความใหม่)` : "แชท"} className="h-9 rounded-full gap-1 relative">
      <MessageCircle size={14} />
      แชท
      {unread > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-primary text-primary-foreground text-[11px] font-bold flex items-center justify-center">
          {unread}
        </span>
      )}
    </Button>
  );
}
