import { DailyRevenueChart, RankBarChart } from "@/components/charts/sales-charts";
import type { SalesReport } from "@/services/sales.service";

/** Revenue over time + best sellers (+ revenue per restaurant for admins). */
export function SalesReportSection({ report }: { report: SalesReport }) {
  return (
    <div className="flex flex-col gap-4">
      <section className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
            รายได้ {report.days} วันล่าสุด
          </h2>
          <p className="text-sm text-muted-foreground">
            รวม <span className="font-bold text-foreground tabular-nums">฿{report.totalRevenue.toLocaleString("th-TH")}</span>{" "}
            · {report.totalOrders} ออเดอร์
          </p>
        </div>
        <DailyRevenueChart data={report.daily} />
        <p className="text-[11px] text-muted-foreground">นับเฉพาะออเดอร์ที่ชำระเงินแล้ว ไม่รวมออเดอร์ที่ยกเลิก</p>
      </section>

      <div className={`grid gap-4 ${report.byRestaurant ? "md:grid-cols-2" : ""}`}>
        <section className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
            เมนูขายดี {report.days} วันล่าสุด
          </h2>
          <RankBarChart
            rows={report.topItems.map((i) => ({
              label: i.name,
              value: i.quantity,
              valueLabel: `${i.quantity} จาน`,
              detail: `฿${i.revenue.toLocaleString("th-TH")}`,
            }))}
          />
        </section>

        {report.byRestaurant && (
          <section className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
            <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
              รายได้แยกตามร้าน {report.days} วันล่าสุด
            </h2>
            <RankBarChart
              rows={report.byRestaurant.map((r) => ({
                label: r.name,
                value: r.revenue,
                valueLabel: `฿${r.revenue.toLocaleString("th-TH")}`,
                detail: `${r.orders} ออเดอร์`,
              }))}
            />
          </section>
        )}
      </div>
    </div>
  );
}
