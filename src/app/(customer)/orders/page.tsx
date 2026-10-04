import { Receipt } from "lucide-react";
import { auth } from "@/lib/auth";
import { listOrdersForUser } from "@/services/order.service";
import { OrderCard } from "@/components/order/order-card";

const ACTIVE_STATUSES = ["ORDER_RECEIVED", "PREPARING", "READY_FOR_PICKUP"];

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) return null;

  const orders = await listOrdersForUser(session.user.id);
  const active = orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  const history = orders.filter((o) => !ACTIVE_STATUSES.includes(o.status));

  return (
    <div className="flex flex-col gap-6 px-4 py-4">
      <h1 className="font-display text-xl font-bold text-foreground">คำสั่งซื้อของฉัน</h1>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
          กำลังดำเนินการ
        </h2>
        {active.length === 0 ? (
          <EmptyState text="ไม่มีคำสั่งซื้อที่กำลังดำเนินการ" />
        ) : (
          <div className="flex flex-col gap-2">
            {active.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
          ประวัติการสั่งซื้อ
        </h2>
        {history.length === 0 ? (
          <EmptyState text="ยังไม่มีประวัติการสั่งซื้อ" />
        ) : (
          <div className="flex flex-col gap-2">
            {history.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center text-muted-foreground">
      <Receipt size={32} />
      <p className="text-sm">{text}</p>
    </div>
  );
}
