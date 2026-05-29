"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type StudentFiltersProps = {
  status: string;
  onStatusChange: (value: string) => void;
  className?: string;
};

export function StudentFilters({
  status,
  onStatusChange,
  className,
}: StudentFiltersProps) {
  return (
    <div className={cn("flex flex-wrap items-end gap-4", className)}>
      <div className="space-y-1">
        <Label className="text-xs">Status</Label>
        <Select
          value={status || null}
          onValueChange={(value) => onStatusChange(value ?? "")}
        >
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="terminated">Terminated</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
