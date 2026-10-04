"use client";

import QRCode from "react-qr-code";
import { CheckCircle2, Clock } from "lucide-react";
import { useOrderStream } from "@/hooks/use-order-stream";
import { StatusTimeline } from "@/components/queue/status-timeline";
import { StatusBadge } from "@/components/queue/status-badge";
import type { SerializedOrder } from "@/types";

export function OrderTracker({ order: initialOrder }: { order: SerializedOrder }) {
  const order = useOrderStream(initialOrder.id, initialOrder);

  return (
    <div className="flex flex-col gap-5 px-4 py-4 pb-10">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs text-muted-foreground">{order.orderNumber}</p>
          <h1 className="font-display text-lg font-bold text-foreground">{order.restaurantName}</h1>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {order.paymentStatus === "PENDING" && (
        <div className="flex items-center gap-2 rounded-xl bg-status-waiting-bg px-4 py-3 text-sm font-semibold text-status-waiting-fg">
          <Clock size={16} className="flex-shrink-0" />
          รอร้านยืนยันรับยอดโอน — หากโอนแล้วแต่สถานะยังไม่เปลี่ยน รอสักครู่หรือแจ้งพนักงานหน้าร้าน
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl p-5">
        <StatusTimeline status={order.status} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center">
          <span className="text-xs text-muted-foreground">คิว</span>
          <span className="font-display text-3xl font-extrabold text-primary">{order.queueNumber}</span>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col items-center">
          <span className="text-xs text-muted-foreground">เวลารอโดยประมาณ</span>
          <span className="font-display text-3xl font-extrabold text-foreground">
            {order.status === "READY_FOR_PICKUP" || order.status === "COMPLETED"
              ? 0
              : order.estimatedWaitTime}{" "}
            <span className="text-base font-semibold">นาที</span>
          </span>
        </div>
      </div>

      {order.status === "READY_FOR_PICKUP" && (
        <div className="bg-status-ready-bg border-2 border-status-ready-fg rounded-2xl p-5 flex flex-col items-center gap-3 text-center">
          <h2 className="font-display text-lg font-extrabold text-status-ready-fg">
            READY FOR PICKUP! อาหารพร้อมแล้ว
          </h2>
          <div className="bg-white p-3 rounded-xl">
            <QRCode value={JSON.stringify({ orderId: order.id, pickupCode: order.pickupCode })} size={160} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Pickup Code</p>
            <p className="font-display text-3xl font-extrabold tracking-widest text-foreground">
              {order.pickupCode}
            </p>
          </div>
          <p className="text-sm text-status-ready-fg font-semibold">
            เดินไปที่ช่อง Fast Track แล้วแจ้งรหัสหรือสแกน QR นี้
          </p>
        </div>
      )}

      {order.status === "COMPLETED" && (
        <div className="bg-status-ready-bg rounded-2xl p-5 flex flex-col items-center gap-2 text-center">
          <CheckCircle2 size={40} className="text-status-ready-fg" />
          <h2 className="font-display text-lg font-bold text-status-ready-fg">รับอาหารเรียบร้อยแล้ว</h2>
          <p className="text-sm text-muted-foreground">ขอบคุณที่ใช้บริการ SPU SkipQ</p>
        </div>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
          รายการอาหาร
        </h2>
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {order.items.map((item) => (
            <div key={item.menuId} className="flex items-center justify-between px-3 py-2.5 text-sm">
              <span>
                {item.name} <span className="text-muted-foreground">x{item.quantity}</span>
              </span>
              <span className="font-semibold">฿{item.subtotal}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-3 py-2.5 text-sm font-bold">
            <span>ยอดรวม</span>
            <span>฿{order.total}</span>
          </div>
        </div>
      </section>

      <div className="text-xs text-muted-foreground flex flex-col gap-0.5">
        <span>เวลารับอาหาร: {order.pickupTime === "ASAP" ? "เร็วที่สุด" : order.pickupTime}</span>
        <span>
          ช่องทางชำระเงิน: {order.paymentMethod.replace("_", " ")} •{" "}
          {order.paymentStatus === "PENDING" ? "รอยืนยันยอด" : "ชำระเงินแล้ว"}
        </span>
      </div>
    </div>
  );
}
