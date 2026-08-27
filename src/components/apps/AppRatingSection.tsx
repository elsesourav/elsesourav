import React, { useState, useEffect } from 'react';
import { Star, Send } from 'lucide-react';
import { Button, Textarea, Alert } from '@/components/ui';
import { useAppFeedback } from '@/hooks/useAppFeedback';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { isErr } from '@/lib/result';
import type { AppRatingAggregate, AppFeedback } from '@/types/feedback.types';
import './AppRatingSection.css';

export interface AppRatingSectionProps {
  appId: string;
  appName: string;
  initialAggregate?: AppRatingAggregate | null;
  initialReviews?: AppFeedback[];
  className?: string;
}

export const AppRatingSection: React.FC<AppRatingSectionProps> = ({
  appId,
  appName,
  initialAggregate,
  initialReviews = [],
  className = '',
}) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { userReview, approvedReviews, ratingAggregate, isSubmitting, submitReview } =
    useAppFeedback(appId);

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [message, setMessage] = useState<string>('');
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync state if userReview exists
  useEffect(() => {
    if (userReview) {
      setRating(userReview.rating);
      setMessage(userReview.message || '');
    }
  }, [userReview]);

  const aggregate = ratingAggregate || initialAggregate;
  const reviews = approvedReviews.length > 0 ? approvedReviews : initialReviews;

  const averageScore = aggregate?.averageRating ?? 5.0;
  const totalCount = aggregate?.ratingCount ?? reviews.length;
  const distribution = aggregate?.distribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackError(null);
    setSuccessMessage(null);

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const res = await submitReview(rating, message);
    if (isErr(res)) {
      setFeedbackError(res.error.message);
    } else {
      setSuccessMessage('Thank you! Your review has been submitted for moderation.');
    }
  };

  return (
    <section
      className={`app-rating-section ${className}`}
      aria-labelledby="ratings-reviews-heading"
    >
      <h2 id="ratings-reviews-heading" className="app-rating-section__title">
        Ratings & Reviews
      </h2>

      <div className="app-rating-section__grid">
        {/* Rating Summary Card */}
        <div className="app-rating-section__summary-card">
          <div className="app-rating-section__score">{averageScore.toFixed(1)}</div>
          <div
            className="app-rating-section__stars"
            aria-label={`Average score ${averageScore.toFixed(1)} out of 5 stars`}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={18}
                fill={i < Math.round(averageScore) ? 'currentColor' : 'none'}
                color="currentColor"
              />
            ))}
          </div>
          <div className="app-rating-section__count">
            {totalCount} {totalCount === 1 ? 'Rating' : 'Ratings'}
          </div>

          {/* Breakdown bars */}
          <div className="app-rating-section__breakdown">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = distribution[stars as keyof typeof distribution] || 0;
              const percent = totalCount > 0 ? (count / totalCount) * 100 : stars === 5 ? 100 : 0;
              return (
                <div key={stars} className="app-rating-section__breakdown-row">
                  <span>{stars}★</span>
                  <div className="app-rating-section__breakdown-bar-bg">
                    <div
                      className="app-rating-section__breakdown-bar-fill"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Review Submission Form */}
        <div className="app-rating-section__form-card">
          <h3 className="app-rating-section__form-title">
            {userReview ? 'Update Your Review' : `Rate ${appName}`}
          </h3>

          {feedbackError && (
            <Alert variant="error" onDismiss={() => setFeedbackError(null)}>
              {feedbackError}
            </Alert>
          )}

          {successMessage && (
            <Alert variant="success" onDismiss={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          )}

          <form
            onSubmit={handleSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
          >
            <div>
              <label
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                  display: 'block',
                  marginBottom: 'var(--space-2)',
                }}
              >
                Your Rating
              </label>
              <div
                className="app-rating-section__star-picker"
                role="radiogroup"
                aria-label="Select star rating"
              >
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const active = (hoverRating || rating) >= starValue;
                  return (
                    <button
                      key={starValue}
                      type="button"
                      role="radio"
                      aria-checked={rating === starValue}
                      aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
                      className={`app-rating-section__star-btn ${active ? 'app-rating-section__star-btn--active' : ''}`}
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(starValue)}
                    >
                      <Star size={24} fill={active ? '#f59e0b' : 'none'} color="#f59e0b" />
                    </button>
                  );
                })}
              </div>
            </div>

            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your feedback, what you like or what could be improved..."
              rows={3}
              aria-label="Review message"
            />

            <div>
              {isAuthenticated ? (
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  isLoading={isSubmitting}
                  leftIcon={<Send size={14} />}
                >
                  {userReview ? 'Update Review' : 'Submit Review'}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/login')}
                >
                  Sign in to Leave a Review
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Approved Community Reviews */}
      {reviews.length > 0 && (
        <div className="app-rating-section__reviews-list" aria-label="Community reviews">
          {reviews.map((rev) => (
            <article key={rev.id} className="app-rating-section__review-card">
              <header className="app-rating-section__review-header">
                <div className="app-rating-section__reviewer-info">
                  <div className="app-rating-section__reviewer-avatar">
                    {(rev.userDisplayName || 'User').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="app-rating-section__reviewer-name">
                      {rev.userDisplayName || 'Verified User'}
                    </div>
                    <div className="app-rating-section__review-date">
                      {new Date(rev.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </div>
                  </div>
                </div>

                <div
                  className="app-rating-section__stars"
                  aria-label={`Rated ${rev.rating} out of 5 stars`}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      fill={i < rev.rating ? 'currentColor' : 'none'}
                      color="currentColor"
                    />
                  ))}
                </div>
              </header>

              {rev.message && <p className="app-rating-section__review-message">{rev.message}</p>}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};
