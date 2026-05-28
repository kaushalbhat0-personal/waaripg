"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Filter, Download } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/formatters";
import type { AuditLog, AuditFilterParams } from "../types";

const entityColors: Record<string, string> = {
  resident: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  room: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  payment: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  invoice: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  allocation: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
};

const actionColors: Record<string, string> = {
  created: "default",
  updated: "secondary",
  archived: "destructive",
  recorded: "default",
  refunded: "destructive",
  transferred: "secondary",
  cancelled: "destructive",
};

function getEntityColor(entityType: string): string {
  for (const [key, color] of Object.entries(entityColors)) {
    if (entityType.startsWith(key)) return color;
  }
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
}

function getActionVariant(action: string): "default" | "secondary" | "destructive" | "outline" {
  for (const [key, variant] of Object.entries(actionColors)) {
    if (action.includes(key)) return variant as "default" | "secondary" | "destructive" | "outline";
  }
  return "outline";
}

type AuditLogsTableProps = {
  logs: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
  onFilterChange: (filters: AuditFilterParams) => void;
  onPageChange: (page: number) => void;
};

export function AuditLogsTable({
  logs,
  total,
  page,
  pageSize,
  onFilterChange,
  onPageChange,
}: AuditLogsTableProps) {
  const [search, setSearch] = useState("");


  const totalPages = Math.ceil(total / pageSize);

  const handleSearch = (value: string) => {
    setSearch(value);
    onFilterChange({ search: value || undefined });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              Audit Logs
            </CardTitle>
            <CardDescription>{total} events recorded</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-9 w-48 pl-8 text-sm"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-3.5 w-3.5" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Entity ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                  No audit logs found
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="text-xs whitespace-nowrap">
                    {formatDate(log.created_at)}
                  </TableCell>
                  <TableCell className="text-sm">{log.actor_name ?? "System"}</TableCell>
                  <TableCell>
                    <Badge variant={getActionVariant(log.action)} className="text-[10px]">
                      {log.action.replace(".", " · ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${getEntityColor(log.entity_type)}`}>
                      {log.entity_type}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {log.entity_id.slice(0, 8)}...
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

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
