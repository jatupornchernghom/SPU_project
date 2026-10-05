import Link from "next/link";
import { ChevronRight, Dices, Search, Sparkles } from "lucide-react";
import { auth } from "@/lib/auth";
import { listRestaurants, getPopularMenu } from "@/services/restaurant.service";
import { listOrdersForUser } from "@/services/order.service";
import { StallCard } from "@/components/restaurant/stall-card";
import { DishCard } from "@/components/menu/dish-card";
import { ORDER_STATUS_LABEL } from "@/lib/status";

const ACTIVE_STATUSES = ["ORDER_RECEIVED", "PREPARING", "READY_FOR_PICKUP"];

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function HomePage({ searchParams }: Props) {
  const { q } = await searchParams;
  const session = await auth();
  const [restaurants, popularMenu, myOrders] = await Promise.all([
    listRestaurants(),
    getPopularMenu(),
    session?.user ? listOrdersForUser(session.user.id) : Promise.resolve([]),
  ]);
  const activeOrder = myOrders.find((o) => ACTIVE_STATUSES.includes(o.status));

  const query = q?.trim().toLowerCase();
  const filteredRestaurants = query
    ? restaurants.filter(
        (r) => r.name.toLowerCase().includes(query) || r.category.toLowerCase().includes(query)
      )
    : restaurants;
  const openCount = restaurants.filter((r) => r.isOpen).length;

  return (
    <div className="flex flex-col gap-1 pb-6">
      <section className="px-4 pt-2 pb-3">
        <h1 className="font-display text-2xl font-bold text-foreground tracking-tight">
          สวัสดี{session?.user?.name ? ` ${session.user.name}` : ""} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          กำลังหิวใช่ไหม? สั่งล่วงหน้า เดินมารับได้เลย ไม่ต้องยืนรอ
        </p>
      </section>

      <section className="px-4 pb-3">
        <form action="/" className="flex items-center h-12 rounded-xl bg-muted px-4 gap-2">
          <Search size={20} className="text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="ค้นหาร้านค้า เช่น ข้าวมันไก่, กะเพรา..."
            className="bg-transparent flex-1 text-sm outline-none placeholder:text-muted-foreground"
          />
        </form>
      </section>

      {!query && activeOrder && (
        <section className="px-4 pb-3">
          <Link
            href={`/orders/${activeOrder.id}`}
            className="relative overflow-hidden rounded-xl bg-foreground text-background p-3 flex items-center justify-between gap-3 shadow-md"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-lg bg-primary text-primary-foreground flex flex-col items-center justify-center flex-shrink-0 shadow-inner">
                <span className="text-[9px] opacity-90 leading-none">คิว</span>
                <span className="font-display text-sm font-extrabold leading-none mt-0.5">
                  {activeOrder.queueNumber}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  {activeOrder.status === "PREPARING" && (
                    <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  )}
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-secondary">
                    {ORDER_STATUS_LABEL[activeOrder.status]}
                    {activeOrder.status !== "READY_FOR_PICKUP" &&
                      ` • อีก ~${activeOrder.estimatedWaitTime} นาที`}
                  </span>
                </div>
                <p className="text-sm font-semibold truncate">
                  {activeOrder.items.map((i) => i.name).join(", ")}
                </p>
                <span className="text-xs opacity-70 truncate">{activeOrder.restaurantName}</span>
              </div>
            </div>
            <div className="flex-shrink-0 flex items-center gap-0.5 text-xs font-semibold">
              ดูสถานะ
              <ChevronRight size={16} />
            </div>
          </Link>
        </section>
      )}

      {!query && (
        <section className="px-4 pb-4">
          <Link
            href="/random"
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary text-primary-foreground p-4 flex items-center justify-between gap-3 shadow-md block"
          >
            <div className="flex flex-col gap-1 min-w-0">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide bg-white/20 px-2 py-0.5 rounded-full w-fit">
                <Sparkles size={12} /> ไม่ต้องคิดเอง
              </span>
              <h3 className="font-display font-bold leading-tight">คิดไม่ออกใช่ไหม? ให้ SkipQ สุ่ม!</h3>
              <p className="text-xs opacity-90">กดสุ่มเมนูเด็ดพร้อมสั่งจองคิวทันที</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Dices size={24} />
            </div>
          </Link>
        </section>
      )}

      {!query && popularMenu.length > 0 && (
        <section className="pb-2">
          <div className="px-4 flex items-center justify-between mb-2">
            <h2 className="font-display text-lg font-bold text-foreground">เมนูยอดนิยม</h2>
          </div>
          <div className="flex flex-col gap-2 px-4">
            {popularMenu.map((menu) => (
              <DishCard key={menu.id} menu={menu} />
            ))}
          </div>
        </section>
      )}

      <section className="px-4 pt-3 pb-4 flex flex-col gap-3">
        <h2 className="font-display text-lg font-bold text-foreground">
          {query ? `ผลการค้นหา "${q}"` : `ร้านอาหารใน ม.ศรีปทุม (${openCount} ร้านเปิดอยู่)`}
        </h2>
        {filteredRestaurants.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            {query ? "ไม่พบร้านอาหารที่ตรงกับคำค้นหา" : "ยังไม่มีร้านอาหารในระบบ"}
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredRestaurants.map((restaurant) => (
              <StallCard key={restaurant.id} restaurant={restaurant} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
