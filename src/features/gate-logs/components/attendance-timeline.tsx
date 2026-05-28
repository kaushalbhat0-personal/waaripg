"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, Search } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import { useDebounce } from "@/hooks/use-debounce";
import type { AttendanceWithResident } from "../types";
import type { AttendanceFilterParams } from "../schemas";
import { ATTENDANCE_STATUSES } from "../types/constants";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  present: "default",
  absent: "destructive",
  late: "secondary",
  excused: "outline",
  unknown: "outline",
};

type AttendanceTimelineProps = {
  records: AttendanceWithResident[];
  total: number;
  page: number;
  pageSize: number;
  onFilterChange: (filters: AttendanceFilterParams) => void;
  onPageChange: (page: number) => void;
};

export function AttendanceTimeline({
  records,
  total,
  page,
  pageSize,
  onFilterChange,
  onPageChange,
}: AttendanceTimelineProps) {
  const totalPages = Math.ceil(total / pageSize);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState("");

  const debouncedDate = useDebounce(dateFilter, 300);

  useEffect(() => {
    onFilterChange({
      status: statusFilter || undefined,
      date: debouncedDate || undefined,
    });
  }, [debouncedDate, statusFilter, onFilterChange]);

  const handleStatusChange = (value: string | null) => setStatusFilter(value ?? "");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CalendarDays className="h-4 w-4" />
          Attendance Timeline
        </CardTitle>
        <CardDescription>
          {total} records — showing daily presence
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Filter by date (YYYY-MM-DD)..."
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="h-9 pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {ATTENDANCE_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          {records.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No attendance records found
            </p>
          ) : (
            records.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      record.status === "present"
                        ? "bg-emerald-500"
                        : record.status === "late"
                          ? "bg-amber-500"
                          : record.status === "absent"
                            ? "bg-red-500"
                            : "bg-gray-300"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {record.resident?.name ?? "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(record.snapshot_date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {record.is_late && (
                    <Badge variant="secondary" className="text-[9px]">
                      Late {record.late_minutes ? `+${record.late_minutes}m` : ""}
                    </Badge>
                  )}
                  <Badge
                    variant={statusColors[record.status] ?? "outline"}
                    className="text-[10px] capitalize"
                  >
                    {record.status}
                  </Badge>
                </div>
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
