"use client";

import { useEffect, useState } from "react";
import {
  Heart,
  Bookmark,
  Share2,
  Loader2,
  Check,
  MessageSquare,
} from "lucide-react";
import { useSessionId } from "@/lib/use-session-id";
import { Modal } from "@/components/ui/modal";
import Link from "next/link";

type PostInteractionsProps = {
  slug: string;
};

export function PostInteractions({ slug }: PostInteractionsProps) {
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [isTogglingReaction, setIsTogglingReaction] = useState(false);
  const [isTogglingBookmark, setIsTogglingBookmark] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const sessionId = useSessionId();

  useEffect(() => {
    let isMounted = true;
    if (!sessionId) return; // Wait until session ID is ready

    async function fetchInteractions() {
      try {
        const headers: Record<string, string> = {};
        if (sessionId) headers["x-session-id"] = sessionId;

        const [reactionsRes, bookmarksRes] = await Promise.all([
          fetch(`/api/content/posts/${slug}/reactions`, { headers }),
          fetch(`/api/content/posts/${slug}/bookmarks/status`, { headers }),
        ]);

        if (!isMounted) return;

        if (reactionsRes.ok) {
          const data = await reactionsRes.json();
          setLikes(data.data.counts?.like || 0);
          setComments(data.data.counts?.comments || 0);
          setIsLiked(data.data.userReaction === "like");
        }

        if (bookmarksRes.ok) {
          const data = await bookmarksRes.json();
          setIsBookmarked(data.data.isBookmarked);
        }
      } catch (error) {
        console.error("Failed to fetch interactions", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchInteractions();
    return () => {
      isMounted = false;
    };
  }, [slug, sessionId]);

  const toggleReaction = async () => {
    if (isTogglingReaction) return;
    setIsTogglingReaction(true);

    // Optimistic UI
    setIsLiked((prev) => !prev);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (sessionId) headers["x-session-id"] = sessionId;

      const res = await fetch(`/api/content/posts/${slug}/reactions`, {
        method: "POST",
        headers,
        body: JSON.stringify({ type: "like" }),
      });

      if (!res.ok) {
        // Revert on failure
        setIsLiked((prev) => !prev);
        setLikes((prev) => (isLiked ? prev + 1 : prev - 1));
      }
    } catch (error) {
      setIsLiked((prev) => !prev);
      setLikes((prev) => (isLiked ? prev + 1 : prev - 1));
    } finally {
      setIsTogglingReaction(false);
    }
  };

  const toggleBookmark = async () => {
    if (isTogglingBookmark) return;
    setIsTogglingBookmark(true);

    // Optimistic UI
    setIsBookmarked((prev) => !prev);

    try {
      const res = await fetch(`/api/content/posts/${slug}/bookmarks`, {
        method: "POST",
      });

      if (!res.ok) {
        // Revert on failure
        setIsBookmarked((prev) => !prev);
        if (res.status === 401) {
          setShowLoginModal(true);
        }
      }
    } catch (error) {
      setIsBookmarked((prev) => !prev);
    } finally {
      setIsTogglingBookmark(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        await navigator.share({
          title: document.title,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        // Show brief success state
        setTimeout(() => setIsSharing(false), 2000);
        return;
      }
    } catch (err) {
      console.error("Error sharing", err);
    }
    setIsSharing(false);
  };

  const handleScrollToComments = () => {
    const el = document.getElementById("comments-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      const textarea = el.querySelector("textarea");
      if (textarea) setTimeout(() => textarea.focus(), 500);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 md:border-none">
        <Loader2 className="w-5 h-5 animate-spin text-[color-mix(in_srgb,var(--foreground)_30%,transparent)]" />
      </div>
    );
  }

  return (
    <div className="sticky bottom-0 md:static z-40 py-2 px-2 md:px-4 w-full">
      <div className="flex items-center justify-between md:justify-start gap-4 md:gap-6 w-full max-w-content mx-auto">
        <div className="flex items-center gap-4 md:gap-6">
          <button
            onClick={toggleReaction}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              isLiked
                ? "text-red-500"
                : "text-[color-mix(in_srgb,var(--foreground)_55%,transparent)] hover:text-foreground"
            }`}
            title="Like this post"
          >
            <Heart
              className={`w-5 h-5 transition-transform active:scale-95 ${isLiked ? "fill-current" : ""}`}
            />
            <span className="min-w-[1ch]">{likes > 0 ? likes : "Like"}</span>
          </button>

          <button
            onClick={handleScrollToComments}
            className="flex items-center gap-2 text-sm font-medium transition-colors text-[color-mix(in_srgb,var(--foreground)_55%,transparent)] hover:text-foreground"
            title="Jump to comments"
          >
            <MessageSquare className="w-5 h-5 transition-transform active:scale-95" />
            <span className="min-w-[1ch]">
              {comments > 0 ? comments : "Comment"}
            </span>
          </button>

          <button
            onClick={toggleBookmark}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
              isBookmarked
                ? "text-blue-500"
                : "text-[color-mix(in_srgb,var(--foreground)_55%,transparent)] hover:text-foreground"
            }`}
            title={isBookmarked ? "Remove bookmark" : "Save for later"}
          >
            <Bookmark
              className={`w-5 h-5 transition-transform active:scale-95 ${isBookmarked ? "fill-current" : ""}`}
            />
            <span className="hidden sm:inline">
              {isBookmarked ? "Saved" : "Save"}
            </span>
          </button>
        </div>

        <button
          onClick={handleShare}
          className="flex items-center gap-2 text-sm font-medium text-[color-mix(in_srgb,var(--foreground)_55%,transparent)] hover:text-foreground transition-colors md:ml-auto"
          title="Share this post"
        >
          {isSharing ? (
            <Check className="w-5 h-5 text-green-500" />
          ) : (
            <Share2 className="w-5 h-5 transition-transform active:scale-95" />
          )}
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      <Modal
        open={showLoginModal}
        title="Sign in to bookmark"
        description="You need to be logged in to save posts to your bookmarks."
        onClose={() => setShowLoginModal(false)}
        width="md"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowLoginModal(false)}
              className="px-4 py-2 text-sm font-medium text-[color-mix(in_srgb,var(--foreground)_60%,transparent)] hover:text-foreground transition-colors"
            >
              Cancel
            </button>
            <Link
              href={`/login?redirect=${encodeURIComponent(`/posts/${slug}`)}`}
              className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-[color-mix(in_srgb,var(--foreground)_90%,transparent)]"
            >
              Sign in
            </Link>
          </div>
        }
      >
        <div className="py-2 text-sm text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
          Join our community to save your favorite articles, leave comments, and
          more.
        </div>
      </Modal>
    </div>
  );
}
