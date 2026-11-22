import { auth } from "@/lib/auth";
import { listOrdersForRestaurant } from "@/services/order.service";
import { getRestaurantById } from "@/services/restaurant.service";
import { chatSummariesForRestaurant } from "@/services/chat.service";
import { DashboardBoard } from "@/components/restaurant/dashboard-board";
import { StoreOpenToggle } from "@/components/restaurant/store-open-toggle";

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

  const [orders, restaurant, chats] = await Promise.all([
    listOrdersForRestaurant(restaurantId),
    getRestaurantById(restaurantId),
    chatSummariesForRestaurant(restaurantId),
  ]);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <h1 className="font-display text-xl font-bold text-foreground">แดชบอร์ดร้านอาหาร</h1>
        {restaurant && <StoreOpenToggle restaurantId={restaurantId} initialIsOpen={restaurant.isOpen} />}
      </div>
      <DashboardBoard restaurantId={restaurantId} initialOrders={orders} initialChats={chats} />
    </div>
  );
}
