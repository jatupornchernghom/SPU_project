import Link from "next/link";
import { Receipt } from "lucide-react";
import { auth } from "@/lib/auth";
import { listOrdersForUser } from "@/services/order.service";
import { OrderCard } from "@/components/order/order-card";

export const dynamic = "force-dynamic";

export default async function OrderHistoryPage() {
  const session = await auth();
  if (!session?.user) return null;

  const orders = await listOrdersForUser(session.user.id);
  const completed = orders.filter((o) => o.status === "COMPLETED");

  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-foreground">ประวัติการสั่งซื้อ</h1>
        <Link href="/orders" className="text-xs font-semibold text-primary">
          คิวของฉัน →
        </Link>
      </div>

      {completed.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
          <Receipt size={32} />
          <p className="text-sm">ยังไม่มีประวัติการสั่งซื้อ</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {completed.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
