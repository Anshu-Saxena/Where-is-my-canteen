import React, { useState } from 'react';
import { Star, MessageSquare, CheckCircle2, CornerDownRight, Send } from 'lucide-react';
import { REVIEWS } from '../../data/mockData';

export default function OwnerReviewsPage() {
  const [reviews, setReviews] = useState(
    REVIEWS.filter(r => r.canteenId === 'canteen-1')
  );
  const [replyInput, setReplyInput] = useState({});

  const handleReplySubmit = (reviewId) => {
    const text = replyInput[reviewId];
    if (!text || !text.trim()) return;

    setReviews(prev =>
      prev.map(r => (r.id === reviewId ? { ...r, canteenResponse: text } : r))
    );

    setReplyInput(prev => ({ ...prev, [reviewId]: '' }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brandText-primary dark:text-cream">
          Customer Reviews & Direct Kitchen Replies
        </h1>
        <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
          Respond directly to verified student orders and build customer loyalty
        </p>
      </div>

      <div className="space-y-4">
        {reviews.map(rev => (
          <div
            key={rev.id}
            className="bg-white dark:bg-brandCard-dark rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark p-5 shadow-subtle space-y-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={rev.userAvatar}
                  alt={rev.userName}
                  className="w-10 h-10 rounded-full object-cover border border-brandBorder-light dark:border-brandBorder-dark"
                />
                <div>
                  <h4 className="font-semibold text-sm text-brandText-primary dark:text-cream">
                    {rev.userName}
                  </h4>
                  <p className="text-xs text-brandText-secondary dark:text-brandText-darkSecondary">{rev.userRole} • {rev.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-softOrange/20 text-softOrange px-2.5 py-0.5 rounded-lg text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{rev.rating}.0</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-brandText-primary dark:text-cream leading-relaxed">
              "{rev.comment}"
            </p>

            {rev.canteenResponse ? (
              <div className="p-3.5 rounded-xl bg-cream-100 dark:bg-brandBorder-dark/40 border-l-4 border-forest dark:border-sage text-xs space-y-1">
                <p className="font-semibold text-forest dark:text-sage flex items-center gap-1">
                  <CornerDownRight className="w-3.5 h-3.5" />
                  <span>Your Canteen Response:</span>
                </p>
                <p className="text-brandText-primary dark:text-cream">{rev.canteenResponse}</p>
              </div>
            ) : (
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a polite kitchen response..."
                  value={replyInput[rev.id] || ''}
                  onChange={(e) => setReplyInput({ ...replyInput, [rev.id]: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandBg-dark text-xs text-brandText-primary dark:text-cream"
                />
                <button
                  onClick={() => handleReplySubmit(rev.id)}
                  className="px-3.5 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-forest/90 transition flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Reply</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
