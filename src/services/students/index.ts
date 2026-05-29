import * as residentService from "@/services/residents";
import type { ActionResponse, PaginatedResponse } from "@/types";
import type {
  ResidentListDto,
  ResidentDetailDto,
  CreateResidentInput,
  UpdateResidentInput,
} from "@/features/residents/types";

export async function getStudents(params: {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}): Promise<ActionResponse<PaginatedResponse<ResidentListDto>>> {
  return residentService.getResidents({
    ...params,
    type: "hostel",
  });
}

export async function getStudentById(
  id: string,
): Promise<ActionResponse<ResidentDetailDto | null>> {
  return residentService.getResidentById(id);
}

export async function createStudent(
  input: CreateResidentInput,
): Promise<ActionResponse<ResidentDetailDto>> {
  return residentService.createResident({ ...input, type: "hostel" });
}

export async function updateStudent(
  id: string,
  input: UpdateResidentInput,
): Promise<ActionResponse<ResidentDetailDto>> {
  return residentService.updateResident(id, input);
}

export async function archiveStudent(
  id: string,
): Promise<ActionResponse<void>> {
  return residentService.archiveResident(id);
}
