"use server";

import { revalidatePath } from "next/cache";
import * as studentService from "@/services/students";
import type { CreateStudentInput, UpdateStudentInput, StudentListDto, StudentDetailDto } from "../types";
import type { ActionResponse, PaginatedResponse } from "@/types";

export async function getStudentsAction(params: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<ActionResponse<PaginatedResponse<StudentListDto>>> {
  return studentService.getStudents(params);
}

export async function getStudentByIdAction(
  id: string,
): Promise<ActionResponse<StudentDetailDto | null>> {
  return studentService.getStudentById(id);
}

export async function createStudentAction(
  input: CreateStudentInput,
): Promise<ActionResponse<StudentDetailDto>> {
  const result = await studentService.createStudent(input);

  if (result.success) {
    revalidatePath("/dashboard/students");
  }

  return result;
}

export async function updateStudentAction(
  id: string,
  input: UpdateStudentInput,
): Promise<ActionResponse<StudentDetailDto>> {
  const result = await studentService.updateStudent(id, input);

  if (result.success) {
    revalidatePath("/dashboard/students");
  }

  return result;
}

export async function archiveStudentAction(
  id: string,
): Promise<ActionResponse<void>> {
  const result = await studentService.archiveStudent(id);

  if (result.success) {
    revalidatePath("/dashboard/students");
  }

  return result;
}
