"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Bell, CheckCircle2, ChefHat, MessageCircle, PackageCheck, ScanLine, Wallet } from "lucide-react";
import { useRestaurantStream } from "@/hooks/use-restaurant-stream";
import { StatusBadge } from "@/components/queue/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PickupQrScanner } from "@/components/restaurant/pickup-qr-scanner";
import { ChatBadgeButton, RestaurantChatSheet } from "@/components/chat/order-chat";
import { playNewOrderSound, unlockNewOrderSound } from "@/lib/new-order-sound";
import type { ChatSummary, OrderStatus, SerializedOrder } from "@/types";
import { cn } from "cn";

const ACTIVE_STATUSES: OrderStatus[] = ["ORDER_RECEIVED", "PREPARING", "READY_FOR_PICKUP"];

function ItemNotes({ order }: { order: SerializedOrder }) {
  const noted = order.items.filter((i) => i.note);
  if (noted.length === 0) return null;
  return (
    <ul className="text-xs font-medium text-destructive">
      {noted.map((i) => (
        <li key={i.menuId} className="break-words">
          * {i.name}: {i.note}
        </li>
      ))}
    </ul>
  );
}

const NEXT_ACTION: Partial<Record<OrderStatus, { label: string; next: OrderStatus; icon: typeof ChefHat }>> = {
  ORDER_RECEIVED: { label: "เริ่มปรุง", next: "PREPARING", icon: ChefHat },
  PREPARING: { label: "พร้อมรับ", next: "READY_FOR_PICKUP", icon: PackageCheck },
  READY_FOR_PICKUP: { label: "รับอาหารแล้ว", next: "COMPLETED", icon: CheckCircle2 },
};

