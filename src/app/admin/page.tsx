import { ClipboardList, Clock, TrendingUp, Wallet } from "lucide-react";
import { getAdminStats } from "@/services/admin.service";

export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: "คำสั่งซื้อทั้งหมด", value: stats.totalOrders, icon: ClipboardList },
    { label: "กำลังดำเนินการ", value: stats.activeOrders, icon: Clock },
    { label: "เสร็จสิ้นแล้ว", value: stats.completedOrders, icon: TrendingUp },
    { label: "รายได้รวม", value: `฿${stats.revenue.toLocaleString()}`, icon: Wallet },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-xl font-bold text-foreground">ภาพรวมระบบ</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2">
            <card.icon size={18} className="text-primary" />
            <span className="font-display text-2xl font-extrabold text-foreground">{card.value}</span>
            <span className="text-xs text-muted-foreground">{card.label}</span>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">เมนูยอดนิยม</h2>
          {stats.popularMenu.length === 0 ? (
            <p className="text-sm text-muted-foreground">ยังไม่มีข้อมูล</p>
          ) : (
            <div className="flex flex-col gap-2">
              {stats.popularMenu.map((m, idx) => (
                <div key={m.name} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">
                    {idx + 1}. {m.name}
                  </span>
                  <span className="font-semibold text-muted-foreground">{m.count} ออเดอร์</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2">
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
            เวลาเตรียมอาหารเฉลี่ย
          </h2>
          <span className="font-display text-3xl font-extrabold text-foreground">
            {stats.averagePreparationTime} <span className="text-base font-semibold">นาที</span>
          </span>
        </div>
      </div>
    </div>
  );
}
