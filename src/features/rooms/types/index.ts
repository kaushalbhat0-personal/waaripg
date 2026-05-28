import type { Room, Bed, Allocation, Resident } from "@/types";

export type RoomWithBeds = Room & {
  beds: Bed[];
  occupancy?: RoomOccupancy;
};

export type RoomWithDetails = Room & {
  beds: (Bed & { resident?: { id: string; name: string } | null })[];
  occupancy?: RoomOccupancy;
  property?: { id: string; name: string } | null;
  floor?: { id: string; name: string; floor_number: number } | null;
};

export type RoomOccupancy = {
  total: number;
  available: number;
  occupied: number;
  reserved: number;
  maintenance: number;
  percentage: number;
};

export type BedWithDetails = Bed & {
  room?: { id: string; room_number: string } | null;
  allocation?: { id: string; resident: { id: string; name: string } } | null;
};

export type AllocationWithDetails = Allocation & {
  resident: Pick<Resident, "id" | "name" | "phone" | "type">;
  bed: Pick<Bed, "id" | "bed_number"> & { room: Pick<Room, "id" | "room_number"> };
  transferred_from?: { id: string } | null;
};

export type CreateRoomInput = {
  room_number: string;
  type: "single" | "double" | "triple" | "dormitory";
  capacity: number;
  rent_amount: number;
  description?: string | null;
  property_id?: string | null;
  floor_id?: string | null;
  is_active?: boolean;
};

export type UpdateRoomInput = Partial<CreateRoomInput>;

export type CreateBedInput = {
  room_id: string;
  bed_number: string;
};

export type CreateAllocationInput = {
  resident_id: string;
  bed_id: string;
  room_id: string;
  check_in_date?: string;
  rent_amount?: number;
  security_deposit?: number;
  notes?: string | null;
};

export type TransferAllocationInput = {
  current_bed_id: string;
  new_bed_id: string;
  new_room_id: string;
  reason?: string | null;
};

export type RoomFilterParams = {
  search?: string;
  type?: string;
  status?: string;
  property_id?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: "asc" | "desc";
};
