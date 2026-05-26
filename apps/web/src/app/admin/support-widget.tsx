"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, CheckCircle2, Clock, MessageSquare, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

export function SupportWidget() {
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["admin-support-urgent-tickets"],
    queryFn: async () => {
      const res = await fetch("/api/admin/user/support/tickets?limit=5");
      if (!res.ok) throw new Error("Failed to fetch urgent tickets");
      const json = await res.json();
      // For now, filter on client side if backend doesn't support ?status=OPEN
      return (json.data as any[]).filter(t => t.status === "OPEN" || t.status === "IN_PROGRESS").slice(0, 5);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/admin/user/support/tickets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update ticket");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-support-urgent-tickets"] });
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
    },
  });

  return (
    <Card className="flex flex-col h-full shadow-sm">
      <CardHeader className="pb-3 border-b border-border-subtle shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-brand-primary" />
              Active Support
            </CardTitle>
            <CardDescription className="mt-1">
              Tickets requiring your attention
            </CardDescription>
          </div>
          <Link href="/admin/support">
            <Button variant="ghost" size="sm" className="text-brand-primary hover:bg-brand-primary/10 gap-1.5 h-8">
              View All <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-8 text-text-muted">
            <div className="animate-spin h-6 w-6 border-2 border-brand-primary border-t-transparent rounded-full" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-text-muted text-center gap-3 bg-bg-surface/30">
            <div className="h-12 w-12 rounded-full bg-surface-active flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="font-medium text-text-primary">Inbox Zero</p>
              <p className="text-xs mt-0.5">No open tickets at the moment.</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto divide-y divide-border-subtle">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="p-4 hover:bg-surface-hover transition-colors flex items-center justify-between group">
                <Link href={`/admin/support?id=${ticket.id}`} className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-text-primary line-clamp-1 group-hover:text-brand-primary transition-colors">
                      {ticket.subject}
                    </span>
                    {ticket.priority === "URGENT" && (
                      <Badge variant="destructive" className="h-4 text-[9px] px-1.5 font-bold uppercase shrink-0">
                        Urgent
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {timeAgo(ticket.updatedAt)}
                    </span>
                    <span>User: {ticket.userId.slice(0, 8)}</span>
                  </div>
                </Link>
                
                <select
                  value={ticket.status}
                  onChange={(e) => updateMutation.mutate({ id: ticket.id, status: e.target.value })}
                  className="h-7 text-xs border border-border-subtle bg-bg-base rounded-md px-2 focus:outline-none focus:border-brand-primary"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="WAITING">Waiting</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
