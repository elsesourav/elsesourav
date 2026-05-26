import { MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminSupportEmptyState() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center text-center p-8 text-text-muted">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface-active mb-4">
        <MessageSquare className="h-8 w-8 opacity-50" />
      </div>
      <h3 className="text-lg font-semibold text-text-primary mb-1">
        Select a ticket
      </h3>
      <p className="text-sm max-w-[250px]">
        Choose a ticket from the inbox to view details, assign it, and reply to the user.
      </p>
    </div>
  );
}
