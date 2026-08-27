import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  LifeBuoy,
  MessageSquare,
  Send,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Sparkles,
  LogIn,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { supportService } from '@/services/support.service';
import type {
  SupportTicket,
  SupportTicketCategory,
  SupportTicketPriority,
} from '@/types/support.types';
import { ROUTES } from '@/constants/routes';
import './SupportPage.css';

const CATEGORY_OPTIONS: readonly { value: SupportTicketCategory; label: string }[] = [
  { value: 'app_issue', label: 'App Issue / Malfunction' },
  { value: 'account', label: 'Account & Authentication' },
  { value: 'download', label: 'Download & Installation' },
  { value: 'chrome_extension', label: 'Chrome Extension' },
  { value: 'android_app', label: 'Android Application' },
  { value: 'bug_report', label: 'Bug Report' },
  { value: 'general', label: 'General Question' },
  { value: 'other', label: 'Other Inquiries' },
];

export const SupportPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, authUser, isAuthenticated, isAdmin } = useAuth();

  const refParam = searchParams.get('ref');
  const articleParam = searchParams.get('article');
  const titleParam = searchParams.get('title');

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<SupportTicketCategory>('general');
  const [priority, setPriority] = useState<SupportTicketPriority>('normal');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdTicket, setCreatedTicket] = useState<SupportTicket | null>(null);

  // Pre-fill from escalation query parameters
  useEffect(() => {
    if (refParam === 'help_article' && titleParam) {
      setSubject(`Help with: ${titleParam}`);
      setDescription(
        `I was reading the help article "${titleParam}" (${articleParam || ''}) and need assistance with:\n\n`
      );
      setCategory('general');
    }
  }, [refParam, articleParam, titleParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || (!user && !authUser)) {
      navigate(
        `${ROUTES.LOGIN}?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`
      );
      return;
    }

    if (subject.trim().length < 5) {
      setError('Subject must be at least 5 characters long.');
      return;
    }

    if (description.trim().length < 10) {
      setError('Please provide more details (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const currentUser = {
      id: user?.id || authUser?.uid || '',
      email: user?.email || authUser?.email || '',
      name: user?.displayName || authUser?.displayName || '',
      role: user?.role,
    };

    const res = await supportService.createTicket(
      {
        subject: subject.trim(),
        description: description.trim(),
        category,
        priority: isAdmin ? priority : 'normal',
        userEmail: currentUser.email,
        userName: currentUser.name,
      },
      currentUser
    );

    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error.message);
      return;
    }

    setCreatedTicket(res.data);
  };

  const handleReset = () => {
    setCreatedTicket(null);
    setSubject('');
    setDescription('');
    setCategory('general');
    setPriority('normal');
    setError(null);
  };

  return (
    <div className="support-page">
      {/* Header */}
      <header className="support-header">
        <div className="support-header__badge">
          <LifeBuoy size={14} />
          <span>Help & Assistance</span>
        </div>
        <h1 className="support-header__title">How can we help you?</h1>
        <p className="support-header__desc">
          Have a question, feedback, or found a bug? Submit a support request directly to the
          developer and track its progress in real time.
        </p>
      </header>

      {/* Authenticated user tickets banner */}
      {isAuthenticated && (
        <div className="support-tickets-banner">
          <div className="support-tickets-banner__info">
            <MessageSquare size={20} className="text-primary-400" />
            <div>
              <h3 className="support-tickets-banner__title">My Support Tickets</h3>
              <p className="support-tickets-banner__desc">
                View your active conversations, responses, and past resolved tickets.
              </p>
            </div>
          </div>
          <Link to={ROUTES.SUPPORT_TICKETS}>
            <Button variant="secondary" size="sm" rightIcon={<ArrowRight size={14} />}>
              View My Tickets
            </Button>
          </Link>
        </div>
      )}

      <div className="support-grid">
        {/* Main Content Area */}
        <main className="support-main">
          {createdTicket ? (
            <div className="support-form-card support-success-card" aria-live="polite">
              <CheckCircle2 size={44} className="support-success-card__icon" />
              <h2 className="support-success-card__title">Support Ticket Created!</h2>
              <div className="support-success-card__number">{createdTicket.ticketNumber}</div>
              <p className="support-success-card__desc">
                Your request has been submitted to the support queue. We review inquiries promptly
                and will follow up with you in the message thread.
              </p>

              <div className="support-success-card__actions">
                <Link to={`${ROUTES.SUPPORT_TICKETS}/${createdTicket.id}`}>
                  <Button variant="primary" size="md" rightIcon={<ArrowRight size={15} />}>
                    View Ticket Thread
                  </Button>
                </Link>
                <Button variant="ghost" size="md" onClick={handleReset}>
                  Submit Another Request
                </Button>
              </div>
            </div>
          ) : (
            <div className="support-form-card">
              <div className="support-form-card__header">
                <h2 className="support-form-card__title">Create Support Ticket</h2>
                <p className="support-form-card__subtitle">
                  Fill out the details below so we can assist you effectively.
                </p>
              </div>

              {!isAuthenticated && (
                <div className="support-auth-prompt">
                  <h3 className="support-auth-prompt__title">Sign In Required</h3>
                  <p className="support-auth-prompt__desc">
                    To prevent spam and allow you to track responses and reply to messages, please
                    sign in before submitting a ticket.
                  </p>
                  <Link to={ROUTES.LOGIN}>
                    <Button variant="primary" size="sm" leftIcon={<LogIn size={15} />}>
                      Sign In to Continue
                    </Button>
                  </Link>
                </div>
              )}

              {error && (
                <div className="support-error-alert" role="alert">
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="support-form">
                <div className="support-form__group">
                  <label htmlFor="ticket-subject" className="support-form__label">
                    Subject <span className="text-danger-400">*</span>
                  </label>
                  <input
                    id="ticket-subject"
                    type="text"
                    className="support-form__input"
                    placeholder="e.g. Issue installing Chrome extension"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    maxLength={150}
                  />
                </div>

                <div className="support-form__row">
                  <div className="support-form__group">
                    <label htmlFor="ticket-category" className="support-form__label">
                      Category
                    </label>
                    <select
                      id="ticket-category"
                      className="support-form__select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as SupportTicketCategory)}
                    >
                      {CATEGORY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {isAdmin && (
                    <div className="support-form__group">
                      <label htmlFor="ticket-priority" className="support-form__label">
                        Priority (Admin)
                      </label>
                      <select
                        id="ticket-priority"
                        className="support-form__select"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as SupportTicketPriority)}
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="support-form__group">
                  <label htmlFor="ticket-description" className="support-form__label">
                    Description & Steps to Reproduce <span className="text-danger-400">*</span>
                  </label>
                  <textarea
                    id="ticket-description"
                    className="support-form__textarea"
                    placeholder="Please explain the issue or question in detail..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    required
                    maxLength={3000}
                  />
                </div>

                <div className="support-form__actions">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isSubmitting}
                    disabled={isSubmitting || !isAuthenticated}
                    leftIcon={<Send size={15} />}
                  >
                    Submit Support Ticket
                  </Button>
                </div>
              </form>
            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside className="support-sidebar">
          <div className="support-sidebar-card">
            <h3 className="support-sidebar-card__title">Knowledge Base</h3>
            <p className="text-sm text-secondary mb-4">
              Looking for quick setup guides, installation instructions, or common troubleshooting
              steps?
            </p>
            <Link to={ROUTES.HELP}>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<BookOpen size={14} />}
                style={{ width: '100%' }}
              >
                Browse Help Center
              </Button>
            </Link>
          </div>

          <div className="support-sidebar-card">
            <h3 className="support-sidebar-card__title">Quick Answers</h3>
            <ul className="support-faq-list">
              <li>
                <Link
                  to={`${ROUTES.HELP}/general-account/reset-password`}
                  className="support-faq-item"
                >
                  • How to reset your password
                </Link>
              </li>
              <li>
                <Link
                  to={`${ROUTES.HELP}/chrome-extensions/install-guide`}
                  className="support-faq-item"
                >
                  • Installing Chrome extensions
                </Link>
              </li>
              <li>
                <Link
                  to={`${ROUTES.HELP}/android-apps/apk-installation`}
                  className="support-faq-item"
                >
                  • Sideloading Android APKs
                </Link>
              </li>
              <li>
                <Link
                  to={`${ROUTES.HELP}/developer-tools/cli-quickstart`}
                  className="support-faq-item"
                >
                  • ElseSourav CLI setup
                </Link>
              </li>
            </ul>
          </div>

          <div className="support-sidebar-card">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={16} className="text-primary-400" />
              <h3 className="support-sidebar-card__title mb-0">Response Time</h3>
            </div>
            <p className="text-xs text-secondary leading-relaxed">
              Inquiries are typically reviewed within 24–48 hours directly by the platform
              developer. You will be notified when a reply is posted.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
