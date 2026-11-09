import { StarRating } from "@/components/review/star-rating";
import type { SerializedReview } from "@/types";

export function ReviewList({ reviews, emptyText = "ยังไม่มีรีวิว" }: { reviews: SerializedReview[]; emptyText?: string }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground py-6 text-center">{emptyText}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {reviews.map((review) => (
        <div key={review.id} className="bg-card border border-border rounded-xl p-3 flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-foreground truncate">{review.userName || "ลูกค้า"}</span>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {new Date(review.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}
            </span>
          </div>
          <StarRating rating={review.rating} />
          {review.comment && <p className="text-sm text-foreground break-words whitespace-pre-line">{review.comment}</p>}
        </div>
      ))}
    </div>
  );
}
