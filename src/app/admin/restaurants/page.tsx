import { listRestaurants } from "@/services/restaurant.service";
import { RestaurantTable } from "@/components/admin/restaurant-table";

export const dynamic = "force-dynamic";

export default async function AdminRestaurantsPage() {
  const restaurants = await listRestaurants();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-xl font-bold text-foreground">จัดการร้านอาหาร</h1>
      <RestaurantTable initialRestaurants={restaurants} />
    </div>
  );
}
