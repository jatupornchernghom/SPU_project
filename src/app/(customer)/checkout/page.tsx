"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { QrCode, Smartphone, Wallet } from "lucide-react";
import { cn } from "cn";
import { useCartStore } from "@/lib/cart-store";
import { useCartHydrated } from "@/hooks/use-cart-hydrated";
import { Button } from "@/components/ui/button";
import { PromptPayQr } from "@/components/order/promptpay-qr";
import { PICKUP_TIME_OPTIONS } from "@/lib/validations/order";
import type { PaymentMethod, SerializedRestaurant } from "@/types";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; icon: typeof QrCode }[] = [
  { value: "QR_PAYMENT", label: "QR พร้อมเพย์", icon: QrCode },
  { value: "MOBILE_BANKING", label: "Mobile Banking", icon: Smartphone },
  { value: "WALLET", label: "SPU Wallet", icon: Wallet },
];

export default function CheckoutPage() {
  const router = useRouter();
  const hydrated = useCartHydrated();
  const [pickupTime, setPickupTime] = useState<(typeof PICKUP_TIME_OPTIONS)[number]>("ASAP");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("QR_PAYMENT");
  const [submitting, setSubmitting] = useState(false);
  const { items, restaurantId, restaurantName, subtotal, clear } = useCartStore();
  const justOrderedRef = useRef(false);
  const [restaurant, setRestaurant] = useState<SerializedRestaurant | null>(null);

  useEffect(() => {
    if (hydrated && items.length === 0 && !justOrderedRef.current) {
      router.replace("/cart");
    }
  }, [hydrated, items.length, router]);

  useEffect(() => {
    if (!restaurantId) return;
    fetch(`/api/restaurants/${restaurantId}`)
      .then((res) => res.json())
      .then((data) => setRestaurant(data.restaurant ?? null))
      .catch(() => setRestaurant(null));
  }, [restaurantId]);

  if (!hydrated || items.length === 0) return null;

  async function handleConfirm() {
    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          items: items.map((i) => ({ menuId: i.menuId, quantity: i.quantity })),
          pickupTime,
          paymentMethod,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error ?? "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        return;
      }

      justOrderedRef.current = true;
      clear();
      toast.success("ชำระเงินสำเร็จ! กำลังนำไปหน้าติดตามคิว...");
      router.push(`/orders/${data.order.id}`);
    } catch {
      toast.error("เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5 px-4 py-4 pb-32">
      <h1 className="font-display text-xl font-bold text-foreground">ยืนยันคำสั่งซื้อ</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
          ร้าน {restaurantName}
        </h2>
        <div className="bg-card border border-border rounded-xl divide-y divide-border">
          {items.map((item) => (
            <div key={item.menuId} className="flex items-center justify-between px-3 py-2.5 text-sm">
              <span className="text-foreground">
                {item.name} <span className="text-muted-foreground">x{item.quantity}</span>
              </span>
              <span className="font-semibold text-foreground">฿{item.price * item.quantity}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-3 py-2.5 text-sm font-bold">
            <span>ยอดรวม</span>
            <span>฿{subtotal()}</span>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
          เวลารับอาหาร
        </h2>
        <div className="flex flex-wrap gap-2">
          {PICKUP_TIME_OPTIONS.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => setPickupTime(time)}
              className={cn(
                "h-10 px-4 rounded-full text-sm font-semibold border transition-colors",
                pickupTime === time
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-foreground border-border"
              )}
            >
              {time === "ASAP" ? "เร็วที่สุด" : time}
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
          ช่องทางชำระเงิน (Mock)
        </h2>
        <div className="flex flex-col gap-2">
          {PAYMENT_OPTIONS.map((option) => {
            const Icon = option.icon;
            const active = paymentMethod === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setPaymentMethod(option.value)}
                className={cn(
                  "h-14 px-4 rounded-xl border flex items-center gap-3 transition-colors",
                  active ? "bg-primary/5 border-primary" : "bg-card border-border"
                )}
              >
                <Icon size={20} className={active ? "text-primary" : "text-muted-foreground"} />
                <span className="font-semibold text-foreground">{option.label}</span>
                {active && <span className="ml-auto text-primary text-xs font-bold">เลือกแล้ว</span>}
              </button>
            );
          })}
        </div>
        {paymentMethod === "QR_PAYMENT" && (
          <PromptPayQr
            promptPayId={restaurant?.promptPayId}
            accountName={restaurant?.name}
            amount={subtotal()}
          />
        )}
      </section>

      <div className="fixed bottom-16 md:bottom-0 inset-x-0 bg-background border-t border-border p-4 pb-safe">
        <div className="max-w-5xl mx-auto">
          <Button
            onClick={handleConfirm}
            disabled={submitting}
            className="h-12 w-full rounded-full text-base"
          >
            {submitting ? "กำลังดำเนินการ..." : `ยืนยันและชำระเงิน ฿${subtotal()}`}
          </Button>
        </div>
      </div>
    </div>
  );
}
