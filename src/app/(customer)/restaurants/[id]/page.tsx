import { AppImage } from "@/components/ui/app-image";
import { notFound } from "next/navigation";
import { Clock, Star } from "lucide-react";
import { getRestaurantById, listMenuForRestaurant } from "@/services/restaurant.service";
import { listReviewsForRestaurant } from "@/services/review.service";
import { DishCard } from "@/components/menu/dish-card";
import { ReviewList } from "@/components/review/review-list";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export default async function RestaurantDetailPage({ params }: Props) {
  const { id } = await params;
  const restaurant = await getRestaurantById(id);
  if (!restaurant) notFound();

  const [menu, reviews] = await Promise.all([listMenuForRestaurant(id), listReviewsForRestaurant(id)]);
  const categories = [...new Set(menu.map((m) => m.category))];
  const waitEstimate = restaurant.activeOrderCount * restaurant.averagePreparationTime;

  return (
    <div className="flex flex-col pb-10">
      <div className="relative w-full h-48 bg-muted">
        {restaurant.image && (
          <AppImage src={restaurant.image} alt={restaurant.name} fill className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-4 right-4 text-white">
          <span
            className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full mb-1 ${
              restaurant.isOpen ? "bg-emerald-500" : "bg-slate-500"
            }`}
          >
            {restaurant.isOpen ? "เปิดอยู่" : "ปิดแล้ว"}
          </span>
          <h1 className="font-display text-xl font-bold">{restaurant.name}</h1>
        </div>
      </div>

      <div className="px-4 py-3 flex items-center gap-4 border-b border-border text-sm">
        <span className="flex items-center gap-1 font-semibold">
          <Star size={16} className="text-secondary fill-secondary" />
          {restaurant.rating.toFixed(1)}
          {restaurant.reviewCount > 0 && (
            <span className="font-normal text-muted-foreground">({restaurant.reviewCount} รีวิว)</span>
          )}
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Clock size={16} />
          รอคิว ~{waitEstimate} นาที ({restaurant.activeOrderCount} คิว)
        </span>
        <span className="text-muted-foreground">{restaurant.location}</span>
      </div>

      {restaurant.description && (
        <p className="px-4 pt-3 text-sm text-muted-foreground">{restaurant.description}</p>
      )}

      <div className="flex flex-col gap-5 px-4 pt-4">
        {menu.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">ร้านนี้ยังไม่มีเมนู</p>
        )}
        {categories.map((category) => (
          <section key={category} className="flex flex-col gap-2">
            <h2 className="font-display text-base font-bold text-foreground">{category}</h2>
            <div className="flex flex-col gap-2">
              {menu
                .filter((m) => m.category === category)
                .map((m) => (
                  <DishCard key={m.id} menu={m} restaurantOpen={restaurant.isOpen} />
                ))}
            </div>
          </section>
        ))}

        <section className="flex flex-col gap-2 pt-2">
          <h2 className="font-display text-base font-bold text-foreground">
            รีวิวจากลูกค้า{restaurant.reviewCount > 0 && ` (${restaurant.reviewCount})`}
          </h2>
          <ReviewList reviews={reviews} emptyText="ยังไม่มีรีวิว — สั่งแล้วมารีวิวเป็นคนแรกได้เลย" />
        </section>
      </div>
    </div>
  );
}
