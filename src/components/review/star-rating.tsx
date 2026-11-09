import { Star } from "lucide-react";
import { cn } from "cn";

export function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} จาก 5 ดาว`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          className={cn(n <= Math.round(rating) ? "text-secondary fill-secondary" : "text-muted-foreground/40")}
        />
      ))}
    </span>
  );
}
