import { auth } from "@/lib/auth";
import { listOrdersForRestaurant } from "@/services/order.service";
import { DashboardBoard } from "@/components/restaurant/dashboard-board";

export default async function RestaurantDashboardPage() {
  const session = await auth();
  const restaurantId = session?.user?.restaurantId;

  if (!restaurantId) {
    return (
      <p className="text-sm text-muted-foreground">
        บัญชีนี้ยังไม่ได้ผูกกับร้านอาหารใด กรุณาติดต่อผู้ดูแลระบบ
      </p>
    );
  }

  const orders = await listOrdersForRestaurant(restaurantId);

  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-display text-xl font-bold text-foreground mb-3">แดชบอร์ดร้านอาหาร</h1>
      <DashboardBoard restaurantId={restaurantId} initialOrders={orders} />
    </div>
  );
}
