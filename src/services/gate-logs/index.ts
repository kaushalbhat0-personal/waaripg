import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/services/auth";
import { requirePermission, recordAudit } from "@/services/rbac";
import { getCurrentOrganizationId } from "@/lib/tenant";
import * as gateLogRepo from "@/repositories/gate-logs";
import * as curfewRepo from "@/repositories/gate-logs/curfew-rules";
import * as attendanceRepo from "@/repositories/gate-logs/attendance";
import * as violationsRepo from "@/repositories/gate-logs/violations";
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

// ============================================================
// VALIDATION WRAPPER
// ============================================================
function toActionResponse<T>(
  fn: () => Promise<T>,
): Promise<ActionResponse<T>> {
  return (async () => {
    try {
      const data = await fn();
      return { success: true, data } as ActionResponse<T>;
    } catch (error) {
      return {
        success: false,
        error: {
          code: "ERROR",
          message: error instanceof Error ? error.message : "Operation failed",
        },
      } as ActionResponse<T>;
    }
  })();
}

// ============================================================
// CHECK-IN WORKFLOW
// ============================================================

export async function checkInResident(
  input: CheckInInput,
): Promise<ActionResponse<GateLogWithResident>> {
  return toActionResponse(async () => {
    const user = await requireAuth();
    await requirePermission("gate-logs.create");

    const supabase = await createClient();
    const orgId = await getCurrentOrganizationId();

    const residentResult = await supabase
      .from("residents")
      .select("id, name, type, organization_id")
      .eq("id", input.resident_id)
      .maybeSingle() as unknown as Promise<{
      data: { id: string; name: string; type: string; organization_id: string | null } | null;
    }>;

    const residentData = (await residentResult).data;

    if (!residentData) {
      throw new Error("Resident not found");
    }

    if (orgId && residentData.organization_id !== orgId) {
      throw new Error("Unauthorized cross-tenant access");
    }

    const lastLog = await gateLogRepo.findActiveEntryForResident(
      input.resident_id,
      orgId,
    );
    if (lastLog.data?.entry_type === "entry") {
      throw new Error("Resident is already checked in");
    }

    const isLate = await evaluateCurfew(residentData.type, input.resident_id);

    const result = await gateLogRepo.createGateLog({
      organization_id: residentData.organization_id,
      resident_id: input.resident_id,
      entry_type: "entry",
      is_late: isLate,
      verified_by: user.id,
      verified_by_name: user.email ?? user.id,
      method: input.method ?? "manual",
      notes: input.notes ?? null,
    });

    if (!result.data) {
      throw new Error(result.error?.message ?? "Failed to create gate log");
    }

    if (isLate) {
      await violationsRepo.createViolation({
        organization_id: residentData.organization_id,
        resident_id: input.resident_id,
        violation_type: "late_entry",
        severity: "medium",
        gate_log_id: result.data.id,
        description: `Late entry at ${new Date().toLocaleTimeString()}`,
      });
    }

    await recordAudit({
      action: "gate_log.created",
      entity_type: "gate_log",
      entity_id: result.data.id,
      metadata: { resident_id: input.resident_id, entry_type: "entry", is_late: isLate },
    });

    return result.data;
  });
}

// ============================================================
// CHECK-OUT WORKFLOW
// ============================================================

export async function checkOutResident(
  input: CheckOutInput,
): Promise<ActionResponse<GateLogWithResident>> {
  return toActionResponse(async () => {
    const user = await requireAuth();
    await requirePermission("gate-logs.create");

    const supabase = await createClient();
    const orgId = await getCurrentOrganizationId();

    const residentResult = await supabase
      .from("residents")
      .select("id, name, type, organization_id")
      .eq("id", input.resident_id)
      .maybeSingle() as unknown as Promise<{
      data: { id: string; name: string; type: string; organization_id: string | null } | null;
    }>;

    const residentData = (await residentResult).data;

    if (!residentData) {
      throw new Error("Resident not found");
    }

    if (orgId && residentData.organization_id !== orgId) {
      throw new Error("Unauthorized cross-tenant access");
    }

    const lastLog = await gateLogRepo.findActiveEntryForResident(
      input.resident_id,
      orgId,
    );
    if (!lastLog.data || lastLog.data.entry_type !== "entry") {
      throw new Error("Resident is not currently checked in");
    }

    const result = await gateLogRepo.createGateLog({
      organization_id: residentData.organization_id,
      resident_id: input.resident_id,
      entry_type: "exit",
      is_late: false,
      verified_by: user.id,
      verified_by_name: user.email ?? user.id,
      method: input.method ?? "manual",
      notes: input.notes ?? null,
    });

    if (!result.data) {
      throw new Error(result.error?.message ?? "Failed to create gate log");
    }

    await recordAudit({
      action: "gate_log.created",
      entity_type: "gate_log",
      entity_id: result.data.id,
      metadata: { resident_id: input.resident_id, entry_type: "exit" },
    });

    return result.data;
  });
}

