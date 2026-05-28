"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type RoomFiltersProps = {
  type: string;
  status: string;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  className?: string;
};

export function RoomFilters({
  type,
  status,
  onTypeChange,
  onStatusChange,
  className,
}: RoomFiltersProps) {
  return (
    <div className={cn("flex flex-wrap items-end gap-4", className)}>
      <div className="space-y-1">
        <Label className="text-xs">Room Type</Label>
        <Select value={type || null} onValueChange={(value) => onTypeChange(value ?? "")}>
          <SelectTrigger className="h-8 w-36">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="single">Single</SelectItem>
            <SelectItem value="double">Double</SelectItem>
            <SelectItem value="triple">Triple</SelectItem>
            <SelectItem value="dormitory">Dormitory</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Status</Label>
        <Select value={status || null} onValueChange={(value) => onStatusChange(value ?? "")}>
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
