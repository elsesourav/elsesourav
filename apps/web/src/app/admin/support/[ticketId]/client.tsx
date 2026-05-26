"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, MessageSquare, Paperclip, Send } from "lucide-react";
import { useState } from "react";
import type { SupportTicketSummary } from "../layout-client";

function timeAgo(dateInput: string | Date) {
  const date = new Date(dateInput);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return "just now";
}

function getInitials(id?: string | null, name?: string | null) {
  if (name && name.trim().length > 0) {
    const parts = name.trim().split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  if (id && id.length >= 2) {
    return id.slice(0, 2).toUpperCase();
  }
  return "US";
}

function getShortId(id?: string | null) {
  if (!id) return "Unknown";
  return id.slice(0, 8);
}

type SupportTicketMessage = {
  id: string;
  ticketId: string;
  senderId?: string;
  senderName?: string;
  senderEmail?: string;
  senderType?: "USER" | "ADMIN" | "SYSTEM";
  content?: string;
  attachments?: string[];
  isInternal?: boolean;
  createdAt: string;
  updatedAt: string;
};

export function SupportTicketDetailClient({ ticketId }: { ticketId: string }) {
  const queryClient = useQueryClient();
  const [reply, setReply] = useState("");
  const [isInternal, setIsInternal] = useState(false);

  const { data: ticketDetail, isLoading } = useQuery({
    queryKey: ["admin-support-ticket", ticketId],
    queryFn: async () => {
      const res = await fetch(`/api/admin/user/support/tickets/${ticketId}`);
      if (!res.ok) throw new Error("Failed to fetch ticket");
      const json = await res.json();
      return json.data as { ticket: SupportTicketSummary & { userEmail?: string; userName?: string }; messages: SupportTicketMessage[] };
    },
  });

  const { data: adminUsers = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      if (!res.ok) return [];
      const json = await res.json();
      const users = (json.data || []) as Array<{ id: string; email: string; role: string }>;
      return users.filter(u => u.role === "ADMIN");
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({ content, internal }: { content: string; internal: boolean }) => {
      const res = await fetch(`/api/admin/user/support/tickets/${ticketId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, attachments: [], isInternal: internal }),
      });
      if (!res.ok) throw new Error("Failed to post reply");
      return res.json();
    },
    onSuccess: () => {
      setReply("");
      queryClient.invalidateQueries({ queryKey: ["admin-support-ticket", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<SupportTicketSummary>) => {
      const res = await fetch(`/api/admin/user/support/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update ticket");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-support-ticket", ticketId] });
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="h-8 w-8 rounded-full border-2 border-brand-primary border-t-transparent animate-spin" />
          <p>Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (!ticketDetail || !ticketDetail.ticket) {
    return (
      <div className="flex-1 flex items-center justify-center text-text-muted flex-col gap-2">
        <MessageSquare className="w-8 h-8 opacity-20" />
        <p>Ticket not found or failed to load.</p>
      </div>
    );
  }

  const { ticket, messages = [] } = ticketDetail;

  return (
    <>
      {/* Header */}
      <div className="p-6 border-b border-border-subtle flex justify-between items-start bg-bg-base z-10 shrink-0 shadow-sm">
        <div className="min-w-0 pr-4 w-full">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="text-xs font-mono text-text-muted bg-surface-active px-1.5 py-0.5 rounded">
              #{getShortId(ticket.id)}
            </span>
            
            <select
              value={ticket.status || "OPEN"}
              onChange={(e) => updateMutation.mutate({ status: e.target.value as any })}
              disabled={updateMutation.isPending}
              className="h-7 text-xs font-semibold bg-bg-base border border-border-subtle rounded-md px-2 focus:outline-none focus:border-brand-primary cursor-pointer disabled:opacity-50"
            >
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="WAITING">WAITING</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>

            <select
              value={ticket.priority || "MEDIUM"}
              onChange={(e) => updateMutation.mutate({ priority: e.target.value as any })}
              disabled={updateMutation.isPending}
              className="h-7 text-xs font-semibold bg-bg-base border border-border-subtle rounded-md px-2 focus:outline-none focus:border-brand-primary cursor-pointer disabled:opacity-50"
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="URGENT">URGENT</option>
            </select>

            <select
              value={ticket.assignedToId || ""}
              onChange={(e) => updateMutation.mutate({ assignedToId: e.target.value || null })}
              disabled={updateMutation.isPending}
              className="h-7 text-xs font-medium bg-bg-base border border-border-subtle rounded-md px-2 focus:outline-none focus:border-brand-primary cursor-pointer disabled:opacity-50 min-w-[120px]"
            >
              <option value="">Unassigned</option>
              {adminUsers.map(admin => (
                <option key={admin.id} value={admin.id}>
                  {admin.email?.split("@")[0] || admin.id}
                </option>
              ))}
            </select>

            {ticket.appTitle && (
              <Badge variant="outline" className="font-normal text-text-muted">
                App: {ticket.appTitle}
              </Badge>
            )}
          </div>
          
          <h2 className="text-xl font-bold text-text-primary leading-tight mt-1">
            {ticket.subject || "No Subject"}
          </h2>
          
          <div className="flex items-center gap-3 text-sm text-text-muted mt-3">
            <span className="flex items-center gap-1.5 font-medium text-text-primary">
              <div className="h-6 w-6 rounded-full bg-surface-active flex items-center justify-center text-xs font-bold text-brand-primary">
                {getInitials(ticket.userId, ticket.userName)}
              </div>
              {ticket.userName || ticket.userEmail || `User ${getShortId(ticket.userId)}`}
            </span>
            <span className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              {ticket.createdAt ? `Opened ${timeAgo(ticket.createdAt)}` : 'Unknown date'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => updateMutation.mutate({ status: "RESOLVED" })}
              disabled={updateMutation.isPending}
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Resolve
            </Button>
          )}
        </div>
      </div>

      {/* Thread */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-surface-active/10 dark:bg-black/20">
        {/* Original Ticket Description */}
        <div className="flex gap-4 flex-row">
          <div className="h-8 w-8 shrink-0 rounded-full bg-surface-active flex items-center justify-center font-bold text-xs text-brand-primary">
            {getInitials(ticket.userId, ticket.userName)}
          </div>
          <div className="max-w-[85%] items-start">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-xs font-semibold text-text-primary">
                {ticket.userName || `User ${getShortId(ticket.userId)}`}
              </span>
              <span className="text-[10px] text-text-muted">
                {ticket.createdAt ? new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
            <div className="p-4 rounded-2xl text-sm leading-relaxed bg-bg-base border border-border-subtle text-text-primary rounded-tl-sm shadow-sm whitespace-pre-wrap">
              {ticket.description || "No description provided."}
            </div>
          </div>
        </div>

        {/* Replies */}
        {messages.map((msg) => {
          const isAdmin = msg.senderType === "ADMIN";
          const isSystem = msg.senderType === "SYSTEM";
          
          return (
            <div
              key={msg.id}
              className={cn(
                "flex gap-4",
                isAdmin ? "flex-row-reverse" : "flex-row",
              )}
            >
              <div className={cn(
                "h-8 w-8 shrink-0 rounded-full flex items-center justify-center font-bold text-xs",
                isAdmin ? "bg-brand-primary text-brand-primary-fg" : 
                isSystem ? "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300" : 
                "bg-surface-active text-brand-primary"
              )}>
                {isAdmin ? "AD" : isSystem ? "SYS" : getInitials(msg.senderId, msg.senderName)}
              </div>
              <div
                className={cn(
                  "max-w-[85%]",
                  isAdmin ? "items-end" : "items-start",
                )}
              >
                <div className={cn(
                  "flex items-baseline gap-2 mb-1",
                  isAdmin && "flex-row-reverse"
                )}>
                  <span className="text-xs font-semibold text-text-primary">
                    {isAdmin ? (msg.senderName || "Admin Support") : 
                     isSystem ? "System" : 
                     (msg.senderName || `User ${getShortId(msg.senderId)}`)}
                  </span>
                  <span className="text-[10px] text-text-muted">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                  {msg.isInternal && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-amber-500/30 text-amber-600">
                      Internal Note
                    </Badge>
                  )}
                </div>
                <div
                  className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
                    isAdmin
                      ? msg.isInternal 
                        ? "bg-amber-50/50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 border border-amber-200/50 dark:border-amber-900/50 rounded-tr-sm"
                        : "bg-brand-primary text-brand-primary-fg rounded-tr-sm"
                      : isSystem 
                        ? "bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-text-secondary rounded-tl-sm"
                        : "bg-bg-base border border-border-subtle text-text-primary rounded-tl-sm",
                  )}
                >
                  {msg.content || "No content."}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <div className="p-4 bg-bg-base border-t border-border-subtle shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className={cn(
          "border rounded-xl bg-bg-base overflow-hidden transition-all shadow-sm",
          isInternal 
            ? "border-amber-300 focus-within:ring-1 focus-within:ring-amber-400" 
            : "border-border-strong focus-within:border-brand-primary focus-within:ring-1 focus-within:ring-brand-primary"
        )}>
          <textarea
            placeholder={isInternal ? "Type an internal note (users won't see this)..." : "Type your reply to the user..."}
            className={cn(
              "w-full min-h-[100px] p-3 text-sm bg-transparent outline-none resize-none placeholder:text-text-muted",
              isInternal ? "text-amber-900 dark:text-amber-100" : "text-text-primary"
            )}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                if (reply.trim()) {
                  replyMutation.mutate({ content: reply, internal: isInternal });
                }
              }
            }}
          />
          <div className="flex items-center justify-between p-2 bg-surface-active/30 border-t border-border-subtle">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-text-muted hover:text-text-primary"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <span className="text-[11px] text-text-muted ml-2 hidden sm:inline-block">
                Press{" "}
                <kbd className="font-mono bg-bg-surface px-1.5 py-0.5 rounded border border-border-subtle">
                  ⌘ Enter
                </kbd>{" "}
                to send
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant={isInternal ? "secondary" : "outline"} 
                size="sm" 
                className="h-8 text-xs font-medium"
                onClick={() => setIsInternal(!isInternal)}
              >
                Internal Note
              </Button>
              <Button 
                variant={isInternal ? "secondary" : "default"}
                size="sm" 
                className={cn(
                  "h-8 text-xs gap-1.5 font-semibold",
                  isInternal ? "bg-amber-500 hover:bg-amber-600 text-white border-none" : ""
                )}
                onClick={() => replyMutation.mutate({ content: reply, internal: isInternal })}
                disabled={!reply.trim() || replyMutation.isPending}
              >
                <Send className="h-3.5 w-3.5" />
                {isInternal ? "Add Note" : "Send Reply"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
