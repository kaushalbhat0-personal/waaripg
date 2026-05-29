"use client";

import { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/shared/page/page-header";
import { PageContainer } from "@/shared/page/page-container";
import { ResidentTable, ResidentFilters, ResidentFormDialog } from "@/features/residents/components";
import { getResidentsAction, createResidentAction, updateResidentAction, archiveResidentAction } from "@/features/residents/actions";
import type { ResidentListDto, CreateResidentInput, ResidentFilterParams } from "@/features/residents/types";
import type { PaginatedResponse } from "@/types";
import { toast } from "sonner";

export default function ResidentsPage() {
  const [data, setData] = useState<PaginatedResponse<ResidentListDto> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<(CreateResidentInput & { id?: string }) | null>(null);
  const fetchIdRef = useRef(0);

  useEffect(() => {
    const fetchId = ++fetchIdRef.current;
    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      const params: ResidentFilterParams = {
        search: search || undefined,
        type: (typeFilter || undefined) as "pg" | "hostel" | undefined,
        status: (statusFilter || undefined) as "active" | "inactive" | "terminated" | undefined,
        page,
        pageSize,
      };
      const result = await getResidentsAction(params);
      if (!cancelled && fetchId === fetchIdRef.current) {
        if (result.success) {
          setData(result.data);
        } else {
          toast.error(result.error.message);
        }
        setIsLoading(false);
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [search, typeFilter, statusFilter, page, pageSize]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleCreate() {
    setEditingResident(null);
    setDialogOpen(true);
  }

  function handleEdit(resident: ResidentListDto) {
    setEditingResident(resident as unknown as CreateResidentInput & { id?: string });
    setDialogOpen(true);
  }

  async function handleSubmit(data: CreateResidentInput) {
    if (editingResident?.id) {
      const result = await updateResidentAction(editingResident.id, data);
      if (result.success) {
        toast.success(result.message ?? "Resident updated");
      } else {
        toast.error(result.error.message);
        throw new Error(result.error.message);
      }
    } else {
      const result = await createResidentAction(data);
      if (result.success) {
        toast.success(result.message ?? "Resident created");
      } else {
        toast.error(result.error.message);
        throw new Error(result.error.message);
      }
    }
  }

  async function handleArchive(resident: ResidentListDto) {
    const confirmed = window.confirm(
      `Are you sure you want to archive ${resident.name}?`,
    );
    if (!confirmed) return;

    const result = await archiveResidentAction(resident.id);
    if (result.success) {
      toast.success(result.message ?? "Resident archived");
    } else {
      toast.error(result.error.message);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="PG Residents"
        description="Manage PG accommodation residents"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add PG Resident
          </Button>
        }
      />
      <ResidentFilters
        type={typeFilter}
        status={statusFilter}
        onTypeChange={(v) => {
          setTypeFilter(v === "all" ? "" : v);
          setPage(1);
        }}
        onStatusChange={(v) => {
          setStatusFilter(v === "all" ? "" : v);
          setPage(1);
        }}
      />
      <ResidentTable
        data={data?.data ?? []}
        isLoading={isLoading}
        search={search}
        onSearchChange={handleSearchChange}
        page={page}
        pageSize={pageSize}
        total={data?.total}
        totalPages={data?.totalPages}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        onEdit={handleEdit}
        onArchive={handleArchive}
      />
      <ResidentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        resident={editingResident}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
}
