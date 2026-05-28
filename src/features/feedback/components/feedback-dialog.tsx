"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bug, Lightbulb, Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { reportIssue, submitSuggestion } from "../actions";
import { trackEvent } from "@/lib/tracking";

type FeedbackDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function FeedbackDialog({ open, onClose }: FeedbackDialogProps) {
  const [mode, setMode] = useState<"choose" | "issue" | "suggestion">("choose");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setSending(true);

    if (mode === "issue") {
      await reportIssue("general", message);
      trackEvent("feedback_submitted", { type: "issue" });
    } else {
      await submitSuggestion(message);
      trackEvent("feedback_submitted", { type: "suggestion" });
    }

    setSending(false);
    setDone(true);
  };

  const handleClose = () => {
    setMode("choose");
    setMessage("");
    setDone(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full max-w-sm mx-4"
          >
            <Card className="p-4 shadow-2xl">
              {done ? (
                <div className="text-center py-6 space-y-3">
                  <div className="flex justify-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600">
                      <Send className="h-6 w-6" />
                    </div>
                  </div>
                  <p className="font-medium">Thank you!</p>
                  <p className="text-sm text-muted-foreground">Your feedback helps us improve.</p>
                  <Button variant="outline" size="sm" onClick={handleClose}>
                    Close
                  </Button>
                </div>
              ) : mode === "choose" ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Send Feedback</h3>
                    <button onClick={handleClose}>
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMode("issue")}
                      className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                    >
                      <Bug className="h-6 w-6 text-orange-500" />
                      <span className="text-xs font-medium">Report Issue</span>
                      <span className="text-[10px] text-muted-foreground text-center">
                        Something not working right
                      </span>
                    </button>
                    <button
                      onClick={() => setMode("suggestion")}
                      className="flex flex-col items-center gap-2 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                    >
                      <Lightbulb className="h-6 w-6 text-blue-500" />
                      <span className="text-xs font-medium">Suggestion</span>
                      <span className="text-[10px] text-muted-foreground text-center">
                        Idea for improvement
                      </span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {mode === "issue" ? (
                        <Bug className="h-4 w-4 text-orange-500" />
                      ) : (
                        <Lightbulb className="h-4 w-4 text-blue-500" />
                      )}
                      <h3 className="font-medium text-sm">
                        {mode === "issue" ? "Report Issue" : "Submit Suggestion"}
                      </h3>
                    </div>
                    <button onClick={() => setMode("choose")}>
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  <Textarea
                    placeholder={
                      mode === "issue"
                        ? "Describe what went wrong..."
                        : "Share your idea for improvement..."
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleSubmit}
                      disabled={sending || !message.trim()}
                    >
                      {sending ? "Sending..." : "Send"}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setMode("choose")}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
