"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HelpArticleFeedbackWidget({ articleId }: { articleId: string }) {
  const [feedback, setFeedback] = useState<"helpful" | "not-helpful" | null>(null);

  const handleFeedback = async (isHelpful: boolean) => {
    setFeedback(isHelpful ? "helpful" : "not-helpful");
    try {
      let guestSessionId = localStorage.getItem("guest_session_id");
      if (!guestSessionId) {
        guestSessionId = crypto.randomUUID();
        localStorage.setItem("guest_session_id", guestSessionId);
      }

      await fetch(`/api/content/help/articles/${articleId}/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-guest-session": guestSessionId,
        },
        body: JSON.stringify({ isHelpful }),
      });
    } catch (error) {
      console.error("Failed to submit feedback", error);
    }
  };

  if (feedback) {
    return (
      <div className="rounded-xl border bg-surface-elevated/50 p-6 text-center">
        <p className="font-medium text-text-primary">Thanks for your feedback!</p>
        <p className="text-sm text-text-muted mt-1">This helps us improve our documentation.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between rounded-xl border bg-surface-elevated/50 p-6">
      <p className="font-medium text-text-primary mb-4 sm:mb-0">Was this article helpful?</p>
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => handleFeedback(true)}
        >
          <ThumbsUp className="h-4 w-4" />
          Yes
        </Button>
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={() => handleFeedback(false)}
        >
          <ThumbsDown className="h-4 w-4" />
          No
        </Button>
      </div>
    </div>
  );
}
