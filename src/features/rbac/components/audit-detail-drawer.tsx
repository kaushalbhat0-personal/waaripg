"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/formatters";
import type { AuditLog } from "../types";

type AuditDetailDrawerProps = {
  log: AuditLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AuditDetailDrawer({ log, open, onOpenChange }: AuditDetailDrawerProps) {
  if (!log) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px]">
              {log.action.replace(".", " · ")}
            </Badge>
          </SheetTitle>
          <SheetDescription>
            {formatDateTime(log.created_at)}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="rounded-lg border p-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Event Details
            </h4>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Actor</dt>
                <dd className="font-medium">{log.actor_name ?? "System"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Entity Type</dt>
                <dd className="font-medium">{log.entity_type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Entity ID</dt>
                <dd className="font-mono text-xs">{log.entity_id}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Timestamp</dt>
                <dd className="font-medium">{formatDateTime(log.created_at)}</dd>
              </div>
            </dl>
          </div>

          {log.before_state && (
            <div className="rounded-lg border p-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Before State
              </h4>
              <pre className="overflow-x-auto rounded bg-muted p-3 text-[10px] leading-relaxed">
                {JSON.stringify(log.before_state, null, 2)}
              </pre>
            </div>
          )}

          {log.after_state && (
            <div className="rounded-lg border p-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                After State
              </h4>
              <pre className="overflow-x-auto rounded bg-muted p-3 text-[10px] leading-relaxed">
                {JSON.stringify(log.after_state, null, 2)}
              </pre>
            </div>
          )}

          {log.metadata && (
            <div className="rounded-lg border p-4">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Metadata
              </h4>
              <pre className="overflow-x-auto rounded bg-muted p-3 text-[10px] leading-relaxed">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
