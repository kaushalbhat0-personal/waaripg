"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEvent } from "@/lib/tracking";

export type BulkAction = {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant?: "default" | "destructive";
  onAction: (selectedIds: string[]) => Promise<void>;
};

type BulkActionBarProps = {
  selectedIds: string[];
  actions: BulkAction[];
  onClear: () => void;
  label?: string;
};

export function BulkActionBar({ selectedIds, actions, onClear, label }: BulkActionBarProps) {
  const [loading, setLoading] = useState<string | null>(null);

  if (selectedIds.length === 0) return null;

  const handleAction = async (action: BulkAction) => {
    setLoading(action.id);
    try {
      await action.onAction(selectedIds);
      trackEvent("bulk_action", {
        action: action.id,
        count: selectedIds.length,
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full border bg-background px-3 py-2 shadow-lg"
    >
      <div className="flex items-center gap-1.5 mr-2">
        <CheckSquare className="h-4 w-4 text-primary" />
        <span className="text-xs font-medium">
          {selectedIds.length} {label ?? "selected"}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {actions.map((action) => (
          <Button
            key={action.id}
            variant={action.variant === "destructive" ? "destructive" : "ghost"}
            size="sm"
            onClick={() => handleAction(action)}
            disabled={loading === action.id}
            className="h-7 text-xs"
          >
            {action.icon}
            <span className="ml-1">{action.label}</span>
          </Button>
        ))}
      </div>
      <Button variant="ghost" size="sm" onClick={onClear} className="h-7 text-xs ml-1">
        Clear
      </Button>
    </motion.div>
  );
}
