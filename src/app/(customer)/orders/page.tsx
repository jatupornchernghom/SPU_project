import Link from "next/link";
import { Ticket } from "lucide-react";
import { auth } from "@/lib/auth";
import { listOrdersForUser } from "@/services/order.service";
import { OrderCard } from "@/components/order/order-card";

export const dynamic = "force-dynamic";

const ACTIVE_STATUSES = ["ORDER_RECEIVED", "PREPARING", "READY_FOR_PICKUP"];

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) return null;

  const orders = await listOrdersForUser(session.user.id);
  const active = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-foreground">คิวของฉัน</h1>
        <Link href="/orders/history" className="text-xs font-semibold text-primary">
          ดูประวัติ →
        </Link>
      </div>

      {active.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <Ticket size={32} />
          <p className="text-sm">ไม่มีคำสั่งซื้อที่กำลังดำเนินการ</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {active.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
