"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/shared/tables";
import { formatDate, formatPhone } from "@/lib/formatters";
import type { ResidentListDto } from "../types";
import { Phone, Mail, Building2, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  inactive: "secondary",
  terminated: "destructive",
};

type ResidentTableProps = {
  data: ResidentListDto[];
  isLoading?: boolean;
  search?: string;
  onSearchChange?: (value: string) => void;
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onEdit?: (resident: ResidentListDto) => void;
  onArchive?: (resident: ResidentListDto) => void;
  onView?: (resident: ResidentListDto) => void;
  toolbarActions?: React.ReactNode;
};

export function ResidentTable({
  data,
  isLoading,
  search,
  onSearchChange,
  page,
  pageSize,
  total,
  totalPages,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onArchive,
  onView,
  toolbarActions,
}: ResidentTableProps) {
  const columns: Column<ResidentListDto>[] = [
    {
      id: "name",
      header: "Name",
      cell: (row) => (
        <div>
          <button
            onClick={() => onView?.(row)}
            className="font-medium hover:underline text-left"
          >
            {row.name}
          </button>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            {formatPhone(row.phone)}
            {row.email && (
              <>
                <Mail className="h-3 w-3" />
                {row.email}
              </>
            )}
          </div>
        </div>
      ),
      className: "min-w-[200px]",
    },
    {
      id: "type",
      header: "Type",
      cell: (row) => (
        <Badge variant={row.type === "hostel" ? "secondary" : "outline"}>
          {row.type === "hostel" ? "Hostel" : "PG"}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: (row) => (
        <Badge variant={statusVariant[row.status] ?? "secondary"}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
    {
      id: "occupation",
      header: "Occupation",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.occupation ?? (row.institution_name ? (
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              {row.institution_name}
            </span>
          ) : (
            "—"
          ))}
        </span>
      ),
    },
    {
      id: "city",
      header: "City",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.city ?? "—"}
        </span>
      ),
    },
    {
      id: "joining_date",
      header: "Joined",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.joining_date ? formatDate(row.joining_date) : "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="h-8 w-8"
            render={<Button variant="ghost" size="icon" />}
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Actions</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onView?.(row)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit?.(row)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onArchive?.(row)}
            >
              Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "w-[50px]",
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      search={search}
      onSearchChange={onSearchChange}
      searchPlaceholder="Search by name, phone, or email..."
      toolbarActions={toolbarActions}
      page={page}
      pageSize={pageSize}
      total={total}
      totalPages={totalPages}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      emptyTitle="No residents found"
      emptyMessage={
        search
          ? "No residents match your search criteria."
          : "Add your first resident to get started."
      }
    />
  );
}
