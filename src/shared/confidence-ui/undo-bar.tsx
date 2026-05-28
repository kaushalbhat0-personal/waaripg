"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Undo2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type UndoAction = {
  id: string;
  label: string;
  onUndo: () => void;
};

let undoListeners: Array<(action: UndoAction) => void> = [];

export function registerUndo(action: UndoAction) {
  undoListeners.forEach((fn) => fn(action));
}

type UndoBarProps = {
  timeout?: number;
};

export function UndoBar({ timeout = 5000 }: UndoBarProps) {
  const [action, setAction] = useState<UndoAction | null>(null);

  useEffect(() => {
    const listener = (a: UndoAction) => setAction(a);
    undoListeners.push(listener);
    return () => {
      undoListeners = undoListeners.filter((l) => l !== listener);
    };
  }, []);

  useEffect(() => {
    if (!action) return;
    const timer = setTimeout(() => setAction(null), timeout);
    return () => clearTimeout(timer);
  }, [action, timeout]);

  const handleUndo = useCallback(() => {
    action?.onUndo();
    setAction(null);
  }, [action]);

  if (!action) return null;

  return (
    <AnimatePresence>
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full bg-foreground text-background px-4 py-2 shadow-lg text-sm"
        >
          <span>{action.label}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            className="h-6 text-xs text-background hover:text-background/80 hover:bg-transparent"
          >
            <Undo2 className="h-3.5 w-3.5 mr-1" />
            Undo
          </Button>
          <button onClick={() => setAction(null)} className="text-background/60 hover:text-background">
            <X className="h-3.5 w-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
