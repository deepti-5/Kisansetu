'use client';

import React, { useState } from 'react';
import { Star, X, Send, CheckCircle } from 'lucide-react';

interface ReviewModalProps {
  equipmentName: string;
  bookingId: string;
  supplierName: string;
  onClose: () => void;
  onSubmit: (review: { rating: number; comment: string }) => void;
}

export default function ReviewModal({ equipmentName, bookingId, supplierName, onClose, onSubmit }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  function handleSubmit() {
    if (rating === 0) return;
    onSubmit({ rating, comment });
    setSubmitted(true);
    setTimeout(() => { onClose(); }, 1800);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border border-border shadow-modal w-full max-w-md p-6">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted transition-colors">
          <X size={16} className="text-muted-foreground" />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-success" />
            </div>
            <h3 className="font-extrabold text-lg text-foreground mb-1">Review Submitted!</h3>
            <p className="text-sm text-muted-foreground">Your review helps other farmers make better decisions.</p>
          </div>
        ) : (
          <>
            <h3 className="font-extrabold text-lg text-foreground mb-1">Rate Your Experience</h3>
            <p className="text-sm text-muted-foreground mb-5">Booking #{bookingId} · {equipmentName}</p>

            <div className="mb-5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Your Rating</p>
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={32}
                      className={`transition-colors ${star <= (hovered || rating) ? 'text-warning fill-warning' : 'text-muted-foreground/30'}`}
                    />
                  </button>
                ))}
                {(hovered || rating) > 0 && (
                  <span className="text-sm font-bold text-warning ml-2">{LABELS[hovered || rating]}</span>
                )}
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Your Review</p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={`Share your experience with ${supplierName}'s equipment...`}
                rows={4}
                className="w-full bg-muted/40 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring resize-none transition-all"
              />
              <p className="text-xs text-muted-foreground mt-1 text-right">{comment.length}/500</p>
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={rating === 0}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl btn-primary text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={14} /> Submit Review
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
