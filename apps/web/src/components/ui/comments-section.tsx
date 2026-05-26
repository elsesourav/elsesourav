"use client";

import { useSessionId } from "@/lib/use-session-id";
import { formatDateTime } from "@/lib/view-models";
import { CornerDownRight, Heart, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

type Comment = {
  id: string;
  authorName: string | null;
  content: string;
  createdAt: string;
  isApproved: boolean;
  likesCount: number;
  replies: Comment[];
  reactions?: { id: string }[];
  user: { name: string | null; image: string | null; role?: string } | null;
};

type CommentsSectionProps = {
  slug: string;
};

export function CommentsSection({ slug }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState("newest");
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const sessionId = useSessionId();

  useEffect(() => {
    let isMounted = true;
    if (sessionId !== null) {
      fetchComments(true, sort, isMounted);
    }
    return () => {
      isMounted = false;
    };
  }, [slug, sort, sessionId]);

  async function fetchComments(
    reset = false,
    currentSort = sort,
    isMounted = true,
  ) {
    if (reset) {
      if (isMounted) setIsLoading(true);
    } else {
      if (isMounted) setIsLoadingMore(true);
    }

    try {
      const query = new URLSearchParams({ sort: currentSort, limit: "15" });
      if (!reset && cursor) query.set("cursor", cursor);

      const headers: Record<string, string> = {};
      if (sessionId) headers["x-session-id"] = sessionId;

      const res = await fetch(
        `/api/content/posts/${slug}/comments?${query.toString()}`,
        { headers },
      );
      if (!isMounted) return;

      if (res.ok) {
        const data = await res.json();
        const items = data.data.items || [];

        if (reset) {
          setComments(items);
        } else {
          setComments((prev) => [...prev, ...items]);
        }

        setHasMore(data.data.pagination?.hasMore || false);
        setCursor(data.data.pagination?.nextCursor || null);
      } else {
        throw new Error("Failed to load comments");
      }
    } catch (err) {
      if (isMounted) setError("Failed to load comments.");
    } finally {
      if (isMounted) {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    }
  }

  const handleCommentAdded = (newComment: Comment, parentId?: string) => {
    if (!parentId) {
      if (sort === "oldest") {
        setComments((prev) => [...prev, newComment]);
      } else {
        setComments((prev) => [newComment, ...prev]);
      }
    } else {
      setComments((prev) => {
        const updateReplies = (list: Comment[]): Comment[] => {
          return list.map((c) => {
            if (c.id === parentId) {
              return { ...c, replies: [...(c.replies || []), newComment] };
            }
            if (c.replies && c.replies.length > 0) {
              return { ...c, replies: updateReplies(c.replies) };
            }
            return c;
          });
        };
        return updateReplies(prev);
      });
    }
  };

  if (error) {
    return (
      <div className="py-8 text-center text-red-500 text-sm">
        {error}
        <button onClick={() => fetchComments(true)} className="ml-2 underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-10 border-t border-[color-mix(in_srgb,var(--foreground)_8%,transparent)]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-2xl font-bold text-foreground tracking-tight">
            Discussion
          </h3>
          <span className="flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] text-xs font-bold text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]">
            {comments.length > 0
              ? hasMore
                ? `${comments.length}+`
                : comments.length
              : 0}
          </span>
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="bg-transparent border border-[color-mix(in_srgb,var(--foreground)_15%,transparent)] rounded-lg px-3 py-1.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand-secondary)_50%,transparent)]"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="liked">Most Liked</option>
        </select>
      </div>

      <CommentForm
        slug={slug}
        onCommentAdded={(c) => handleCommentAdded(c)}
        sessionId={sessionId}
      />

      <div className="flex flex-col gap-6 mt-4">
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)]" />
                <div className="flex-1 space-y-3 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-24 bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)] rounded" />
                    <div className="h-3 w-16 bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] rounded" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-full bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] rounded" />
                    <div className="h-3 w-4/5 bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-center bg-[color-mix(in_srgb,var(--foreground)_2%,transparent)] rounded-2xl border border-[color-mix(in_srgb,var(--foreground)_6%,transparent)]">
            <p className="text-base font-medium text-[color-mix(in_srgb,var(--foreground)_60%,transparent)]">
              No comments yet.
            </p>
            <p className="text-sm text-[color-mix(in_srgb,var(--foreground)_40%,transparent)] mt-1">
              Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                slug={slug}
                onReplyAdded={handleCommentAdded}
                sessionId={sessionId}
              />
            ))}
          </div>
        )}

        {hasMore && !isLoading && (
          <div className="flex justify-center pt-6 pb-2 border-t border-[color-mix(in_srgb,var(--foreground)_6%,transparent)]">
            <button
              onClick={() => fetchComments(false)}
              disabled={isLoadingMore}
              className="px-6 py-2.5 text-sm font-semibold text-foreground bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)] hover:bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)] rounded-full transition-colors flex items-center gap-2"
            >
              {isLoadingMore && <Loader2 className="w-4 h-4 animate-spin" />}
              Load more comments
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  slug,
  onReplyAdded,
  isReply = false,
  sessionId,
}: {
  comment: Comment;
  slug: string;
  onReplyAdded: (c: Comment, parentId?: string) => void;
  isReply?: boolean;
  sessionId: string | null;
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [likes, setLikes] = useState(comment.likesCount || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [hasLikedLocally, setHasLikedLocally] = useState(
    comment.reactions && comment.reactions.length > 0 ? true : false,
  );

  const handleLike = async () => {
    if (isLiking) return;
    
    // Snapshot previous state for rollback
    const previousLikes = likes;
    const previousHasLiked = hasLikedLocally;

    setIsLiking(true);
    setLikes((prev) => previousHasLiked ? prev - 1 : prev + 1);
    setHasLikedLocally(!previousHasLiked);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (sessionId) headers["x-session-id"] = sessionId;

      const res = await fetch(
        `/api/content/posts/${slug}/comments/${comment.id}/like`,
        {
          method: "POST",
          headers,
        },
      );
      if (!res.ok) throw new Error();

      const data = await res.json();
      setLikes(data.data.likesCount);
      setHasLikedLocally(data.data.hasLiked);
    } catch {
      // Rollback to previous state
      setLikes(previousLikes);
      setHasLikedLocally(previousHasLiked);
    } finally {
      setIsLiking(false);
    }
  };

  const isAdmin = comment.user?.role === "ADMIN";

  return (
    <div
      className={`flex gap-3 sm:gap-4 ${isReply ? "mt-6 relative" : ""} ${
        isAdmin
          ? "p-3 sm:p-4 -mx-3 sm:-mx-4 rounded-xl bg-[color-mix(in_srgb,var(--brand-primary)_3%,transparent)] border border-[color-mix(in_srgb,var(--brand-primary)_10%,transparent)]"
          : ""
      }`}
    >
      {isReply && (
        <div className="absolute -left-5 top-0 bottom-0 w-px bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] hidden sm:block" />
      )}
      <div className="shrink-0 z-10">
        {comment.user?.image ? (
          <img
            src={comment.user.image}
            alt={comment.user.name || "User"}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover shadow-sm bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)]"
          />
        ) : (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] flex items-center justify-center text-[color-mix(in_srgb,var(--foreground)_50%,transparent)] font-bold text-sm shadow-sm">
            {(comment.authorName || comment.user?.name || "A")[0].toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-1.5">
          <span className="font-bold text-foreground text-[14px]">
            {comment.user?.name || comment.authorName || "Anonymous"}
          </span>
          {isAdmin && (
            <span className="text-[10px] uppercase font-bold tracking-widest text-brand-primary bg-[color-mix(in_srgb,var(--brand-primary)_15%,transparent)] px-1.5 py-0.5 rounded ml-1">
              Admin
            </span>
          )}
          <span className="text-[12px] font-medium text-[color-mix(in_srgb,var(--foreground)_40%,transparent)]">
            {formatDateTime(comment.createdAt)}
          </span>
          {!comment.isApproved && (
            <span className="text-[10px] uppercase font-bold tracking-widest text-[color-mix(in_srgb,var(--brand-secondary)_80%,transparent)] bg-[color-mix(in_srgb,var(--brand-secondary)_10%,transparent)] px-2 py-0.5 rounded-md ml-auto sm:ml-2">
              Pending
            </span>
          )}
        </div>
        <div className="text-[14px] text-[color-mix(in_srgb,var(--foreground)_75%,transparent)] leading-relaxed mb-3 whitespace-pre-wrap wrap-break-word">
          {comment.content}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${
              hasLikedLocally
                ? "text-red-500"
                : "text-[color-mix(in_srgb,var(--foreground)_40%,transparent)] hover:text-red-500"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 ${hasLikedLocally ? "fill-current" : ""}`}
            />
            {likes > 0 && <span>{likes}</span>}
          </button>

          {!isReply && (
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="text-xs font-bold text-[color-mix(in_srgb,var(--foreground)_40%,transparent)] hover:text-foreground transition-colors flex items-center gap-1.5"
            >
              <CornerDownRight className="w-3.5 h-3.5" />
              Reply
            </button>
          )}
        </div>

        {isReplying && (
          <div className="mt-4 mb-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <CommentForm
              slug={slug}
              parentId={comment.id}
              sessionId={sessionId}
              onCommentAdded={(c) => {
                setIsReplying(false);
                onReplyAdded(c, comment.id);
              }}
              onCancel={() => setIsReplying(false)}
            />
          </div>
        )}

        {comment.replies?.length > 0 && (
          <div className="mt-2 space-y-2 sm:pl-5">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                slug={slug}
                onReplyAdded={onReplyAdded}
                isReply
                sessionId={sessionId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CommentForm({
  slug,
  parentId,
  sessionId,
  onCommentAdded,
  onCancel,
}: {
  slug: string;
  parentId?: string;
  sessionId: string | null;
  onCommentAdded: (comment: Comment) => void;
  onCancel?: () => void;
}) {
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (sessionId) headers["x-session-id"] = sessionId;

      const res = await fetch(`/api/content/posts/${slug}/comments`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          content,
          authorName: authorName.trim() || undefined,
          authorEmail: authorEmail.trim() || undefined,
          parentId,
        }),
      });

      const resData = await res.json();

      if (!res.ok) {
        throw new Error(resData.message || "Failed to post comment");
      }

      setContent("");
      if (!parentId) {
        setAuthorName("");
        setAuthorEmail("");
      }

      // Pass the newly created comment object returned from the API directly to the parent
      onCommentAdded(resData.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[color-mix(in_srgb,var(--background)_95%,var(--foreground)_5%)] rounded-2xl p-4 sm:p-5 border border-[color-mix(in_srgb,var(--foreground)_8%,transparent)] shadow-sm"
    >
      {error && (
        <div className="mb-4 text-red-500 text-sm font-medium bg-red-500/10 p-3 rounded-lg">
          {error}
        </div>
      )}

      {!parentId && !isAuthenticated && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder="Name (optional)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="bg-background border border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand-secondary)_50%,transparent)] transition-all"
          />
          <input
            type="email"
            placeholder="Email (optional, kept private)"
            value={authorEmail}
            onChange={(e) => setAuthorEmail(e.target.value)}
            className="bg-background border border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand-secondary)_50%,transparent)] transition-all"
          />
        </div>
      )}

      {isAuthenticated && (
        <div className="flex items-center gap-2 mb-3 px-1 text-sm font-medium text-[color-mix(in_srgb,var(--foreground)_70%,transparent)]">
          {session?.user?.image ? (
            <img src={session.user.image} alt={session.user.name || "User"} className="w-6 h-6 rounded-full" />
          ) : (
            <div className="w-6 h-6 rounded-full bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)] flex items-center justify-center font-bold text-xs">
              {(session?.user?.name || "U")[0].toUpperCase()}
            </div>
          )}
          <span>Commenting as <strong className="text-foreground">{session?.user?.name || (session?.user?.role === "ADMIN" ? "Admin" : "User")}</strong></span>
        </div>
      )}

      <textarea
        placeholder="Add to the discussion..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        rows={parentId ? 2 : 3}
        className="w-full bg-background border border-[color-mix(in_srgb,var(--foreground)_10%,transparent)] rounded-xl px-4 py-3 text-[15px] focus:outline-none focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand-secondary)_50%,transparent)] resize-none mb-3 transition-all"
      />

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-sm font-bold text-[color-mix(in_srgb,var(--foreground)_50%,transparent)] hover:text-foreground transition-colors rounded-xl hover:bg-[color-mix(in_srgb,var(--foreground)_5%,transparent)]"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="px-6 py-2.5 text-sm font-bold bg-foreground text-background rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {parentId ? "Reply" : "Post Comment"}
        </button>
      </div>
    </form>
  );
}
