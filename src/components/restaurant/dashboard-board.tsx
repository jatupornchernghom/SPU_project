"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, ChefHat, PackageCheck, ScanLine, Wallet } from "lucide-react";
import { useRestaurantStream } from "@/hooks/use-restaurant-stream";
import { StatusBadge } from "@/components/queue/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { OrderStatus, SerializedOrder } from "@/types";

const ACTIVE_STATUSES: OrderStatus[] = ["ORDER_RECEIVED", "PREPARING", "READY_FOR_PICKUP"];

const NEXT_ACTION: Partial<Record<OrderStatus, { label: string; next: OrderStatus; icon: typeof ChefHat }>> = {
  ORDER_RECEIVED: { label: "เริ่มปรุง", next: "PREPARING", icon: ChefHat },
  PREPARING: { label: "พร้อมรับ", next: "READY_FOR_PICKUP", icon: PackageCheck },
  READY_FOR_PICKUP: { label: "รับอาหารแล้ว", next: "COMPLETED", icon: CheckCircle2 },
};

export function DashboardBoard({
  restaurantId,
  initialOrders,
}: {
  restaurantId: string;
  initialOrders: SerializedOrder[];
}) {
  const [orders, setOrders] = useState(initialOrders);
  const [pickupCode, setPickupCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [confirmingPaymentId, setConfirmingPaymentId] = useState<string | null>(null);

  useRestaurantStream(restaurantId, (updated) => {
    setOrders((prev) => {
      const exists = prev.some((o) => o.id === updated.id);
      return exists ? prev.map((o) => (o.id === updated.id ? updated : o)) : [updated, ...prev];
    });
  });

  const activeOrders = useMemo(
    () =>
      orders
        .filter((o) => ACTIVE_STATUSES.includes(o.status))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [orders]
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
      toast.success("ยืนยันรับยอดแล้ว");
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
    } finally {
      setConfirmingPaymentId(null);
    }
  }

  async function handleVerifyPickup(e: React.FormEvent) {
    e.preventDefault();
    if (pickupCode.length !== 6) return;
    setVerifying(true);
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/pickup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickupCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "ไม่พบรหัสนี้");
        return;
      }
      toast.success(`รับออเดอร์ ${data.order.queueNumber} สำเร็จ`);
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
          <ScanLine size={16} /> ยืนยันรับอาหารด้วยรหัส
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
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
          คิวออเดอร์ ({activeOrders.length})
        </h2>

        {activeOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-10 text-center">ยังไม่มีออเดอร์เข้ามา</p>
        ) : (
          <div className="flex flex-col gap-2">
            {activeOrders.map((order) => {
              const action = NEXT_ACTION[order.status];
              const Icon = action?.icon;
              const paymentPending = order.paymentStatus === "PENDING";

              return (
                <div
                  key={order.id}
                  className="bg-card border border-border rounded-xl p-3 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-display font-extrabold text-sm flex-shrink-0">
                        {order.queueNumber}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {order.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.orderNumber} • รับเวลา{" "}
                          {order.pickupTime === "ASAP" ? "เร็วที่สุด" : order.pickupTime} • ฿{order.total}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <StatusBadge status={order.status} />
                      {action &&
                        (paymentPending && action.next === "PREPARING" ? (
                          <Button
                            size="sm"
                            disabled
                            className="h-9 rounded-full gap-1 opacity-50 cursor-not-allowed"
                          >
                            {Icon && <Icon size={14} />}
                            {action.label}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => advanceStatus(order.id, action.next)}
                            className="h-9 rounded-full gap-1"
                          >
                            {Icon && <Icon size={14} />}
                            {action.label}
                          </Button>
                        ))}
                    </div>
                  </div>

                  {paymentPending && (
                    <div className="flex items-center justify-between gap-2 rounded-lg bg-status-waiting-bg px-3 py-2">
                      <span className="text-xs font-semibold text-status-waiting-fg">
                        รอยืนยันยอดโอน QR พร้อมเพย์
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={confirmingPaymentId === order.id}
                        onClick={() => handleConfirmPayment(order.id)}
                        className="h-8 rounded-full gap-1 bg-card"
                      >
                        <Wallet size={13} />
                        ยืนยันรับยอด
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
