import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, CheckCircle2, MessageSquareHeart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { helpService } from '@/services/help.service';
import { useAuth } from '@/hooks/useAuth';
import { getAnonymousSessionId } from '@/utils/session';
import type { HelpArticle } from '@/types/help.types';
import { ROUTES } from '@/constants/routes';
import './ArticleHelpfulness.css';

interface ArticleHelpfulnessProps {
  readonly article: HelpArticle;
  readonly onFeedbackSubmitted?: (helpful: boolean) => void;
}

export const ArticleHelpfulness: React.FC<ArticleHelpfulnessProps> = ({
  article,
  onFeedbackSubmitted,
}) => {
  const { user, authUser } = useAuth();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'submitted_yes' | 'submitted_no'>(
    'idle'
  );
  const [error, setError] = useState<string | null>(null);

  // Check if this session already voted
  useEffect(() => {
    try {
      const storageKey = `elsesourav_help_voted_${article.id}`;
      const savedVote = sessionStorage.getItem(storageKey);
      if (savedVote === 'yes') {
        setStatus('submitted_yes');
      } else if (savedVote === 'no') {
        setStatus('submitted_no');
      }
    } catch {
      // Storage unavailable or disabled
    }
  }, [article.id]);

  const handleVote = async (helpful: boolean) => {
    setStatus('submitting');
    setError(null);

    const sessionId = getAnonymousSessionId();

    try {
      const res = await helpService.submitHelpfulness({
        articleId: article.id,
        helpful,
        userId: user?.id || authUser?.uid,
        sessionId,
      });

      if (res.success) {
        const nextStatus = helpful ? 'submitted_yes' : 'submitted_no';
        setStatus(nextStatus);

        try {
          sessionStorage.setItem(`elsesourav_help_voted_${article.id}`, helpful ? 'yes' : 'no');
        } catch {
          // Ignore storage write error
        }

        if (onFeedbackSubmitted) {
          onFeedbackSubmitted(helpful);
        }
      } else if (res.error.code === 'CONFLICT') {
        // Idempotent duplicate: already voted in DB
        const nextStatus = helpful ? 'submitted_yes' : 'submitted_no';
        setStatus(nextStatus);
      } else {
        setError(res.error.message || 'Failed to submit feedback.');
        setStatus('idle');
      }
    } catch {
      setError('An unexpected error occurred.');
      setStatus('idle');
    }
  };

  const supportQuery = new URLSearchParams({
    ref: 'help_article',
    article: article.slug,
    title: article.title,
  }).toString();

  return (
    <section className="article-helpfulness-widget" aria-label="Article Helpfulness Rating">
      {status === 'idle' && (
        <div className="article-helpfulness__idle">
          <div className="article-helpfulness__text">
            <h3 className="article-helpfulness__title">Was this article helpful?</h3>
            <p className="article-helpfulness__desc">
              Your feedback helps us continuously improve our documentation.
            </p>
          </div>

          <div className="article-helpfulness__buttons">
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ThumbsUp size={15} />}
              onClick={() => void handleVote(true)}
              aria-label="Yes, this article was helpful"
            >
              Yes
            </Button>
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<ThumbsDown size={15} />}
              onClick={() => void handleVote(false)}
              aria-label="No, this article was not helpful"
            >
              No
            </Button>
          </div>
        </div>
      )}

      {status === 'submitting' && (
        <div className="article-helpfulness__submitting" aria-live="polite">
          <Loader2 size={18} className="article-helpfulness__spinner" aria-hidden="true" />
          <span>Submitting feedback...</span>
        </div>
      )}

      {status === 'submitted_yes' && (
        <div
          className="article-helpfulness__confirmed article-helpfulness__confirmed--yes"
          aria-live="polite"
        >
          <CheckCircle2
            size={20}
            className="article-helpfulness__icon--success"
            aria-hidden="true"
          />
          <div className="article-helpfulness__confirmed-text">
            <h4 className="article-helpfulness__confirmed-title">Thank you for your feedback!</h4>
            <p className="article-helpfulness__confirmed-desc">
              We&apos;re glad this guide helped you resolve your question.
            </p>
          </div>
        </div>
      )}

      {status === 'submitted_no' && (
        <div className="article-helpfulness__escalation" aria-live="polite">
          <div className="article-helpfulness__escalation-info">
            <h4 className="article-helpfulness__escalation-title">
              Sorry this didn&apos;t solve your problem.
            </h4>
            <p className="article-helpfulness__escalation-desc">
              Need personalized assistance? Sourav is happy to help answer your questions.
            </p>
          </div>

          <div className="article-helpfulness__escalation-action">
            <Link to={`${ROUTES.SUPPORT}?${supportQuery}`} style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="sm" leftIcon={<MessageSquareHeart size={15} />}>
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      )}

      {error && (
        <p className="article-helpfulness__error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
};
