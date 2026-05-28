"use server";

import { revalidatePath } from "next/cache";
import * as gateLogService from "@/services/gate-logs";
import {
  checkInSchema,
  checkOutSchema,
  manualOverrideSchema,
  resolveViolationSchema,
  verifyGateLogSchema,
  createCurfewRuleSchema,
  gateLogFilterSchema,
  attendanceFilterSchema,
  violationFilterSchema,
} from "@/features/gate-logs/schemas";
import type {
  CheckInInput,
  CheckOutInput,
  ManualOverrideInput,
  ResolveViolationInput,
  VerifyGateLogInput,
  CreateCurfewRuleInput,
  GateLogFilterParams,
  AttendanceFilterParams,
  ViolationFilterParams,
} from "@/features/gate-logs/schemas";
import type {
  GateLogWithResident,
  GateDashboard,
  ResidentPresence,
  AttendanceWithResident,
  ViolationWithResident,
  CurfewRule,
} from "@/features/gate-logs/types";
import type { ActionResponse, PaginatedResponse } from "@/types";

const VALIDATION_ERROR = (details: Record<string, string[]>) =>
  ({ success: false, error: { code: "VALIDATION_ERROR", message: "Invalid input", details } }) as ActionResponse<never>;

export async function checkInResidentAction(
  input: CheckInInput,
): Promise<ActionResponse<GateLogWithResident>> {
  const parsed = checkInSchema.safeParse(input);
  if (!parsed.success) return VALIDATION_ERROR(parsed.error.flatten().fieldErrors as Record<string, string[]>);
  const result = await gateLogService.checkInResident(parsed.data);
  if (result.success) revalidatePath("/dashboard/gate-logs");
  return result;
}

export async function checkOutResidentAction(
  input: CheckOutInput,
): Promise<ActionResponse<GateLogWithResident>> {
  const parsed = checkOutSchema.safeParse(input);
  if (!parsed.success) return VALIDATION_ERROR(parsed.error.flatten().fieldErrors as Record<string, string[]>);
  const result = await gateLogService.checkOutResident(parsed.data);
  if (result.success) revalidatePath("/dashboard/gate-logs");
  return result;
}

export async function overrideGateLogAction(
  input: ManualOverrideInput,
): Promise<ActionResponse<void>> {
  const parsed = manualOverrideSchema.safeParse(input);
  if (!parsed.success) return VALIDATION_ERROR(parsed.error.flatten().fieldErrors as Record<string, string[]>);
  const result = await gateLogService.overrideGateLog(parsed.data);
  if (result.success) revalidatePath("/dashboard/gate-logs");
  return result;
}

export async function resolveViolationAction(
  input: ResolveViolationInput,
): Promise<ActionResponse<void>> {
  const parsed = resolveViolationSchema.safeParse(input);
  if (!parsed.success) return VALIDATION_ERROR(parsed.error.flatten().fieldErrors as Record<string, string[]>);
  const result = await gateLogService.resolveViolation(parsed.data);
  if (result.success) revalidatePath("/dashboard/gate-logs");
  return result;
}

export async function verifyGateLogAction(
  input: VerifyGateLogInput,
): Promise<ActionResponse<void>> {
  const parsed = verifyGateLogSchema.safeParse(input);
  if (!parsed.success) return VALIDATION_ERROR(parsed.error.flatten().fieldErrors as Record<string, string[]>);
  const result = await gateLogService.verifyGateLog(parsed.data);
  if (result.success) revalidatePath("/dashboard/gate-logs");
  return result;
}

export async function getGateDashboardAction(): Promise<
  ActionResponse<GateDashboard>
> {
  return gateLogService.getGateDashboard();
}

export async function getGateLogsAction(
  params: GateLogFilterParams = {},
): Promise<ActionResponse<PaginatedResponse<GateLogWithResident>>> {
  const parsed = gateLogFilterSchema.safeParse(params);
  if (!parsed.success) return VALIDATION_ERROR(parsed.error.flatten().fieldErrors as Record<string, string[]>);
  return gateLogService.getGateLogs(parsed.data);
}

export async function getResidentPresenceAction(): Promise<
  ActionResponse<ResidentPresence[]>
> {
  return gateLogService.getResidentPresenceList();
}

export async function getAttendanceAction(
  params: AttendanceFilterParams = {},
): Promise<ActionResponse<PaginatedResponse<AttendanceWithResident>>> {
  const parsed = attendanceFilterSchema.safeParse(params);
  if (!parsed.success) return VALIDATION_ERROR(parsed.error.flatten().fieldErrors as Record<string, string[]>);
  return gateLogService.getAttendance(parsed.data);
}

export async function getViolationsAction(
  params: ViolationFilterParams = {},
): Promise<ActionResponse<PaginatedResponse<ViolationWithResident>>> {
  const parsed = violationFilterSchema.safeParse(params);
  if (!parsed.success) return VALIDATION_ERROR(parsed.error.flatten().fieldErrors as Record<string, string[]>);
  return gateLogService.getViolations(parsed.data);
}

export async function getCurfewRulesAction(): Promise<
  ActionResponse<CurfewRule[]>
> {
  return gateLogService.getCurfewRules();
}

export async function createCurfewRuleAction(
  input: CreateCurfewRuleInput,
): Promise<ActionResponse<CurfewRule>> {
  const parsed = createCurfewRuleSchema.safeParse(input);
  if (!parsed.success) return VALIDATION_ERROR(parsed.error.flatten().fieldErrors as Record<string, string[]>);
  const result = await gateLogService.createCurfewRuleAction(parsed.data);
  if (result.success) revalidatePath("/dashboard/gate-logs");
  return result;
}

export async function getTodaySummaryAction(): Promise<
  ActionResponse<{
    entries_today: number;
    exits_today: number;
    late_today: number;
    attendance: { present: number; absent: number; late: number; total: number };
  }>
> {
  return gateLogService.getTodaySummary();
}
