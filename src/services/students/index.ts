import type { ActionResponse, QueryOptions, PaginatedResponse } from "@/types";

export async function getStudents(
  options?: QueryOptions,
): Promise<ActionResponse<PaginatedResponse<Record<string, unknown>>>> {
  return {
    success: true,
    data: {
      data: [],
      total: 0,
      page: options?.pagination?.page ?? 1,
      pageSize: options?.pagination?.pageSize ?? 10,
      totalPages: 0,
    },
  };
}

export async function getStudentById(
  _id: string,
): Promise<ActionResponse<Record<string, unknown> | null>> {
  return {
    success: true,
    data: null,
  };
}

export async function createStudent(
  _data: Record<string, unknown>,
): Promise<ActionResponse<Record<string, unknown>>> {
  throw new Error("Not implemented");
}

export async function updateStudent(
  _id: string,
  _data: Record<string, unknown>,
): Promise<ActionResponse<Record<string, unknown>>> {
  throw new Error("Not implemented");
}

export async function deleteStudent(
  _id: string,
): Promise<ActionResponse<void>> {
  throw new Error("Not implemented");
}
