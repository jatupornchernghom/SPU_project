import { Check } from "lucide-react";
import { cn } from "cn";
import { ORDER_STATUS_LABEL, ORDER_STATUS_STEPS } from "@/lib/status";
import type { OrderStatus } from "@/types";

export function StatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return (
      <div className="rounded-xl bg-status-cancelled-bg text-status-cancelled-fg px-4 py-3 text-sm font-semibold text-center">
        คำสั่งซื้อนี้ถูกยกเลิก
      </div>
    );
  }

  const currentIndex = ORDER_STATUS_STEPS.indexOf(status);

  return (
    <div className="flex items-center">
      {ORDER_STATUS_STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        const isLast = index === ORDER_STATUS_STEPS.length - 1;

        return (
          <div key={step} className={cn("flex items-center", !isLast && "flex-1")}>
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors",
                  done && "bg-primary text-primary-foreground",
                  active && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  !done && !active && "bg-muted text-muted-foreground"
                )}
              >
                {done ? <Check size={16} /> : <span className="text-xs font-bold">{index + 1}</span>}
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold text-center leading-tight w-16",
                  active || done ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {ORDER_STATUS_LABEL[step]}
              </span>
            </div>
            {!isLast && (
              <div className={cn("h-0.5 flex-1 mx-1 -mt-5", done ? "bg-primary" : "bg-muted")} />
            )}
          </div>
        );
      })}
    </div>
  );
}
