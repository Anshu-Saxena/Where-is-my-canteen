import React, { useState } from 'react';
import {
  Star,
  CheckCircle2,
  Flag,
  MessageSquare,
  Check
} from 'lucide-react';
import { REVIEWS, CANTEENS } from '../../data/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { useOrders } from '../../contexts/OrderContext';
import { reviewService } from '../../services/api';

export default function ReviewsPage() {
  const { user } = useAuth();
  const { completedOrders } = useOrders();

  const [reviewsList, setReviewsList] = useState(REVIEWS);
  const [selectedCanteenId, setSelectedCanteenId] = useState('canteen-1');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [filterStar, setFilterStar] = useState('All');
  const [reportedReviews, setReportedReviews] = useState([]);
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    const newRev = await reviewService.submitReview({
      canteenId: selectedCanteenId,
      rating,
      comment,
      userName: user?.name,
      userRole: `${user?.department || 'Student'} (${user?.rollNumber || 'Verified'})`,
      verifiedOrder: true
    });

    setReviewsList([newRev, ...reviewsList]);
    setComment('');
    setSubmittedNotice(true);
    setTimeout(() => setSubmittedNotice(false), 3000);
  };

  const handleReport = (reviewId) => {
    if (reportedReviews.includes(reviewId)) return;
    setReportedReviews([...reportedReviews, reviewId]);
    alert('Thank you for reporting. Campus administrators will review this comment.');
  };

  const filteredReviews = reviewsList.filter(r => {
    if (r.canteenId !== selectedCanteenId) return false;
    if (filterStar !== 'All' && r.rating !== parseInt(filterStar, 10)) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-brandText-primary dark:text-cream">
          Canteen Ratings & Verified Reviews
        </h1>
        <p className="text-xs sm:text-sm text-brandText-secondary dark:text-brandText-darkSecondary mt-1">
          Honest feedback submitted by campus students and faculty
        </p>
      </div>

      {/* Canteen Selector Bar */}
      <div className="bg-white dark:bg-brandCard-dark p-4 rounded-3xl border border-brandBorder-light dark:border-brandBorder-dark flex flex-wrap items-center gap-3 shadow-subtle">
        <span className="text-xs font-semibold text-brandText-secondary">Select Canteen:</span>
        <div className="flex flex-wrap gap-2">
          {CANTEENS.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCanteenId(c.id)}
              className={`px-3.5 py-1.5 rounded-2xl text-xs font-semibold transition ${
                selectedCanteenId === c.id
                  ? 'bg-primary text-white shadow-subtle'
                  : 'bg-cream-100 dark:bg-brandBorder-dark/40 text-brandText-primary dark:text-cream hover:border-sage'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Write a Review Section (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-brandCard-dark rounded-3xl border border-brandBorder-light dark:border-brandBorder-dark p-6 shadow-subtle space-y-4">
          <h3 className="font-bold text-sm text-brandText-primary dark:text-cream pb-2 border-b border-brandBorder-light dark:border-brandBorder-dark flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-forest dark:text-sage-300 stroke-[2]" />
            <span>Rate This Canteen</span>
          </h3>

          <div className="p-3.5 rounded-2xl bg-cream-100 dark:bg-brandBorder-dark/30 border border-brandBorder-light dark:border-brandBorder-dark text-xs text-brandText-secondary">
            <div className="flex items-center gap-1.5 font-bold text-forest dark:text-sage-300 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2]" />
              <span>Verified Customer Policy</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Reviews are verified against completed orders to prevent fraudulent scores.
            </p>
          </div>

          {submittedNotice && (
            <div className="p-3 rounded-2xl bg-sage-100 text-forest border border-sage-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 stroke-[2]" />
              <span>Your review was published successfully!</span>
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-brandText-primary dark:text-cream mb-1.5">
                Your Star Rating (1 to 5)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setRating(st)}
                    className="p-1 text-cream-200 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-5 h-5 ${
                        st <= rating
                          ? 'fill-accent text-accent'
                          : 'text-cream-200 dark:text-brandBorder-dark'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-extrabold text-accent ml-2">
                  {rating}.0 / 5
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-brandText-primary dark:text-cream mb-1">
                Your Review
              </label>
              <textarea
                rows="4"
                required
                placeholder="Share food quality, packaging, hygiene, or favorite dishes..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandCard-dark text-xs text-brandText-primary dark:text-cream focus:outline-none focus:border-sage"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-2xl bg-primary text-white text-xs font-bold hover:bg-primary-600 transition shadow-subtle"
            >
              Submit Review
            </button>
          </form>
        </div>

        {/* Reviews List & Filter (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-brandText-primary dark:text-cream">
              Student Reviews ({filteredReviews.length})
            </h3>

            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-brandText-secondary">Filter:</span>
              <select
                value={filterStar}
                onChange={(e) => setFilterStar(e.target.value)}
                className="px-2.5 py-1 rounded-xl border border-brandBorder-light dark:border-brandBorder-dark bg-white dark:bg-brandCard-dark text-xs font-semibold text-brandText-primary dark:text-cream"
              >
                <option value="All">All Stars</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {filteredReviews.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-brandBorder-light dark:border-brandBorder-dark text-xs text-brandText-secondary">
                No reviews yet for this filter.
              </div>
            ) : (
              filteredReviews.map(rev => {
                const isReported = reportedReviews.includes(rev.id);

                return (
                  <div
                    key={rev.id}
                    className="bg-white dark:bg-brandCard-dark p-4 rounded-2xl border border-brandBorder-light dark:border-brandBorder-dark shadow-subtle space-y-2"
                  >
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.userAvatar}
                          alt={rev.userName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-bold text-xs text-brandText-primary dark:text-cream">
                            {rev.userName}
                          </p>
                          <p className="text-[10px] text-brandText-secondary">{rev.userRole} • {rev.date}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-cream-100 dark:bg-brandBorder-dark text-brandText-primary dark:text-cream px-2 py-0.5 rounded-lg text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-accent text-accent" />
                        <span>{rev.rating}.0</span>
                      </div>
                    </div>

                    <p className="text-xs text-brandText-primary dark:text-cream leading-relaxed">
                      "{rev.comment}"
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-brandBorder-light dark:border-brandBorder-dark text-[11px]">
                      {rev.verifiedOrder ? (
                        <span className="text-forest dark:text-sage-300 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 stroke-[2]" />
                          <span>Verified Order</span>
                        </span>
                      ) : (
                        <span />
                      )}

                      <button
                        onClick={() => handleReport(rev.id)}
                        disabled={isReported}
                        className={`inline-flex items-center gap-1 text-[10px] font-medium transition ${
                          isReported
                            ? 'text-brandText-secondary cursor-not-allowed'
                            : 'text-brandText-secondary hover:text-rose-600'
                        }`}
                      >
                        <Flag className="w-3 h-3" />
                        <span>{isReported ? 'Reported' : 'Report'}</span>
                      </button>
                    </div>

                    {rev.canteenResponse && (
                      <div className="mt-2.5 p-2.5 rounded-2xl bg-cream-100 dark:bg-brandBorder-dark/40 border-l-2 border-forest text-xs">
                        <span className="font-bold text-forest dark:text-cream text-[11px]">Canteen Staff:</span>
                        <p className="text-brandText-secondary text-[11px] mt-0.5">{rev.canteenResponse}</p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