// ============================================================
// CURFEW EVALUATION
// ============================================================

async function evaluateCurfew(
  residentType: string,
  _residentId: string,
): Promise<boolean> {
  try {
    const rules = await curfewRepo.findCurfewRuleForResident(residentType);
    if (!rules.data) return false;

    const rule = rules.data;
    const now = new Date();
    const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();

    if (!rule.applicable_days.includes(dayOfWeek)) return false;

    const [hoursStr = "0", minutesStr = "0"] = rule.curfew_time.split(":");
    const hours = parseInt(hoursStr, 10);
    const minutes = parseInt(minutesStr, 10);
    const curfewDate = new Date(now);
    curfewDate.setHours(hours, minutes, 0, 0);

    const graceMs = (rule.grace_period_minutes ?? 30) * 60 * 1000;
    const curfewWithGrace = new Date(curfewDate.getTime() + graceMs);

    return now.getTime() > curfewWithGrace.getTime();
  } catch {
    return false;
  }
}

// ============================================================
// CURFEW RULES (permission enforced)
// ============================================================

export async function getCurfewRules(): Promise<ActionResponse<CurfewRule[]>> {
  return toActionResponse(async () => {
    await requirePermission("gate-logs.view");
    const { data, error } = await curfewRepo.findAllCurfewRules();
    if (error) throw new Error(error.message);
    return data ?? [];
  });
}

export async function createCurfewRuleAction(
  input: CreateCurfewRuleInput,
): Promise<ActionResponse<CurfewRule>> {
  return toActionResponse(async () => {
    await requirePermission("settings.update");

    const { data, error } = await curfewRepo.createCurfewRule(input);
    if (error || !data) {
      throw new Error(error?.message ?? "Failed to create rule");
    }

    await recordAudit({
      action: "settings.updated",
      entity_type: "curfew_rule",
      entity_id: data.id,
      metadata: { name: input.name, curfew_time: input.curfew_time },
    });

    return data;
  });
}

// ============================================================
// GATE DASHBOARD (permission enforced)
// ============================================================

export async function getGateDashboard(): Promise<ActionResponse<GateDashboard>> {
  return toActionResponse(async () => {
    await requirePermission("gate-logs.view");

    const [presenceResult, statsResult, violationsCount, activeCount, attendanceResult] =
      await Promise.all([
        gateLogRepo.getResidentPresence(),
        gateLogRepo.getTodayGateStats(),
        violationsRepo.getViolationsCountToday(),
        gateLogRepo.getActiveResidentCount(),
        attendanceRepo.getTodayAttendanceSummary(),
      ]);

    const presence = presenceResult.data ?? [];
    const stats = statsResult.data ?? { entries: 0, exits: 0, late: 0 };
    const attendance = attendanceResult.data ?? { present: 0, absent: 0, late: 0, excused: 0, total: 0 };

    const inside = presence.filter((p: ResidentPresence) => p.is_inside).length;
    const outside = presence.filter((p: ResidentPresence) => !p.is_inside).length;

    return {
      currently_inside: inside,
      currently_outside: outside,
      today_entries: stats.entries,
      today_exits: stats.exits,
      late_entries_today: stats.late,
      violations_today: violationsCount,
      active_occupancy: attendance.present + attendance.late,
      total_capacity: activeCount,
    };
  });
}

// ============================================================
// PRESENCE (permission enforced)
// ============================================================

export async function getResidentPresenceList(): Promise<
  ActionResponse<ResidentPresence[]>
> {
  return toActionResponse(async () => {
    await requirePermission("gate-logs.view");
    const { data, error } = await gateLogRepo.getResidentPresence();
    if (error) throw new Error(error.message);
    return data ?? [];
  });
}

// ============================================================
// GATE LOGS
// ============================================================

