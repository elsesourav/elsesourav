"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime, type AdminFeedbackItem } from "@/lib/view-models";
import { useAppDispatch } from "@/store/hooks";
import { enqueueNotification } from "@/store/slices/notificationsSlice";
import type { ApiResponse } from "@elsesourav/types";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { Search, Filter, Star, EyeOff, Eye, Clock, User, AppWindow, MessageSquare } from "lucide-react";

type FeedbackVisibilityFilter = "all" | "visible" | "hidden";
type FeedbackMutationResponse = { id: string; isHidden: boolean; };

function parseApiMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const candidate = payload as { ok?: boolean; error?: { message?: string; }; };
  if (candidate.ok === false && candidate.error?.message) return candidate.error.message;
  return null;
}

function isApiSuccess<T>(payload: unknown): payload is Extract<ApiResponse<T>, { ok: true }> {
  if (!payload || typeof payload !== "object") return false;
  const candidate = payload as { ok?: boolean; data?: T; };
  return candidate.ok === true && "data" in candidate;
}

function toSortedFeedback(items: AdminFeedbackItem[]): AdminFeedbackItem[] {
  return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function AdminFeedbackClient({ initialFeedback }: { initialFeedback: AdminFeedbackItem[] }) {
  const dispatch = useAppDispatch();
  const [feedback, setFeedback] = useState(() => toSortedFeedback(initialFeedback));
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FeedbackVisibilityFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(feedback[0]?.id ?? null);
  const [pendingFeedbackId, setPendingFeedbackId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ feedbackId: string; nextHidden: boolean; } | null>(null);

  const filteredFeedback = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return feedback.filter((item) => {
      if (filter === "visible" && item.isHidden) return false;
      if (filter === "hidden" && !item.isHidden) return false;
      if (!normalizedQuery) return true;
      const haystack = [item.app.title, item.app.slug, item.user.name, item.user.email, item.message].filter(Boolean).join(" ").toLowerCase();
      return haystack.includes(normalizedQuery);
    });
  }, [feedback, filter, query]);

  const selectedItem = useMemo(() => feedback.find(f => f.id === selectedId), [feedback, selectedId]);
  const confirmItem = confirmAction ? feedback.find((item) => item.id === confirmAction.feedbackId) : null;

  async function onConfirmModeration() {
    if (!confirmAction || !confirmItem) return;
    setPendingFeedbackId(confirmAction.feedbackId);

    try {
      const response = await fetch(`/api/admin/feedback/${confirmAction.feedbackId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isHidden: confirmAction.nextHidden }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !isApiSuccess<FeedbackMutationResponse>(payload)) {
        dispatch(enqueueNotification({ tone: "error", message: parseApiMessage(payload) ?? "Failed to update feedback visibility." }));
        return;
      }

      setFeedback((prev) => prev.map((item) => item.id === confirmAction.feedbackId ? { ...item, isHidden: payload.data.isHidden } : item));
      dispatch(enqueueNotification({ tone: "success", message: payload.data.isHidden ? "Feedback hidden." : "Feedback restored." }));
    } catch (error) {
      dispatch(enqueueNotification({ tone: "error", message: error instanceof Error ? error.message : "Failed." }));
    } finally {
      setPendingFeedbackId(null);
      setConfirmAction(null);
    }
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] min-h-[600px] border border-border-subtle rounded-xl overflow-hidden bg-bg-base shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      
      {/* LEFT PANEL - LIST */}
      <div className="w-1/3 flex flex-col border-r border-border-subtle bg-bg-surface shrink-0">
        <div className="p-4 border-b border-border-subtle space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            <Input 
              placeholder="Search feedback..." 
              value={query} 
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-text-muted" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FeedbackVisibilityFilter)}
              className="h-8 w-full rounded-md border border-border-subtle bg-bg-base px-2 text-xs text-text-primary focus:ring-1 focus:ring-brand-accent outline-none"
            >
              <option value="all">All Feedback</option>
              <option value="visible">Visible Only</option>
              <option value="hidden">Hidden Only</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredFeedback.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-sm">
              No feedback matches your search.
            </div>
          ) : (
            <div className="divide-y divide-border-subtle">
              {filteredFeedback.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={cn(
                    "w-full text-left p-4 hover:bg-surface-hover transition-colors flex flex-col gap-2",
                    selectedId === item.id && "bg-brand-primary/5 hover:bg-brand-primary/10 border-l-2 border-l-brand-primary pl-[14px]"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-semibold text-sm text-text-primary line-clamp-1">{item.app.title}</span>
                    <Badge variant={item.isHidden ? "warning" : "default"} className="text-[10px] px-1.5 py-0">
                      {item.isHidden ? "Hidden" : "Visible"}
                    </Badge>
                  </div>
                  <p className="text-xs text-text-secondary line-clamp-2">{item.message}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-text-muted flex items-center gap-1">
                      <Star className="h-3 w-3 text-status-warning fill-current" />
                      {item.rating}/5
                    </span>
                    <span className="text-[10px] text-text-muted">{formatDateTime(item.createdAt).split(",")[0]}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL - DETAIL */}
      <div className="w-2/3 flex flex-col bg-bg-base">
        {selectedItem ? (
          <>
            <div className="p-6 border-b border-border-subtle flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-text-primary mb-1">Feedback for {selectedItem.app.title}</h2>
                <div className="flex items-center gap-4 text-sm text-text-muted">
                  <span className="flex items-center gap-1"><AppWindow className="h-4 w-4" /> /{selectedItem.app.slug}</span>
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {formatDateTime(selectedItem.createdAt)}</span>
                </div>
              </div>
              <Badge variant={selectedItem.isHidden ? "warning" : "success"} className="text-sm px-3 py-1">
                {selectedItem.isHidden ? "Hidden from public" : "Visible to public"}
              </Badge>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* User Info Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-text-muted uppercase tracking-wider">User Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-surface-active flex items-center justify-center font-bold text-text-primary">
                      {(selectedItem.user.name ?? selectedItem.user.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{selectedItem.user.name ?? "No name provided"}</p>
                      <p className="text-sm text-text-secondary">{selectedItem.user.email}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Feedback Content Card */}
              <Card>
                <CardHeader className="pb-3 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm text-text-muted uppercase tracking-wider">Feedback Message</CardTitle>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={cn("h-4 w-4", s <= selectedItem.rating ? "text-status-warning fill-current" : "text-border-strong")} />
                    ))}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-surface-active/50 rounded-lg p-4 text-text-primary whitespace-pre-wrap leading-relaxed">
                    {selectedItem.message}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions Footer */}
            <div className="p-4 border-t border-border-subtle bg-bg-surface flex justify-end gap-3">
              <Button
                variant={selectedItem.isHidden ? "secondary" : "destructive"}
                disabled={pendingFeedbackId === selectedItem.id}
                onClick={() => setConfirmAction({ feedbackId: selectedItem.id, nextHidden: !selectedItem.isHidden })}
              >
                {selectedItem.isHidden ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                {pendingFeedbackId === selectedItem.id ? "Updating..." : selectedItem.isHidden ? "Restore to Public" : "Hide Feedback"}
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-text-muted flex-col gap-3">
            <MessageSquare className="h-12 w-12 opacity-20" />
            <p>Select a feedback item from the list to view details</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(confirmAction && confirmItem)}
        title={confirmAction?.nextHidden ? "Hide feedback" : "Restore feedback"}
        description={
          confirmAction?.nextHidden
            ? "This will hide the feedback from public views while keeping it for moderation history."
            : "This will make the feedback visible to users again."
        }
        confirmLabel={confirmAction?.nextHidden ? "Hide" : "Restore"}
        confirmTone={confirmAction?.nextHidden ? "danger" : "primary"}
        busy={Boolean(pendingFeedbackId)}
        onCancel={() => setConfirmAction(null)}
        onConfirm={() => void onConfirmModeration()}
      />
    </div>
  );
}
