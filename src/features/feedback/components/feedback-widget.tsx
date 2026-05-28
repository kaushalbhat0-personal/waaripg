"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageSquare, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { markHelpful, markNotHelpful, reportIssue } from "../actions";
import type { FeedbackCategory } from "../types";
import { trackEvent } from "@/lib/tracking";

type FeedbackWidgetProps = {
  category: FeedbackCategory;
  pageLabel?: string;
};

export function FeedbackWidget({ category, pageLabel }: FeedbackWidgetProps) {
  const [submitted, setSubmitted] = useState<"helpful" | "not-helpful" | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleHelpful = async () => {
    setSending(true);
    await markHelpful(category);
    trackEvent("feedback_submitted", { type: "helpful", category });
    setSubmitted("helpful");
    setSending(false);
  };

  const handleNotHelpful = async () => {
    if (message.trim()) {
      setSending(true);
      await markNotHelpful(category, message);
      trackEvent("feedback_submitted", { type: "not-helpful", category });
      setSubmitted("not-helpful");
      setSending(false);
      setShowForm(false);
    } else {
      setShowForm(true);
    }
  };

  const handleIssueReport = async () => {
    if (!message.trim()) return;
    setSending(true);
    await reportIssue(category, message);
    trackEvent("feedback_submitted", { type: "issue", category });
    setSubmitted("not-helpful");
    setSending(false);
    setShowForm(false);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Thanks for your feedback!</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {pageLabel ? `Was this ${pageLabel} helpful?` : "Was this helpful?"}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleHelpful}
            disabled={sending}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
            Yes
          </button>
          <button
            onClick={() => setShowForm(true)}
            disabled={sending}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
            No
          </button>
        </div>
      </div>

      {showForm && (
        <Card className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">How can we improve?</span>
            <button onClick={() => setShowForm(false)}>
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
          <Textarea
            placeholder="Tell us what went wrong or what you were looking for..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[60px] text-xs"
          />
          <div className="flex items-center gap-2">
            <Button size="sm" variant="default" onClick={handleNotHelpful} disabled={sending || !message.trim()}>
              <MessageSquare className="h-3.5 w-3.5 mr-1" />
              Send Feedback
            </Button>
            <Button size="sm" variant="outline" onClick={handleIssueReport} disabled={sending || !message.trim()}>
              Report Issue
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
