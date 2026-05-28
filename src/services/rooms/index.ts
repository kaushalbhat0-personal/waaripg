import type { ActionResponse, PaginatedResponse } from "@/types";
import * as roomRepo from "@/repositories/rooms";
import * as bedRepo from "@/repositories/beds";
import * as allocationRepo from "@/repositories/allocations";
import {
  createRoomSchema,
  updateRoomSchema,
  createBedSchema,
  createAllocationSchema,
  transferAllocationSchema,
} from "@/features/rooms/schemas";
import type {
  CreateRoomInput,
  UpdateRoomInput,
  CreateBedInput,
  CreateAllocationInput,
  TransferAllocationInput,
  RoomWithBeds,
  RoomWithDetails,
  AllocationWithDetails,
} from "@/features/rooms/types";
import type { Room, Bed } from "@/types";

function toRoomWithBeds(room: Record<string, unknown>): RoomWithBeds {
  const beds = (room.beds as Record<string, unknown>[] | undefined) ?? [];
  return {
    ...(room as unknown as Room),
    beds: beds as Bed[],
  };
}

function _toRoomWithDetails(room: Record<string, unknown>): RoomWithDetails {
  const beds = (room.beds as Record<string, unknown>[] | undefined) ?? [];
  return {
    ...(room as unknown as Room),
    beds: beds.map((b) => {
      const allocation = b.allocation as Record<string, unknown> | undefined;
      return {
        ...(b as unknown as Bed),
        resident: allocation?.resident
          ? { id: (allocation.resident as Record<string, unknown>).id as string, name: (allocation.resident as Record<string, unknown>).name as string }
          : null,
      };
    }),
  };
}

export async function getRooms(
  params: roomRepo.FindAllRoomsParams = {},
): Promise<ActionResponse<PaginatedResponse<RoomWithBeds>>> {
  try {
    const { data, error, count } = await roomRepo.findAll(params);

    if (error) {
      return {
        success: false,
        error: { code: "DB_ERROR", message: error.message },
      };
    }

    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;

    const roomsWithOccupancy = await Promise.all(
      (data ?? []).map(async (room) => {
        const r = room as Record<string, unknown>;
        const occupancy = await allocationRepo.getOccupancyByRoomId(r.id as string);
        return {
          ...toRoomWithBeds(r),
          occupancy,
        };
      }),
    );

    return {
      success: true,
      data: {
        data: roomsWithOccupancy,
        total: count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch rooms",
      },
    };
  }
}

export async function getRoomById(
  id: string,
): Promise<ActionResponse<RoomWithDetails | null>> {
  try {
    const { data, error } = await roomRepo.findById(id);

    if (error) {
      return {
        success: false,
        error: { code: "DB_ERROR", message: error.message },
      };
    }

    if (!data) {
      return { success: true, data: null };
    }

    const room = data as Record<string, unknown>;

    const bedsData = await bedRepo.findByRoomId(id);
    const activeAllocations = await allocationRepo.findActiveByRoomId(id);

    const allocationMap = new Map<string, Record<string, unknown>>();
    for (const alloc of activeAllocations.data ?? []) {
      const a = alloc as Record<string, unknown>;
      allocationMap.set(a.bed_id as string, a);
    }

    const enhancedBeds = (bedsData.data ?? []).map((b) => {
      const bed = b as Record<string, unknown>;
      const alloc = allocationMap.get(bed.id as string);
      return {
        ...(bed as unknown as Bed),
        resident: alloc
          ? {
              id: ((alloc.resident as Record<string, unknown>).id ?? "") as string,
              name: ((alloc.resident as Record<string, unknown>).name ?? "") as string,
            }
          : null,
      };
    });

    const occupancy = await allocationRepo.getOccupancyByRoomId(id);

    return {
      success: true,
      data: {
        ...(room as unknown as Room),
        beds: enhancedBeds,
        occupancy,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch room",
      },
    };
  }
}

export async function createRoom(
  input: CreateRoomInput,
): Promise<ActionResponse<RoomWithBeds>> {
  const validated = createRoomSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: validated.error.flatten().fieldErrors as Record<string, string[]>,
      },
    };
  }

  try {
    const data = validated.data;
    const payload: Record<string, unknown> = {
      room_number: data.room_number,
      type: data.type,
      capacity: data.capacity,
      rent_amount: data.rent_amount,
      description: data.description ?? null,
      property_id: data.property_id ?? null,
      floor_id: data.floor_id ?? null,
      is_active: data.is_active ?? true,
    };

    const { data: room, error } = await roomRepo.create(payload);

    if (error || !room) {
      return {
        success: false,
        error: { code: "DB_ERROR", message: error?.message ?? "Failed to create room" },
      };
    }

    // Auto-create beds based on capacity
    const bedPayloads: Record<string, unknown>[] = [];
    for (let i = 1; i <= data.capacity; i++) {
      bedPayloads.push({
        room_id: (room as Record<string, unknown>).id,
        bed_number: `Bed ${i}`,
      });
    }

    if (bedPayloads.length > 0) {
      const { error: bedsError } = await bedRepo.bulkCreate(bedPayloads);
      if (bedsError) {
        return {
          success: false,
          error: { code: "DB_ERROR", message: bedsError.message },
        };
      }
    }

    const fullRoom = await roomRepo.findById((room as Record<string, unknown>).id as string);

    return {
      success: true,
      data: fullRoom.data ? toRoomWithBeds(fullRoom.data as Record<string, unknown>) : toRoomWithBeds(room as Record<string, unknown>),
      message: "Room created successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to create room",
      },
    };
  }
}

