import { ORDER_STATUS_LABEL, ORDER_STATUS_STYLE } from "@/lib/status";
import type { OrderStatus } from "@/types";

export function StatusBadge({ status, className = "" }: { status: OrderStatus; className?: string }) {
  const style = ORDER_STATUS_STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide ${className}`}
      style={{ color: style.fg, backgroundColor: style.bg }}
    >
      {status === "PREPARING" && (
        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: style.fg }} />
      )}
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}
