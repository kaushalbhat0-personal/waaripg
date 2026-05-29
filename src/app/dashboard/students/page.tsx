"use client";

import { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/shared/page/page-header";
import { PageContainer } from "@/shared/page/page-container";
import { StudentTable, StudentFilters, StudentFormDialog } from "@/features/students/components";
import { getStudentsAction, createStudentAction, updateStudentAction, archiveStudentAction } from "@/features/students/actions";
import type { StudentListDto, CreateStudentInput } from "@/features/students/types";
import type { PaginatedResponse } from "@/types";
import { toast } from "sonner";

export default function StudentsPage() {
  const [data, setData] = useState<PaginatedResponse<StudentListDto> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<(CreateStudentInput & { id?: string }) | null>(null);
  const fetchIdRef = useRef(0);

  useEffect(() => {
    const fetchId = ++fetchIdRef.current;
    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      const params = {
        search: search || undefined,
        status: (statusFilter || undefined) as "active" | "inactive" | "terminated" | undefined,
        page,
        pageSize,
      };
      const result = await getStudentsAction(params);
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
  }, [search, statusFilter, page, pageSize]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleCreate() {
    setEditingStudent(null);
    setDialogOpen(true);
  }

  function handleEdit(student: StudentListDto) {
    setEditingStudent(student as unknown as CreateStudentInput & { id?: string });
    setDialogOpen(true);
  }

  async function handleSubmit(data: CreateStudentInput) {
    if (editingStudent?.id) {
      const result = await updateStudentAction(editingStudent.id, data);
      if (result.success) {
        toast.success(result.message ?? "Student updated");
      } else {
        toast.error(result.error.message);
        throw new Error(result.error.message);
      }
    } else {
      const result = await createStudentAction({ ...data, type: "hostel" });
      if (result.success) {
        toast.success(result.message ?? "Student created");
      } else {
        toast.error(result.error.message);
        throw new Error(result.error.message);
      }
    }
  }

  async function handleArchive(student: StudentListDto) {
    const confirmed = window.confirm(
      `Are you sure you want to archive ${student.name}?`,
    );
    if (!confirmed) return;

    const result = await archiveStudentAction(student.id);
    if (result.success) {
      toast.success(result.message ?? "Student archived");
    } else {
      toast.error(result.error.message);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="Hostel Students"
        description="Manage hostel accommodation students"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        }
      />
      <StudentFilters
        status={statusFilter}
        onStatusChange={(v) => {
          setStatusFilter(v === "all" ? "" : v);
          setPage(1);
        }}
      />
      <StudentTable
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
      <StudentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        student={editingStudent}
        onSubmit={handleSubmit}
      />
    </PageContainer>
  );
}
