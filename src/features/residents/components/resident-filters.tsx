"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type ResidentFiltersProps = {
  type: string;
  status: string;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  className?: string;
};

export function ResidentFilters({
  type,
  status,
  onTypeChange,
  onStatusChange,
  className,
}: ResidentFiltersProps) {
  return (
    <div className={cn("flex flex-wrap items-end gap-4", className)}>
      <div className="space-y-1">
        <Label className="text-xs">Type</Label>
        <Select
          value={type || null}
          onValueChange={(value) => onTypeChange(value ?? "")}
        >
          <SelectTrigger className="h-8 w-32">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="pg">PG Resident</SelectItem>
            <SelectItem value="hostel">Hostel Student</SelectItem>
          </SelectContent>
        </Select>
      </div>
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