export async function updateRoom(
  id: string,
  input: UpdateRoomInput,
): Promise<ActionResponse<RoomWithBeds>> {
  const validated = updateRoomSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: validated.error.flatten().fieldErrors as Record<string, string[]>,
      },
    };
  }

  const existing = await roomRepo.findById(id);
  if (existing.error || !existing.data) {
    return {
      success: false,
      error: { code: "NOT_FOUND", message: "Room not found" },
    };
  }

  try {
    const data = validated.data;
    const payload: Record<string, unknown> = {};

    const fields: (keyof typeof data)[] = [
      "room_number", "type", "capacity", "rent_amount",
      "description", "property_id", "floor_id", "is_active",
    ];

    for (const field of fields) {
      if (field in data) {
        payload[field] = data[field] ?? null;
      }
    }

    const { data: room, error } = await roomRepo.update(id, payload);

    if (error || !room) {
      return {
        success: false,
        error: { code: "DB_ERROR", message: error?.message ?? "Failed to update room" },
      };
    }

    return {
      success: true,
      data: toRoomWithBeds(room as Record<string, unknown>),
      message: "Room updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to update room",
      },
    };
  }
}

export async function deleteRoom(id: string): Promise<ActionResponse<void>> {
  try {
    const { data: room } = await roomRepo.findById(id);

    if (!room) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Room not found" },
      };
    }

    // Check for active allocations
    const activeAllocations = await allocationRepo.findActiveByRoomId(id);
    if ((activeAllocations.data ?? []).length > 0) {
      return {
        success: false,
        error: {
          code: "HAS_ACTIVE_ALLOCATIONS",
          message: "Cannot delete room with active allocations. Archive residents first.",
        },
      };
    }

    const { error } = await roomRepo.softDelete(id);

    if (error) {
      return {
        success: false,
        error: { code: "DB_ERROR", message: error.message },
      };
    }

    return {
      success: true,
      data: undefined,
      message: "Room deleted successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to delete room",
      },
    };
  }
}

export async function getAvailableRooms(): Promise<ActionResponse<RoomWithBeds[]>> {
  try {
    const { data, error } = await roomRepo.findRoomsWithAvailability({});

    if (error) {
      return {
        success: false,
        error: { code: "DB_ERROR", message: error.message },
      };
    }

    const rooms = (data ?? []).filter((r) => {
      const room = r as Record<string, unknown>;
      const beds = (room.beds as Record<string, unknown>[] | undefined) ?? [];
      return beds.some((b) => b.status === "available");
    });

    return {
      success: true,
      data: rooms.map((r) => toRoomWithBeds(r as Record<string, unknown>)),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch available rooms",
      },
    };
  }
}

export async function createBed(input: CreateBedInput): Promise<ActionResponse<Bed>> {
  const validated = createBedSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: validated.error.flatten().fieldErrors as Record<string, string[]>,
      },
    };
  }

  try {
    const { data, error } = await bedRepo.create(validated.data as unknown as Record<string, unknown>);

    if (error) {
      return {
        success: false,
        error: { code: "DB_ERROR", message: error.message },
      };
    }

    return {
      success: true,
      data: data as Bed,
      message: "Bed created successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to create bed",
      },
    };
  }
}

export async function allocateResident(
  input: CreateAllocationInput,
): Promise<ActionResponse<AllocationWithDetails>> {
  const validated = createAllocationSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: validated.error.flatten().fieldErrors as Record<string, string[]>,
      },
    };
  }

  try {
    const data = validated.data;

    // Check if resident already has an active allocation
    const activeAlloc = await allocationRepo.findActiveByResidentId(data.resident_id);
    if (activeAlloc.data) {
      return {
        success: false,
        error: {
          code: "ALREADY_ALLOCATED",
          message: "Resident already has an active allocation",
        },
      };
    }

    // Check if bed is available
    const bedResult = await bedRepo.findById(data.bed_id);
    if (bedResult.error || !bedResult.data) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Bed not found" },
      };
    }

    const bed = bedResult.data as Record<string, unknown>;
    if (bed.status !== "available") {
      return {
        success: false,
        error: {
          code: "BED_NOT_AVAILABLE",
          message: `Bed is ${bed.status}, not available`,
        },
      };
    }

    // Check if bed already has an active allocation
    const bedAlloc = await allocationRepo.findActiveByBedId(data.bed_id);
    if (bedAlloc.data) {
      return {
        success: false,
        error: {
          code: "BED_OCCUPIED",
          message: "This bed already has an active allocation",
        },
      };
    }

    const checkInDate = data.check_in_date ?? new Date().toISOString().split("T")[0];

    const payload: Record<string, unknown> = {
      resident_id: data.resident_id,
      bed_id: data.bed_id,
      room_id: data.room_id,
      check_in_date: checkInDate,
      rent_amount: data.rent_amount ?? 0,
      security_deposit: data.security_deposit ?? 0,
      is_active: true,
      notes: data.notes ?? null,
    };

    const { data: allocation, error } = await allocationRepo.create(payload);

    if (error || !allocation) {
      return {
        success: false,
        error: { code: "DB_ERROR", message: error?.message ?? "Failed to create allocation" },
      };
    }

    // Update bed status to occupied
    await bedRepo.updateStatus(data.bed_id, "occupied");

    const fullAlloc = await allocationRepo.findById(
      (allocation as Record<string, unknown>).id as string,
    );

    return {
      success: true,
      data: (fullAlloc.data ?? (allocation as Record<string, unknown>)) as AllocationWithDetails,
      message: "Resident allocated successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to allocate resident",
      },
    };
  }
}

