"use client";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { useQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Search } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";

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

export type SupportTicketSummary = {
  id: string;
  userId: string;
  appId: string | null;
  appTitle: string | null;
  appSlug: string | null;
  subject: string;
  description: string;
  status: "OPEN" | "IN_PROGRESS" | "WAITING" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category: string | null;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  messageCount: number | bigint;
};

export function PriorityBadge({ priority }: { priority: string }) {
  if (priority === "URGENT") return <Badge variant="destructive">Urgent</Badge>;
  if (priority === "HIGH") return <Badge variant="destructive">High</Badge>;
  if (priority === "MEDIUM") return <Badge variant="secondary">Medium</Badge>;
  return <Badge variant="outline">Low</Badge>;
}

export function StatusBadge({ status }: { status: string }) {
  if (status === "OPEN") return <Badge variant="default">Open</Badge>;
  if (status === "IN_PROGRESS") return <Badge variant="secondary">In Progress</Badge>;
  if (status === "WAITING") return <Badge variant="outline">Waiting</Badge>;
  if (status === "RESOLVED") return <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">Resolved</Badge>;
  return <Badge variant="outline">Closed</Badge>;
}

export function SupportLayoutClient({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const selectedId = params.ticketId as string | undefined;
  
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["admin-support-tickets"],
    queryFn: async () => {
      const res = await fetch("/api/admin/user/support/tickets?limit=100");
      if (!res.ok) throw new Error("Failed to fetch tickets");
      const json = await res.json();
      return json.data as SupportTicketSummary[];
    },
  });

  const filteredTickets = tickets.filter((t) => {
    if (tab === "OPEN" && (t.status === "CLOSED" || t.status === "RESOLVED")) return false;
    if (tab === "RESOLVED" && t.status !== "CLOSED" && t.status !== "RESOLVED") return false;
    if (search && !t.subject.toLowerCase().includes(search.toLowerCase()) && !t.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const parentRef = useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: filteredTickets.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 92,
    overscan: 10,
  });

  return (
    <div className="flex h-full border border-border-subtle rounded-xl overflow-hidden bg-bg-base shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
      {/* LEFT PANEL - INBOX */}
      <div className="w-[380px] flex flex-col border-r border-border-subtle bg-bg-surface shrink-0">
        <div className="p-4 border-b border-border-subtle space-y-3 sticky top-0 z-10 bg-bg-surface/95 backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-text-primary">Inbox</h2>
            <Badge variant="secondary">{filteredTickets.length} total</Badge>
          </div>
          
          <div className="flex gap-2 text-xs font-medium bg-bg-base p-1 rounded-lg">
            <button 
              onClick={() => setTab("ALL")}
              className={cn("px-3 py-1.5 rounded-md flex-1 transition-colors", tab === "ALL" ? "bg-surface-active text-text-primary shadow-sm" : "text-text-muted hover:text-text-primary")}
            >
              All
            </button>
            <button 
              onClick={() => setTab("OPEN")}
              className={cn("px-3 py-1.5 rounded-md flex-1 transition-colors", tab === "OPEN" ? "bg-surface-active text-text-primary shadow-sm" : "text-text-muted hover:text-text-primary")}
            >
              Open
            </button>
            <button 
              onClick={() => setTab("RESOLVED")}
              className={cn("px-3 py-1.5 rounded-md flex-1 transition-colors", tab === "RESOLVED" ? "bg-surface-active text-text-primary shadow-sm" : "text-text-muted hover:text-text-primary")}
            >
              Done
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-text-muted" />
            <Input 
              placeholder="Search tickets..." 
              className="pl-9 h-9 bg-bg-base" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div ref={parentRef} className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-sm text-text-muted">Loading tickets...</div>
          ) : filteredTickets.length === 0 ? (
            <div className="p-8 text-center text-sm text-text-muted">No tickets found.</div>
          ) : (
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const ticket = filteredTickets[virtualRow.index];
                const isSelected = selectedId === ticket.id;
                
                return (
                  <Link
                    key={virtualRow.key}
                    href={`/admin/support/${ticket.id}`}
                    data-index={virtualRow.index}
                    ref={rowVirtualizer.measureElement}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                    className={cn(
                      "block text-left p-4 border-b border-border-subtle hover:bg-surface-hover transition-colors flex flex-col gap-2 relative group",
                      isSelected && "bg-brand-primary/5 hover:bg-brand-primary/10 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-brand-primary",
                    )}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <span className={cn(
                        "font-medium text-sm line-clamp-1", 
                        isSelected ? "text-brand-primary font-semibold" : "text-text-primary"
                      )}>
                        {ticket.subject}
                      </span>
                      <span className="text-[10px] text-text-muted whitespace-nowrap shrink-0 mt-0.5">
                        {timeAgo(ticket.updatedAt)}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-1 pr-4">
                      {ticket.description}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={ticket.status} />
                        {ticket.priority === "HIGH" || ticket.priority === "URGENT" ? (
                          <PriorityBadge priority={ticket.priority} />
                        ) : null}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANEL - CONTENT */}
      <div className="flex-1 flex flex-col bg-bg-base relative overflow-hidden">
        {children}
      </div>
    </div>
  );
}
