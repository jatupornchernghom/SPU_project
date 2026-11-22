import { auth } from "@/lib/auth";
import { getRestaurantById, listMenuForRestaurant } from "@/services/restaurant.service";
import { MenuManager } from "@/components/restaurant/menu-manager";

export const dynamic = "force-dynamic";

export default async function RestaurantMenuPage() {
  const session = await auth();
  const restaurantId = session?.user?.restaurantId;

  const [restaurant, menu] = restaurantId
    ? await Promise.all([getRestaurantById(restaurantId), listMenuForRestaurant(restaurantId)])
    : [null, []];

  if (!restaurant) {
    return (
      <p className="text-sm text-muted-foreground">
        บัญชีนี้ยังไม่ได้ผูกกับร้านอาหารใด กรุณาติดต่อผู้ดูแลระบบ
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground">เมนูของร้าน</h1>
        <p className="text-sm text-muted-foreground mt-1">
          ของหมดกดสวิตช์ได้เลย ลูกค้าจะเห็นว่า &quot;หมด&quot; และสั่งไม่ได้ทันที
        </p>
      </div>
      <MenuManager restaurant={restaurant} initialMenu={menu} />
    </div>
  );
}