export async function getGateLogs(
  params: GateLogFilterParams = {},
): Promise<ActionResponse<PaginatedResponse<GateLogWithResident>>> {
  return toActionResponse(async () => {
    await requirePermission("gate-logs.view");
    const { data, error, count } = await gateLogRepo.findGateLogs(params);
    if (error) throw new Error(error.message);

    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 25;

    return {
      data: data ?? [],
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  });
}

// ============================================================
// MANUAL OVERRIDE
// ============================================================

export async function overrideGateLog(
  input: ManualOverrideInput,
): Promise<ActionResponse<void>> {
  return toActionResponse(async () => {
    const user = await requireAuth();
    await requirePermission("gate-logs.create");

    const { error } = await gateLogRepo.updateGateLog(input.gate_log_id, {
      override_reason: input.reason,
      overridden_by: user.id,
    });

    if (error) throw new Error(error.message);

    await recordAudit({
      action: "gate_log.created",
      entity_type: "gate_log",
      entity_id: input.gate_log_id,
      metadata: { override_reason: input.reason },
    });
  });
}

// ============================================================
// VIOLATION RESOLUTION WORKFLOW
// ============================================================

export async function resolveViolation(
  input: ResolveViolationInput,
): Promise<ActionResponse<void>> {
  return toActionResponse(async () => {
    const user = await requireAuth();
    await requirePermission("gate-logs.create");

    const existing = await violationsRepo.findViolationById(input.violation_id);
    if (!existing.data) {
      throw new Error("Violation not found");
    }

    if (existing.data.resolved) {
      throw new Error("Violation is already resolved");
    }

    const { error } = await violationsRepo.resolveViolation(
      input.violation_id,
      user.id,
      input.notes,
    );

    if (error) throw new Error(error.message);

    await recordAudit({
      action: "resident.updated",
      entity_type: "violation_log",
      entity_id: input.violation_id,
      metadata: {
        resolved: true,
        resolved_by: user.email ?? user.id,
        notes: input.notes,
      },
    });
  });
}

// ============================================================
// GATE LOG VERIFICATION
// ============================================================

export async function verifyGateLog(
  input: VerifyGateLogInput,
): Promise<ActionResponse<void>> {
  return toActionResponse(async () => {
    const user = await requireAuth();
    await requirePermission("gate-logs.verify");

    const { error } = await gateLogRepo.updateGateLog(input.gate_log_id, {
      verified_by: user.id,
      verified_by_name: user.email ?? user.id,
    });

    if (error) throw new Error(error.message);

    await recordAudit({
      action: "gate_log.verified",
      entity_type: "gate_log",
      entity_id: input.gate_log_id,
      metadata: { verified_by: user.id },
    });
  });
}

// ============================================================
// ATTENDANCE
// ============================================================

export async function getAttendance(
  params: AttendanceFilterParams = {},
): Promise<ActionResponse<PaginatedResponse<AttendanceWithResident>>> {
  return toActionResponse(async () => {
    await requirePermission("gate-logs.view");
    const { data, error, count } = await attendanceRepo.findAttendance(params);
    if (error) throw new Error(error.message);

    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 25;

    return {
      data: data ?? [],
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  });
}

// ============================================================
// VIOLATIONS
// ============================================================

export async function getViolations(
  params: ViolationFilterParams = {},
): Promise<ActionResponse<PaginatedResponse<ViolationWithResident>>> {
  return toActionResponse(async () => {
    await requirePermission("gate-logs.view");
    const { data, error, count } = await violationsRepo.findViolations(params);
    if (error) throw new Error(error.message);

    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 25;

    return {
      data: data ?? [],
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    };
  });
}

// ============================================================
// TODAY SUMMARY (permission enforced)
// ============================================================

export async function getTodaySummary(): Promise<
  ActionResponse<{
    entries_today: number;
    exits_today: number;
    late_today: number;
    attendance: { present: number; absent: number; late: number; total: number };
  }>
> {
  return toActionResponse(async () => {
    await requirePermission("gate-logs.view");

    const [statsResult, attendanceResult] = await Promise.all([
      gateLogRepo.getTodayGateStats(),
      attendanceRepo.getTodayAttendanceSummary(),
    ]);

    return {
      entries_today: statsResult.data?.entries ?? 0,
      exits_today: statsResult.data?.exits ?? 0,
      late_today: statsResult.data?.late ?? 0,
      attendance: attendanceResult.data ?? { present: 0, absent: 0, late: 0, total: 0 },
    };
  });
}
