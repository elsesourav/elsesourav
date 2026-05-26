import { Activity, UserPlus, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";

// This would normally be fetched from the API
const activities = [
  {
    id: 1,
    type: "user",
    title: "New user registered",
    description: "john.doe@example.com just signed up.",
    time: "2 minutes ago",
    icon: UserPlus,
    color: "text-brand-accent",
    bg: "bg-brand-accent/10",
  },
  {
    id: 2,
    type: "content",
    title: "Post published",
    description: "Admin published 'Q3 Marketing Strategy'.",
    time: "1 hour ago",
    icon: FileText,
    color: "text-status-success",
    bg: "bg-status-success-bg",
  },
  {
    id: 3,
    type: "system",
    title: "System check complete",
    description: "All services are running normally.",
    time: "3 hours ago",
    icon: CheckCircle2,
    color: "text-status-info",
    bg: "bg-status-info-bg",
  },
  {
    id: 4,
    type: "user",
    title: "Role updated",
    description: "sarah.smith@example.com promoted to Admin.",
    time: "5 hours ago",
    icon: Activity,
    color: "text-status-warning",
    bg: "bg-status-warning-bg",
  },
];

export function ActivityStream() {
  return (
    <div className="space-y-4">
      {activities.map((activity, index) => {
        const Icon = activity.icon;
        return (
          <div key={activity.id} className="relative flex gap-4">
            {index !== activities.length - 1 && (
              <div className="absolute left-4 top-8 bottom-[-16px] w-px bg-border-subtle" />
            )}
            <div className={cn("relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-bg-surface", activity.bg)}>
              <Icon className={cn("h-4 w-4", activity.color)} />
            </div>
            <div className="flex flex-col pb-2">
              <p className="text-sm font-medium text-text-primary">{activity.title}</p>
              <p className="text-xs text-text-muted">{activity.description}</p>
              <span className="mt-1 text-[10px] text-text-muted/70 font-medium uppercase tracking-wider">{activity.time}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
