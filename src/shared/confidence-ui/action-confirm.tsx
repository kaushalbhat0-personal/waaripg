"use client";

import { useState, useCallback } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";

type ConfirmActionProps = {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  onConfirm: () => Promise<void> | void;
  onCancel?: () => void;
};

export function useConfirmAction() {
  const [state, setState] = useState<{
    open: boolean;
    config: ConfirmActionProps | null;
    loading: boolean;
  }>({ open: false, config: null, loading: false });

  const confirm = useCallback((config: ConfirmActionProps) => {
    setState({ open: true, config, loading: false });
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!state.config) return;
    setState((s) => ({ ...s, loading: true }));
    try {
      await state.config.onConfirm();
    } finally {
      setState({ open: false, config: null, loading: false });
    }
  }, [state.config]);

  const handleCancel = useCallback(() => {
    state.config?.onCancel?.();
    setState({ open: false, config: null, loading: false });
  }, [state.config]);

  const ConfirmDialog = state.config ? (
    <Dialog open={state.open} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            {state.config.variant === "destructive" && (
              <AlertTriangle className="h-5 w-5 text-destructive" />
            )}
            <DialogTitle>{state.config.title}</DialogTitle>
          </div>
          <DialogDescription>{state.config.description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={state.loading}>
            {state.config.cancelLabel ?? "Cancel"}
          </Button>
          <Button
            variant={state.config.variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={state.loading}
          >
            {state.loading && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            {state.config.confirmLabel ?? "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ) : null;

  return { confirm, ConfirmDialog };
}
