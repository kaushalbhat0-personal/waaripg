import { z } from "zod";

export const checkInSchema = z.object({
  resident_id: z.string().uuid("Invalid resident ID"),
  method: z.enum(["manual", "qr", "rfid", "biometric", "face"]).default("manual"),
  notes: z.string().optional(),
});

export const checkOutSchema = z.object({
  resident_id: z.string().uuid("Invalid resident ID"),
  method: z.enum(["manual", "qr", "rfid", "biometric", "face"]).default("manual"),
  notes: z.string().optional(),
});

export const manualOverrideSchema = z.object({
  gate_log_id: z.string().uuid("Invalid gate log ID"),
  reason: z.string().min(1, "Override reason is required").max(500, "Reason too long"),
});

export const resolveViolationSchema = z.object({
  violation_id: z.string().uuid("Invalid violation ID"),
  notes: z.string().max(500, "Notes too long").optional(),
});

export const verifyGateLogSchema = z.object({
  gate_log_id: z.string().uuid("Invalid gate log ID"),
});

export const createCurfewRuleSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long"),
  resident_type: z.enum(["pg", "hostel", "all"]).optional(),
  room_type: z.string().optional(),
  property_id: z.string().uuid().optional(),
  curfew_time: z.string().regex(/^\d{2}:\d{2}$/, "Must be HH:MM format"),
  grace_period_minutes: z.number().int().min(0).max(120).default(30),
  applicable_days: z
    .array(z.number().int().min(1).max(7))
    .default([1, 2, 3, 4, 5, 6, 7]),
  penalty_amount: z.number().positive().optional(),
});

export const gateLogFilterSchema = z.object({
  resident_id: z.string().uuid().optional(),
  entry_type: z.string().optional(),
  is_late: z.boolean().optional(),
  date: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

export const attendanceFilterSchema = z.object({
  resident_id: z.string().uuid().optional(),
  date: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

export const violationFilterSchema = z.object({
  resident_id: z.string().uuid().optional(),
  violation_type: z.string().optional(),
  severity: z.string().optional(),
  resolved: z.boolean().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
});

export type CheckInInput = z.infer<typeof checkInSchema>;
export type CheckOutInput = z.infer<typeof checkOutSchema>;
export type ManualOverrideInput = z.infer<typeof manualOverrideSchema>;
export type ResolveViolationInput = z.infer<typeof resolveViolationSchema>;
export type VerifyGateLogInput = z.infer<typeof verifyGateLogSchema>;
export type CreateCurfewRuleInput = z.infer<typeof createCurfewRuleSchema>;
export type GateLogFilterParams = z.infer<typeof gateLogFilterSchema>;
export type AttendanceFilterParams = z.infer<typeof attendanceFilterSchema>;
export type ViolationFilterParams = z.infer<typeof violationFilterSchema>;
