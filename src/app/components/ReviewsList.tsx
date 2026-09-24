'use client';

import React, { useState } from 'react';
import { Star, ThumbsUp, User } from 'lucide-react';

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  equipmentName?: string;
  helpful?: number;
}

interface ReviewsListProps {
  reviews: Review[];
  showEquipmentName?: boolean;
  compact?: boolean;
}

export const SAMPLE_REVIEWS: Review[] = [
  { id: 'r1', author: 'Suresh Yadav', rating: 5, comment: 'Excellent tractor, very well maintained. Rajesh bhai was very cooperative and the driver was experienced. Will definitely rent again next season.', date: '2026-09-12', equipmentName: 'Mahindra Yuvo 575 DI Tractor', helpful: 8 },
  { id: 'r2', author: 'Priya Deshmukh', rating: 4, comment: 'Good rotavator, worked perfectly for my 5-acre field. Minor delay in delivery but overall satisfied with the service.', date: '2026-09-08', equipmentName: 'Rotavator 7 Feet Heavy Duty', helpful: 5 },
  { id: 'r3', author: 'Mohan Kulkarni', rating: 5, comment: 'Best tractor rental in Pune! The equipment was clean and the driver knew exactly how to handle the field conditions. Highly recommended.', date: '2026-09-05', equipmentName: 'John Deere 5050D Tractor', helpful: 12 },
  { id: 'r4', author: 'Ramesh Patil', rating: 3, comment: 'Average experience. Equipment was functional but showed some wear. Price was fair for the condition.', date: '2026-08-28', equipmentName: 'Paddy Transplanter 8-Row', helpful: 2 },
];

export default function ReviewsList({ reviews, showEquipmentName = false, compact = false }: ReviewsListProps) {
  const [helpfulClicked, setHelpfulClicked] = useState<Set<string>>(new Set());

  const avgRating = reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length > 0 ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0,
  }));

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8">
        <Star size={32} className="text-muted-foreground mx-auto mb-3" />
        <p className="text-sm font-semibold text-foreground">No reviews yet</p>
        <p className="text-xs text-muted-foreground mt-1">Be the first to review after your rental</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {!compact && (
        <div className="flex items-start gap-6 p-4 bg-muted/30 rounded-xl">
          <div className="text-center shrink-0">
            <p className="text-4xl font-extrabold text-foreground">{avgRating.toFixed(1)}</p>
            <div className="flex items-center justify-center gap-0.5 my-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={14} className={s <= Math.round(avgRating) ? 'text-warning fill-warning' : 'text-muted-foreground/30'} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{reviews.length} reviews</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {ratingDist.map(({ star, count, pct }) => (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-4 text-right">{star}</span>
                <Star size={10} className="text-warning fill-warning shrink-0" />
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-warning rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-muted-foreground w-4">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                  <User size={14} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{review.author}</p>
                  <p className="text-xs text-muted-foreground">{review.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={12} className={s <= review.rating ? 'text-warning fill-warning' : 'text-muted-foreground/30'} />
                ))}
              </div>
            </div>
            {showEquipmentName && review.equipmentName && (
              <p className="text-xs text-primary font-semibold mb-1.5">Re: {review.equipmentName}</p>
            )}
            <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>
            {review.helpful !== undefined && (
              <button
                onClick={() => setHelpfulClicked((prev) => { const n = new Set(prev); n.has(review.id) ? n.delete(review.id) : n.add(review.id); return n; })}
                className={`flex items-center gap-1.5 mt-2 text-xs font-medium transition-colors ${helpfulClicked.has(review.id) ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <ThumbsUp size={11} />
                Helpful ({(review.helpful ?? 0) + (helpfulClicked.has(review.id) ? 1 : 0)})
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
