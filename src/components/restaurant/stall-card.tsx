import Image from "next/image";
import Link from "next/link";
import { Clock, Star } from "lucide-react";
import type { SerializedRestaurant } from "@/types";

export function StallCard({ restaurant }: { restaurant: SerializedRestaurant }) {
  const waitEstimate = restaurant.activeOrderCount * restaurant.averagePreparationTime;

  return (
    <Link
      href={`/restaurants/${restaurant.id}`}
      className="block bg-card rounded-2xl overflow-hidden shadow-sm border border-border hover:shadow-md transition-shadow"
    >
      <div className="relative w-full h-36 bg-muted">
        {restaurant.image && (
          <Image src={restaurant.image} alt={restaurant.name} fill className="object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2.5 py-1 rounded-full bg-card/90 backdrop-blur-md text-foreground shadow-sm">
          <Clock size={14} className="text-secondary" />
          <span className="text-[11px] font-extrabold">
            {restaurant.isOpen
              ? `รอคิว ~${waitEstimate} นาที (${restaurant.activeOrderCount} คิว)`
              : "ปิดร้านแล้ว"}
          </span>
        </div>
      </div>
      <div className="p-3 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <h3 className="font-semibold text-foreground truncate">{restaurant.name}</h3>
            <div className="flex items-center gap-2 mt-0.5 text-muted-foreground text-xs">
              <span className="flex items-center gap-0.5 font-semibold text-foreground">
                <Star size={14} className="text-secondary fill-secondary" />
                {restaurant.rating.toFixed(1)}
              </span>
              <span>•</span>
              <span>{restaurant.category}</span>
            </div>
          </div>
          <span
            className={`flex-shrink-0 h-9 px-3 rounded-xl text-xs font-bold flex items-center ${
              restaurant.isOpen
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {restaurant.isOpen ? "สั่งล่วงหน้า" : "ปิดร้าน"}
          </span>
        </div>
      </div>
    </Link>
  );
}
