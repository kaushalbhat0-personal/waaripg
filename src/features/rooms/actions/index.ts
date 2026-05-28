"use server";

import { revalidatePath } from "next/cache";
import * as roomService from "@/services/rooms";
import type {
  CreateRoomInput,
  UpdateRoomInput,
  CreateBedInput,
  CreateAllocationInput,
  TransferAllocationInput,
  RoomFilterParams,
  RoomWithBeds,
  RoomWithDetails,
  AllocationWithDetails,
} from "../types";
import type { ActionResponse, PaginatedResponse } from "@/types";
import type { Bed } from "@/types";

export async function getRoomsAction(
  params: RoomFilterParams,
): Promise<ActionResponse<PaginatedResponse<RoomWithBeds & { occupancy?: Record<string, unknown> }>>> {
  return roomService.getRooms({
    search: params.search,
    type: params.type || undefined,
    property_id: params.property_id || undefined,
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    sort: params.sort,
    order: params.order,
  }) as Promise<ActionResponse<PaginatedResponse<RoomWithBeds & { occupancy?: Record<string, unknown> }>>>;
}

export async function getRoomByIdAction(
  id: string,
): Promise<ActionResponse<RoomWithDetails | null>> {
  return roomService.getRoomById(id);
}

export async function createRoomAction(
  input: CreateRoomInput,
): Promise<ActionResponse<RoomWithBeds>> {
  const result = await roomService.createRoom(input);

  if (result.success) {
    revalidatePath("/dashboard/rooms");
  }

  return result;
}

export async function updateRoomAction(
  id: string,
  input: UpdateRoomInput,
): Promise<ActionResponse<RoomWithBeds>> {
  const result = await roomService.updateRoom(id, input);

  if (result.success) {
    revalidatePath("/dashboard/rooms");
  }

  return result;
}

export async function deleteRoomAction(
  id: string,
): Promise<ActionResponse<void>> {
  const result = await roomService.deleteRoom(id);

  if (result.success) {
    revalidatePath("/dashboard/rooms");
  }

  return result;
}

export async function createBedAction(
  input: CreateBedInput,
): Promise<ActionResponse<Bed>> {
  const result = await roomService.createBed(input);

  if (result.success) {
    revalidatePath("/dashboard/rooms");
  }

  return result;
}

export async function allocateResidentAction(
  input: CreateAllocationInput,
): Promise<ActionResponse<AllocationWithDetails>> {
  const result = await roomService.allocateResident(input);

  if (result.success) {
    revalidatePath("/dashboard/rooms");
  }

  return result;
}

export async function transferResidentAction(
  input: TransferAllocationInput,
): Promise<ActionResponse<AllocationWithDetails>> {
  const result = await roomService.transferResident(input);

  if (result.success) {
    revalidatePath("/dashboard/rooms");
  }

  return result;
}

export async function getRoomStatsAction(): Promise<
  ActionResponse<{
    total: number;
    occupied: number;
    available: number;
    maintenance: number;
    occupancyRate: number;
  }>
> {
  return roomService.getRoomStats();
}
