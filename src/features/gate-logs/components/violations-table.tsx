"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Clock, AlertTriangle, CheckCircle2, Search } from "lucide-react";
import { formatDateTime } from "@/lib/formatters";
import { resolveViolationAction } from "@/features/gate-logs/actions";
import { useDebounce } from "@/hooks/use-debounce";
import type { ViolationWithResident } from "../types";
import type { ViolationFilterParams } from "../schemas";
import { VIOLATION_TYPES, VIOLATION_SEVERITIES } from "../types/constants";

const severityColors: Record<string, "destructive" | "default" | "secondary" | "outline"> = {
  critical: "destructive",
  high: "destructive",
  medium: "default",
  low: "secondary",
};

type ViolationsTableProps = {
  violations: ViolationWithResident[];
  total: number;
  page: number;
  pageSize: number;
  onFilterChange: (filters: ViolationFilterParams) => void;
  onPageChange: (page: number) => void;
};

export function ViolationsTable({
  violations,
  total,
  page,
  pageSize,
  onFilterChange,
  onPageChange,
}: ViolationsTableProps) {
  const totalPages = Math.ceil(total / pageSize);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [severityFilter, setSeverityFilter] = useState<string>("");
  const [resolvedFilter, setResolvedFilter] = useState<string>("");
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolveNotes, setResolveNotes] = useState("");
  const [resolveOpenId, setResolveOpenId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    onFilterChange({
      violation_type: typeFilter || undefined,
      severity: severityFilter || undefined,
      search: debouncedSearch || undefined,
      resolved: resolvedFilter === "" ? undefined : resolvedFilter === "true",
    });
  }, [debouncedSearch, typeFilter, severityFilter, resolvedFilter, onFilterChange]);

  const handleTypeChange = (value: string | null) => setTypeFilter(value ?? "");
  const handleSeverityChange = (value: string | null) => setSeverityFilter(value ?? "");
  const handleResolvedChange = (value: string | null) => setResolvedFilter(value ?? "");

  const handleResolve = async (violationId: string) => {
    setResolvingId(violationId);
    try {
      await resolveViolationAction({ violation_id: violationId, notes: resolveNotes || undefined });
      setResolveOpenId(null);
      setResolveNotes("");
      onPageChange(1);
    } finally {
      setResolvingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4" />
          Violations
        </CardTitle>
        <CardDescription>{total} recorded violations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search violations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 pl-9"
            />
          </div>
          <Select value={typeFilter} onValueChange={handleTypeChange}>
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {VIOLATION_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={severityFilter} onValueChange={handleSeverityChange}>
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              {VIOLATION_SEVERITIES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={resolvedFilter} onValueChange={handleResolvedChange}>
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="false">Unresolved</SelectItem>
              <SelectItem value="true">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          {violations.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No violations recorded
            </p>
          ) : (
            violations.map((v) => (
              <div
                key={v.id}
                className={`flex items-start justify-between gap-3 rounded-lg border p-3 ${v.resolved ? "opacity-60" : ""}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      variant={severityColors[v.severity] ?? "default"}
                      className="text-[9px] px-1.5"
                    >
                      {v.severity}
                    </Badge>
                    <span className="text-sm font-medium capitalize">
                      {v.violation_type.replace(/_/g, " ")}
                    </span>
                    {v.resolved ? (
                      <Badge variant="outline" className="text-[9px] text-emerald-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Resolved
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[9px]">
                        Open
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{v.description}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(v.detected_at)}
                    </span>
                    {v.resident && <span>{v.resident.name}</span>}
                    {v.resolved_at && (
                      <span>
                        Resolved {formatDateTime(v.resolved_at)}
                      </span>
                    )}
                  </div>
                </div>
                {!v.resolved && (
                    <Dialog open={resolveOpenId === v.id} onOpenChange={(open) => { setResolveOpenId(open ? v.id : null); if (!open) setResolveNotes(""); }}>
                    <DialogTrigger>
                      <Button size="sm" variant="outline" className="shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                        Resolve
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Resolve Violation</DialogTitle>
                        <DialogDescription>
                          Mark this violation as resolved. Add a note explaining the resolution.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="rounded-lg border p-3 text-sm">
                          <span className="font-medium capitalize">{v.violation_type.replace(/_/g, " ")}</span>
                          <p className="text-muted-foreground mt-1">{v.description}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-1 block">Resolution Notes</label>
                          <Textarea
                            placeholder="Add notes about this resolution..."
                            value={resolveNotes}
                            onChange={(e) => setResolveNotes(e.target.value)}
                            rows={3}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => { setResolveOpenId(null); setResolveNotes(""); }}>
                          Cancel
                        </Button>
                        <Button onClick={() => handleResolve(v.id)} disabled={resolvingId === v.id}>
                          {resolvingId === v.id ? "Resolving..." : "Confirm Resolution"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => onPageChange(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
