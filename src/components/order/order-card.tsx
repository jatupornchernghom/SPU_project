import Link from "next/link";
import { StatusBadge } from "@/components/queue/status-badge";
import type { SerializedOrder } from "@/types";

export function OrderCard({ order }: { order: SerializedOrder }) {
  return (
    <Link
      href={`/orders/${order.id}`}
      className="block bg-card border border-border rounded-xl p-3 flex flex-col gap-2 hover:shadow-sm transition-shadow"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{order.orderNumber}</p>
          <h3 className="font-semibold text-foreground truncate">{order.restaurantName}</h3>
        </div>
        <StatusBadge status={order.status} />
      </div>
      <p className="text-xs text-muted-foreground truncate">
        {order.items.map((i) => `${i.name} x${i.quantity}`).join(", ")}
      </p>
      <div className="flex items-center justify-between text-sm">
        <span className="font-bold text-foreground">฿{order.total}</span>
        <span className="text-muted-foreground">คิว {order.queueNumber}</span>
      </div>
    </Link>
  );
}
