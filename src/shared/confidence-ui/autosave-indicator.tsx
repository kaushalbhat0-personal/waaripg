"use client";

import { useReducer, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, AlertCircle } from "lucide-react";

type AutosaveStatus = "idle" | "saving" | "saved" | "error";

type AutosaveIndicatorProps = {
  status: AutosaveStatus;
};

type State = {
  visible: boolean;
  currentStatus: AutosaveStatus;
};

type Action =
  | { type: "SHOW"; status: AutosaveStatus }
  | { type: "HIDE" };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SHOW":
      return { visible: true, currentStatus: action.status };
    case "HIDE":
      return { ...state, visible: false };
    default:
      return state;
  }
}

export function AutosaveIndicator({ status }: AutosaveIndicatorProps) {
  const [{ visible, currentStatus }, dispatch] = useReducer(reducer, {
    visible: false,
    currentStatus: "idle",
  });

  useEffect(() => {
    if (status === "idle") return;
    dispatch({ type: "SHOW", status });
    if (status === "saved" || status === "error") {
      const timer = setTimeout(() => dispatch({ type: "HIDE" }), 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="flex items-center gap-1.5 text-xs"
        >
          {currentStatus === "saving" && (
            <>
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
              <span className="text-muted-foreground">Saving...</span>
            </>
          )}
          {currentStatus === "saved" && (
            <>
              <Check className="h-3 w-3 text-green-500" />
              <span className="text-green-600">Saved</span>
            </>
          )}
          {currentStatus === "error" && (
            <>
              <AlertCircle className="h-3 w-3 text-red-500" />
              <span className="text-red-600">Save failed</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export type { AutosaveStatus };