export function DashboardBoard({
  restaurantId,
  initialOrders,
  initialChats = {},
}: {
  restaurantId: string;
  initialOrders: SerializedOrder[];
  /** Per order id: unread customer messages and total messages. */
  initialChats?: Record<string, ChatSummary>;
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [chats, setChats] = useState(initialChats);
  const [chatOrder, setChatOrder] = useState<SerializedOrder | null>(null);
  const chatOrderIdRef = useRef<string | null>(null);
  useEffect(() => {
    chatOrderIdRef.current = chatOrder?.id ?? null;
  }, [chatOrder]);

  function openChat(order: SerializedOrder) {
    setChatOrder(order);
    setChats((prev) => ({ ...prev, [order.id]: { unread: 0, total: prev[order.id]?.total ?? 0 } }));
  }
  const [pickupCode, setPickupCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [confirmingPaymentId, setConfirmingPaymentId] = useState<string | null>(null);
  const knownOrderIds = useRef(new Set(initialOrders.map((o) => o.id)));
  const ordersRef = useRef(orders);
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  useEffect(() => {
    window.addEventListener("pointerdown", unlockNewOrderSound);
    window.addEventListener("keydown", unlockNewOrderSound);
    return () => {
      window.removeEventListener("pointerdown", unlockNewOrderSound);
      window.removeEventListener("keydown", unlockNewOrderSound);
    };
  }, []);

  useRestaurantStream(restaurantId, (updated) => {
    if (!knownOrderIds.current.has(updated.id) && ACTIVE_STATUSES.includes(updated.status)) {
      knownOrderIds.current.add(updated.id);
      playNewOrderSound();
      toast(`มีออเดอร์ใหม่เข้ามา! คิว ${updated.queueNumber}`, {
        description: updated.items.map((i) => `${i.name} x${i.quantity}`).join(", "),
        icon: <Bell size={16} />,
      });
    }
    const previous = ordersRef.current.find((o) => o.id === updated.id);
    if (updated.status === "CANCELLED" && previous && ACTIVE_STATUSES.includes(previous.status)) {
      toast.warning(`ออเดอร์คิว ${updated.queueNumber} ถูกยกเลิก`, {
        description: updated.items.map((i) => `${i.name} x${i.quantity}`).join(", "),
      });
    }
    setOrders((prev) => {
      const exists = prev.some((o) => o.id === updated.id);
      return exists ? prev.map((o) => (o.id === updated.id ? updated : o)) : [updated, ...prev];
    });
  }, (message) => {
    const alert = message.sender === "CUSTOMER" && chatOrderIdRef.current !== message.orderId;
    setChats((prev) => {
      const current = prev[message.orderId] ?? { unread: 0, total: 0 };
      return { ...prev, [message.orderId]: { unread: current.unread + (alert ? 1 : 0), total: current.total + 1 } };
    });
    if (!alert) return;
    const order = ordersRef.current.find((o) => o.id === message.orderId);
    playNewOrderSound();
    toast(`ข้อความจากลูกค้า${order ? ` คิว ${order.queueNumber}` : ""}`, {
      description: message.text,
      icon: <MessageCircle size={16} />,
      action: order ? { label: "เปิดแชท", onClick: () => openChat(order) } : undefined,
    });
  });

  const activeOrders = useMemo(
    () =>
      orders
        .filter((o) => ACTIVE_STATUSES.includes(o.status))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [orders]
  );

  const pendingPaymentOrders = useMemo(
    // Only transfers need confirming before cooking; cash is collected at pickup.
    () => activeOrders.filter((o) => o.paymentStatus === "PENDING" && o.paymentMethod === "QR_PAYMENT"),
    [activeOrders]
  );
  const inProgressOrders = useMemo(
    () => activeOrders.filter((o) => !(o.paymentStatus === "PENDING" && o.paymentMethod === "QR_PAYMENT")),
    [activeOrders]
  );

  async function advanceStatus(orderId: string, nextStatus: OrderStatus) {
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const data = await res.json();
    if (!res.ok) {
      toast.error(data.error ?? "เกิดข้อผิดพลาด");
      return;
    }
    setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
  }

  async function handleConfirmPayment(orderId: string) {
    setConfirmingPaymentId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/payment`, { method: "PATCH" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "เกิดข้อผิดพลาด");
        return;
      }
      toast.success(`ยืนยันรับยอดคิว ${data.order.queueNumber} แล้ว — เริ่มปรุงได้เลย`);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
    } finally {
      setConfirmingPaymentId(null);
    }
  }

  async function handleVerifyPickup(e: React.FormEvent) {
    e.preventDefault();
    if (pickupCode.length !== 6) return;
    await verifyPickup(pickupCode);
  }

  async function verifyPickup(code: string) {
    setVerifying(true);
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/pickup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickupCode: code }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "ไม่พบรหัสนี้");
        return;
      }
      toast.success(
        data.order.paymentMethod === "CASH"
          ? `รับออเดอร์ ${data.order.queueNumber} สำเร็จ — เก็บเงินสด ฿${data.order.total}`
          : `รับออเดอร์ ${data.order.queueNumber} สำเร็จ`
      );
      setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
      setPickupCode("");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2 max-w-md">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
          <ScanLine size={16} /> ยืนยันรับอาหารด้วยรหัส / QR
        </h2>
        <form onSubmit={handleVerifyPickup} className="flex gap-2">
          <Input
            value={pickupCode}
            onChange={(e) => setPickupCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            placeholder="รหัส 6 หลัก"
            className="h-11 flex-1"
          />
          <Button type="submit" disabled={verifying || pickupCode.length !== 6} className="h-11 px-5">
            ยืนยัน
          </Button>
        </form>
        <PickupQrScanner disabled={verifying} onScan={verifyPickup} />
      </section>

      {pendingPaymentOrders.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-bold text-status-waiting-fg uppercase tracking-wide">
            รอยืนยันยอดชำระเงิน ({pendingPaymentOrders.length})
          </h2>
          <div className="flex flex-col gap-2">
            {pendingPaymentOrders.map((order) => (
              <div
                key={order.id}
                className={cn(
                  "bg-status-waiting-bg border-2 border-status-waiting-fg/30 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",
                  (chats[order.id]?.unread ?? 0) > 0 && "border-primary ring-2 ring-primary/30"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-card text-status-waiting-fg flex items-center justify-center font-display font-extrabold text-sm flex-shrink-0">
                    {order.queueNumber}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {order.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}
                    </p>
                    <ItemNotes order={order} />
                    <p className="text-xs text-status-waiting-fg font-medium">
                      {order.orderNumber} • QR พร้อมเพย์ • ฿{order.total}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:flex-shrink-0">
                  <ChatBadgeButton chat={chats[order.id]} onClick={() => openChat(order)} />
                  <Button
                    size="sm"
                    disabled={confirmingPaymentId === order.id}
                    onClick={() => handleConfirmPayment(order.id)}
                    className="h-9 rounded-full gap-1 flex-1 sm:flex-none"
                  >
                    <Wallet size={14} />
                    ยืนยันรับยอด
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
          คิวออเดอร์ ({inProgressOrders.length})
        </h2>

        {inProgressOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-10 text-center">ยังไม่มีออเดอร์เข้ามา</p>
        ) : (
          <div className="flex flex-col gap-2">
            {inProgressOrders.map((order) => {
              const action = NEXT_ACTION[order.status];
              const Icon = action?.icon;

              return (
                <div
                  key={order.id}
                  className={cn(
                    "bg-card border border-border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3",
                    (chats[order.id]?.unread ?? 0) > 0 && "border-primary bg-primary/5 ring-2 ring-primary/30"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-display font-extrabold text-sm flex-shrink-0">
                      {order.queueNumber}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {order.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}
                      </p>
                      <ItemNotes order={order} />
                      <p className="text-xs text-muted-foreground">
                        {order.orderNumber} • รับเวลา{" "}
                        {order.pickupTime === "ASAP" ? "เร็วที่สุด" : order.pickupTime} • ฿{order.total}
                        {order.paymentMethod === "CASH" && order.paymentStatus === "PENDING" && (
                          <span className="ml-1 font-semibold text-status-waiting-fg">• เงินสด เก็บเงินตอนรับ</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 sm:flex-shrink-0">
                    <StatusBadge status={order.status} />
                    <ChatBadgeButton chat={chats[order.id]} onClick={() => openChat(order)} />
                    {action && (
                      <Button
                        size="sm"
                        onClick={() => advanceStatus(order.id, action.next)}
                        className="h-9 rounded-full gap-1"
                      >
                        {Icon && <Icon size={14} />}
                        {action.label}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <RestaurantChatSheet order={chatOrder} onOpenChange={(open) => !open && setChatOrder(null)} />
    </div>
  );
}
