"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Star } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/review/star-rating";
import type { SerializedReview } from "@/types";

const RATING_LABEL = ["", "แย่มาก", "พอใช้", "ปานกลาง", "ดี", "ดีมาก"];

export function ReviewForm({
  orderId,
  restaurantName,
  initialReview,
}: {
  orderId: string;
  restaurantName: string;
  initialReview: SerializedReview | null;
}) {
  const [review, setReview] = useState(initialReview);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (review) {
    return (
      <section className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-1.5">
        <h2 className="text-sm font-bold text-foreground">รีวิวของคุณ</h2>
        <StarRating rating={review.rating} size={18} />
        {review.comment && <p className="text-sm text-foreground break-words whitespace-pre-line">{review.comment}</p>}
        <p className="text-xs text-muted-foreground">ขอบคุณสำหรับรีวิว 🙏</p>
      </section>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "ส่งรีวิวไม่สำเร็จ");
        return;
      }
      setReview(data.review);
      toast.success("ส่งรีวิวแล้ว ขอบคุณครับ");
    } finally {
      setSubmitting(false);
    }
  }

  const shown = hover || rating;

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-3">
      <div>
        <h2 className="text-sm font-bold text-foreground">รีวิวร้าน {restaurantName}</h2>
        <p className="text-xs text-muted-foreground">อาหารเป็นยังไงบ้าง? ให้คะแนนเพื่อช่วยเพื่อน ๆ เลือกร้าน</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              aria-label={`${n} ดาว`}
              className="p-0.5 active:scale-90 transition-transform"
            >
              <Star
                size={30}
                className={cn(n <= shown ? "text-secondary fill-secondary" : "text-muted-foreground/40")}
              />
            </button>
          ))}
        </div>
        <span className="text-sm font-semibold text-muted-foreground">{RATING_LABEL[shown]}</span>
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={300}
        rows={3}
        placeholder="เขียนรีวิวเพิ่มเติม (ไม่บังคับ)"
      />
      <Button type="submit" disabled={rating === 0 || submitting} className="h-11 rounded-full">
        {submitting ? "กำลังส่ง..." : "ส่งรีวิว"}
      </Button>
    </form>
  );
}