export async function transferResident(
  input: TransferAllocationInput,
): Promise<ActionResponse<AllocationWithDetails>> {
  const validated = transferAllocationSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: validated.error.flatten().fieldErrors as Record<string, string[]>,
      },
    };
  }

  try {
    const data = validated.data;

    // Get current active allocation on source bed
    const currentAlloc = await allocationRepo.findActiveByBedId(data.current_bed_id);
    if (!currentAlloc.data) {
      return {
        success: false,
        error: {
          code: "NO_ACTIVE_ALLOCATION",
          message: "No active allocation found on the current bed",
        },
      };
    }

    const alloc = currentAlloc.data as Record<string, unknown>;

    // Check if target bed is available
    const targetBed = await bedRepo.findById(data.new_bed_id);
    if (targetBed.error || !targetBed.data) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Target bed not found" },
      };
    }

    const targetBedRecord = targetBed.data as Record<string, unknown>;
    if (targetBedRecord.status !== "available") {
      return {
        success: false,
        error: {
          code: "BED_NOT_AVAILABLE",
          message: `Target bed is ${targetBedRecord.status}`,
        },
      };
    }

    // Check target bed has no active allocation
    const targetAlloc = await allocationRepo.findActiveByBedId(data.new_bed_id);
    if (targetAlloc.data) {
      return {
        success: false,
        error: {
          code: "BED_OCCUPIED",
          message: "Target bed already has an active allocation",
        },
      };
    }

    // Deactivate current allocation
    await allocationRepo.deactivateActiveAllocationsByBedId(data.current_bed_id);

    // Mark old bed as available
    await bedRepo.updateStatus(data.current_bed_id, "available");

    // Create new allocation linked to the old one
    const newPayload: Record<string, unknown> = {
      resident_id: alloc.resident_id,
      bed_id: data.new_bed_id,
      room_id: data.new_room_id,
      check_in_date: (alloc.check_in_date as string) ?? new Date().toISOString().split("T")[0],
      rent_amount: alloc.rent_amount ?? 0,
      security_deposit: alloc.security_deposit ?? 0,
      is_active: true,
      transferred_from_id: alloc.id,
      transferred_at: new Date().toISOString(),
      notes: data.reason ?? null,
    };

    const { data: newAllocation, error } = await allocationRepo.create(newPayload);

    if (error || !newAllocation) {
      return {
        success: false,
        error: { code: "DB_ERROR", message: error?.message ?? "Failed to create transfer" },
      };
    }

    // Mark new bed as occupied
    await bedRepo.updateStatus(data.new_bed_id, "occupied");

    const fullAlloc = await allocationRepo.findById(
      (newAllocation as Record<string, unknown>).id as string,
    );

    return {
      success: true,
      data: (fullAlloc.data ?? (newAllocation as Record<string, unknown>)) as AllocationWithDetails,
      message: "Resident transferred successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to transfer resident",
      },
    };
  }
}

export async function getRoomStats(): Promise<
  ActionResponse<{
    total: number;
    occupied: number;
    available: number;
    maintenance: number;
    occupancyRate: number;
  }>
> {
  try {
    const { data, error } = await roomRepo.findAll({ pageSize: 10000 });

    if (error) {
      return {
        success: false,
        error: { code: "DB_ERROR", message: error.message },
      };
    }

    const rooms = (data ?? []) as Record<string, unknown>[];
    let totalBeds = 0;
    let occupiedBeds = 0;
    let maintenanceBeds = 0;

    for (const room of rooms) {
      const beds = (room.beds as Record<string, unknown>[] | undefined) ?? [];
      totalBeds += beds.length;
      occupiedBeds += beds.filter((b) => b.status === "occupied").length;
      maintenanceBeds += beds.filter((b) => b.status === "maintenance").length;
    }

    const availableBeds = totalBeds - occupiedBeds - maintenanceBeds;

    return {
      success: true,
      data: {
        total: rooms.length,
        occupied: occupiedBeds,
        available: availableBeds,
        maintenance: maintenanceBeds,
        occupancyRate: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch room stats",
      },
    };
  }
}
