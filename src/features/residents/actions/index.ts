"use server";

import { revalidatePath } from "next/cache";
import * as residentService from "@/services/residents";
import type { CreateResidentInput, UpdateResidentInput, ResidentFilterParams } from "../types";
import type { ActionResponse, PaginatedResponse } from "@/types";
import type { ResidentDetailDto } from "../types";

export async function getResidentsAction(
  params: ResidentFilterParams,
): Promise<ActionResponse<PaginatedResponse<ResidentDetailDto>>> {
  return residentService.getResidents({
    search: params.search,
    type: params.type || undefined,
    status: params.status || undefined,
    gender: params.gender || undefined,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    sort: params.sort,
    order: params.order,
  });
}

export async function getResidentByIdAction(
  id: string,
): Promise<ActionResponse<ResidentDetailDto | null>> {
  return residentService.getResidentById(id);
}

export async function createResidentAction(
  input: CreateResidentInput,
): Promise<ActionResponse<ResidentDetailDto>> {
  const result = await residentService.createResident(input);

  if (result.success) {
    revalidatePath("/dashboard/residents");
  }

  return result;
}

export async function updateResidentAction(
  id: string,
  input: UpdateResidentInput,
): Promise<ActionResponse<ResidentDetailDto>> {
  const result = await residentService.updateResident(id, input);

  if (result.success) {
    revalidatePath("/dashboard/residents");
  }

  return result;
}

export async function archiveResidentAction(
  id: string,
): Promise<ActionResponse<void>> {
  const result = await residentService.archiveResident(id);

  if (result.success) {
    revalidatePath("/dashboard/residents");
  }

  return result;
}
