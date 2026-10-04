import { listAllMenu, listRestaurants } from "@/services/restaurant.service";
import { MenuTable } from "@/components/admin/menu-table";

export const dynamic = "force-dynamic";

export default async function AdminMenuPage() {
  const [menu, restaurants] = await Promise.all([listAllMenu(), listRestaurants()]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-xl font-bold text-foreground">จัดการเมนู</h1>
      <MenuTable initialMenu={menu} restaurants={restaurants} />
    </div>
  );
}
