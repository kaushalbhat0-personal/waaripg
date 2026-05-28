import { z } from "zod";

export const createRoomSchema = z.object({
  room_number: z.string().min(1, "Room number is required").max(20),
  type: z.enum(["single", "double", "triple", "dormitory"]),
  capacity: z.coerce.number().int().positive("Capacity must be at least 1").max(50),
  rent_amount: z.coerce.number().min(0, "Rent must be a positive number"),
  description: z.string().max(500).optional().nullable(),
  property_id: z.string().uuid().optional().nullable(),
  floor_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

export const updateRoomSchema = createRoomSchema.partial();

export const createBedSchema = z.object({
  room_id: z.string().uuid("Invalid room"),
  bed_number: z.string().min(1, "Bed number is required").max(20),
});

export const createAllocationSchema = z.object({
  resident_id: z.string().uuid("Invalid resident"),
  bed_id: z.string().uuid("Invalid bed"),
  room_id: z.string().uuid("Invalid room"),
  check_in_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format").optional(),
  rent_amount: z.coerce.number().min(0).optional().default(0),
  security_deposit: z.coerce.number().min(0).optional().default(0),
  notes: z.string().max(500).optional().nullable(),
});

export const transferAllocationSchema = z.object({
  current_bed_id: z.string().uuid("Invalid current bed"),
  new_bed_id: z.string().uuid("Invalid new bed"),
  new_room_id: z.string().uuid("Invalid new room"),
  reason: z.string().max(500).optional().nullable(),
});

export const roomFilterSchema = z.object({
  search: z.string().max(200).optional(),
  type: z.enum(["single", "double", "triple", "dormitory"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  property_id: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export type CreateRoomSchema = z.infer<typeof createRoomSchema>;
export type UpdateRoomSchema = z.infer<typeof updateRoomSchema>;
export type CreateBedSchema = z.infer<typeof createBedSchema>;
export type CreateAllocationSchema = z.infer<typeof createAllocationSchema>;
export type TransferAllocationSchema = z.infer<typeof transferAllocationSchema>;
export type RoomFilterSchema = z.infer<typeof roomFilterSchema>;
