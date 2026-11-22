"use client";

import { useState } from "react";
import { toast } from "sonner";
import { XCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { SerializedOrder } from "@/types";

/** Shown to the order's owner while the kitchen hasn't started yet. */
export function CancelOrderButton({ order }: { order: SerializedOrder }) {
  const [cancelling, setCancelling] = useState(false);

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "ยกเลิกไม่สำเร็จ");
        return;
      }
      // The order stream pushes the CANCELLED status to the tracker.
      toast.success(
        data.order.paymentStatus === "REFUNDED" ? "ยกเลิกออเดอร์แล้ว ระบบคืนเงินให้แล้ว" : "ยกเลิกออเดอร์แล้ว"
      );
    } catch {
      toast.error("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={<Button variant="outline" disabled={cancelling} className="h-11 rounded-full gap-1.5 text-destructive" />}
      >
        <XCircle size={16} />
        {cancelling ? "กำลังยกเลิก..." : "ยกเลิกออเดอร์"}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ยกเลิกออเดอร์คิว {order.queueNumber}?</AlertDialogTitle>
          <AlertDialogDescription>
            {order.paymentStatus === "PAID"
              ? "ระบบจะคืนเงินให้อัตโนมัติ ยกเลิกแล้วกู้คืนไม่ได้"
              : order.paymentMethod === "QR_PAYMENT"
                ? "ถ้าโอนเงินไปแล้วแต่ร้านยังไม่ยืนยัน กรุณาติดต่อร้านเพื่อขอเงินคืน ยกเลิกแล้วกู้คืนไม่ได้"
                : "ยกเลิกแล้วกู้คืนไม่ได้"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>ไม่ยกเลิก</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel}>ยืนยันยกเลิก</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
