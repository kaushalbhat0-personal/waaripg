"use client";


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimelineCard } from "./timeline-card";
import { Clock } from "lucide-react";
import type { ActivityTimelineEvent, TimelineFilterParams } from "../types";

type ActivityTimelineProps = {
  events: ActivityTimelineEvent[];
  total: number;
  page: number;
  pageSize: number;
  onFilterChange: (filters: TimelineFilterParams) => void;
  onPageChange: (page: number) => void;
};

export function ActivityTimeline({
  events,
  total,
  page,
  pageSize,
  onFilterChange: _onFilterChange,
  onPageChange,
}: ActivityTimelineProps) {
  const totalPages = Math.ceil(total / pageSize);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          Activity Timeline
        </CardTitle>
        <CardDescription>Recent events across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {events.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No activity events found
            </p>
          ) : (
            events.map((event) => (
              <TimelineCard key={event.id} event={event} />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6">
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
