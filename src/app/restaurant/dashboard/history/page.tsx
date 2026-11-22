import { ClipboardList, Receipt, Wallet, XCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { getRestaurantOrderSummary, listPastOrdersForRestaurant } from "@/services/order.service";
import { getRestaurantById } from "@/services/restaurant.service";
import { listReviewsForRestaurant } from "@/services/review.service";
import { OrderCard } from "@/components/order/order-card";
import { getSalesReport } from "@/services/sales.service";
import { SalesReportSection } from "@/components/charts/sales-report-section";
import { ReviewList } from "@/components/review/review-list";
import { StarRating } from "@/components/review/star-rating";

export const dynamic = "force-dynamic";

export default async function RestaurantHistoryPage() {
  const session = await auth();
  const restaurantId = session?.user?.restaurantId;

  if (!restaurantId) {
    return (
      <p className="text-sm text-muted-foreground">
        บัญชีนี้ยังไม่ได้ผูกกับร้านอาหารใด กรุณาติดต่อผู้ดูแลระบบ
      </p>
    );
  }

  const [summary, pastOrders, restaurant, reviews, report] = await Promise.all([
    getRestaurantOrderSummary(restaurantId),
    listPastOrdersForRestaurant(restaurantId),
    getRestaurantById(restaurantId),
    listReviewsForRestaurant(restaurantId, 10),
    getSalesReport({ restaurantId, days: 14 }),
  ]);

  const cards = [
    { label: "ออเดอร์วันนี้", value: summary.ordersToday, icon: ClipboardList },
    { label: "สำเร็จวันนี้", value: summary.completedToday, icon: Receipt },
    { label: "รายได้วันนี้", value: `฿${summary.revenueToday.toLocaleString()}`, icon: Wallet },
    { label: "ยกเลิกวันนี้", value: summary.cancelledToday, icon: XCircle },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-xl font-bold text-foreground">สรุปยอด & ประวัติออเดอร์</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => (
          <div key={card.label} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-2">
            <card.icon size={18} className="text-primary" />
            <span className="font-display text-2xl font-extrabold text-foreground">{card.value}</span>
            <span className="text-xs text-muted-foreground">{card.label}</span>
          </div>
        ))}
      </div>

      <SalesReportSection report={report} />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide flex flex-wrap items-center gap-2">
          รีวิวล่าสุด
          {restaurant && restaurant.reviewCount > 0 && (
            <span className="flex items-center gap-1.5 normal-case">
              <StarRating rating={restaurant.rating} />
              {restaurant.rating.toFixed(1)} ({restaurant.reviewCount} รีวิว)
            </span>
          )}
        </h2>
        <ReviewList reviews={reviews} />
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wide">
          ประวัติออเดอร์ ({pastOrders.length})
        </h2>
        {pastOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground py-10 text-center">ยังไม่มีประวัติออเดอร์</p>
        ) : (
          <div className="flex flex-col gap-2">
            {pastOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
