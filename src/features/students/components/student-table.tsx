"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable, type Column } from "@/shared/tables";
import { formatDate, formatPhone } from "@/lib/formatters";
import type { StudentListDto } from "../types";
import { Phone, Mail, Building2, MoreHorizontal, Users } from "lucide-react";
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

type StudentTableProps = {
  data: StudentListDto[];
  isLoading?: boolean;
  search?: string;
  onSearchChange?: (value: string) => void;
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onEdit?: (student: StudentListDto) => void;
  onArchive?: (student: StudentListDto) => void;
  onView?: (student: StudentListDto) => void;
  toolbarActions?: React.ReactNode;
};

export function StudentTable({
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
}: StudentTableProps) {
  const columns: Column<StudentListDto>[] = [
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
      id: "status",
      header: "Status",
      cell: (row) => (
        <Badge variant={statusVariant[row.status] ?? "secondary"}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
    {
      id: "institution",
      header: "Institution",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.institution_name ? (
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3 shrink-0" />
              {row.institution_name}
            </span>
          ) : (
            "—"
          )}
        </span>
      ),
    },
    {
      id: "course",
      header: "Course",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.course ?? "—"}
        </span>
      ),
    },
    {
      id: "guardian",
      header: "Guardian",
      cell: (row) => (
        <div className="text-sm text-muted-foreground">
          {row.guardian_name ? (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 shrink-0" />
              {row.guardian_name}
              {row.guardian_phone && (
                <span className="text-xs">({formatPhone(row.guardian_phone)})</span>
              )}
            </span>
          ) : (
            "—"
          )}
        </div>
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
      emptyTitle="No students found"
      emptyMessage={
        search
          ? "No students match your search criteria."
          : "Add your first student to get started."
      }
    />
  );
}
