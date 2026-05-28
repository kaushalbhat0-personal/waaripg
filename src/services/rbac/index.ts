import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, requireAuth } from "@/services/auth";
import * as rolesRepo from "@/repositories/roles";
import * as permissionsRepo from "@/repositories/permissions";
import * as auditLogsRepo from "@/repositories/audit-logs";
import type {
  Role,
  RoleWithPermissions,
  Permission,
  AuditLog,
  AuditFilterParams,
  ActivityTimelineEvent,
  TimelineFilterParams,
  AuditAction,
  AuthorizationResult,
  PermissionModuleGroup,
} from "@/features/rbac/types";
import type { ActionResponse, PaginatedResponse } from "@/types";

// ============================================================
// PERMISSION EVALUATION
// ============================================================

export async function hasPermission(
  userId: string,
  permissionCode: string,
): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await (supabase.rpc as unknown as (
    fn: string,
    params: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { message: string } | null }>)(
    "has_permission",
    { p_user_id: userId, p_permission: permissionCode },
  );

  if (error) {
    return false;
  }
  return !!data;
}

export async function checkPermission(
  permissionCode: string,
): Promise<AuthorizationResult> {
  try {
    const user = await requireAuth();
    const permitted = await hasPermission(user.id, permissionCode);

    if (!permitted) {
      return {
        authorized: false,
        reason: `Missing permission: ${permissionCode}`,
      };
    }

    return { authorized: true };
  } catch (error) {
    return {
      authorized: false,
      reason: error instanceof Error ? error.message : "Authorization check failed",
    };
  }
}

export async function requirePermission(
  permissionCode: string,
): Promise<{ userId: string }> {
  const user = await requireAuth();
  const permitted = await hasPermission(user.id, permissionCode);

  if (!permitted) {
    throw new Error(`Forbidden: missing permission '${permissionCode}'`);
  }

  return { userId: user.id };
}

export async function getUserPermissions(userId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_roles")
    .select("role:roles(id, name, role_permissions(permission:permissions(code)))")
    .eq("user_id", userId);

  if (!data) return [];

  const codes = new Set<string>();
  for (const ur of data as unknown as Array<Record<string, unknown>>) {
    const role = ur.role as Record<string, unknown>;
    const rps = role?.role_permissions as Array<Record<string, unknown>> | undefined;
    if (rps) {
      for (const rp of rps) {
        const perm = rp.permission as { code: string } | undefined;
        if (perm?.code) {
          codes.add(perm.code);
        }
      }
    }
  }

  return Array.from(codes);
}

export async function getCurrentUserPermissions(): Promise<string[]> {
  const user = await requireAuth();
  return getUserPermissions(user.id);
}

// ============================================================
// ROLE MANAGEMENT
// ============================================================

export async function getRoles(): Promise<ActionResponse<Role[]>> {
  try {
    await requirePermission("roles.manage");
    const { data, error } = await rolesRepo.findAllRoles();
    if (error) {
      return { success: false, error: { code: "DB_ERROR", message: error.message } };
    }
    return { success: true, data: data ?? [] };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch roles",
      },
    };
  }
}

export async function getRoleWithPermissions(
  id: string,
): Promise<ActionResponse<RoleWithPermissions>> {
  try {
    await requirePermission("roles.manage");
    const { data, error } = await rolesRepo.findRoleWithPermissions(id);
    if (error || !data) {
      return { success: false, error: { code: "NOT_FOUND", message: "Role not found" } };
    }
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch role",
      },
    };
  }
}

export async function assignRole(input: {
  user_id: string;
  role_id: string;
  organization_id?: string;
}): Promise<ActionResponse<{ id: string }>> {
  try {
    const { userId: actorId } = await requirePermission("roles.manage");
    const { data, error } = await rolesRepo.assignUserRole({
      ...input,
      assigned_by: actorId,
    });
    if (error || !data) {
      return {
        success: false,
        error: { code: "DB_ERROR", message: error?.message ?? "Failed to assign role" },
      };
    }

    const roleResult = await rolesRepo.findRoleById(input.role_id);
    const roleName = (roleResult.data?.name as string) ?? "Unknown";

    await recordAudit({
      action: "role.assigned",
      entity_type: "user_roles",
      entity_id: data.id,
      metadata: { user_id: input.user_id, role_id: input.role_id, role_name: roleName },
    });

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "ERROR",
        message: error instanceof Error ? error.message : "Failed to assign role",
      },
    };
  }
}

export async function revokeRole(
  userId: string,
  roleId: string,
): Promise<ActionResponse<void>> {
  try {
    await requirePermission("roles.manage");
    const { error } = await rolesRepo.removeUserRole(userId, roleId);
    if (error) {
      return { success: false, error: { code: "DB_ERROR", message: error.message } };
    }
    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "ERROR",
        message: error instanceof Error ? error.message : "Failed to revoke role",
      },
    };
  }
}

// ============================================================
// SAFE ROLE ASSIGNMENT (admin client, idempotent, bootstrap-aware)
// ============================================================

export type AssignUserRoleResult = {
  id: string;
  already_exists: boolean;
  bootstrapped?: boolean;
};

/**
 * assignUserRole
 *
 * Idempotent, audit-logged role assignment.
 *
 * Flow:
 *   1. Uses admin (service-role) client to bypass RLS
 *   2. Calls `assign_user_role_safe` RPC (validates role, prevents duplicates)
 *   3. Records audit trail
 *
 * Bootstrap fallback:
 *   If `bootstrap` is true and no admins exist, this user becomes admin.
 */
export async function assignUserRole(input: {
  user_id: string;
  role_name: string;
  organization_id?: string;
  assigned_by?: string;
  bootstrap?: boolean;
}): Promise<ActionResponse<AssignUserRoleResult>> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const supabase = await createAdminClient();

    let result: AssignUserRoleResult;

    if (input.bootstrap) {
      const { data, error } = await (supabase.rpc as unknown as (
        fn: string,
        params: Record<string, unknown>,
      ) => Promise<{ data: unknown; error: { message: string } | null }>)(
        "bootstrap_first_admin",
        { p_user_id: input.user_id },
      );

      if (error) {
        return {
          success: false,
          error: { code: "DB_ERROR", message: error.message },
        };
      }

      result = data as AssignUserRoleResult;
    } else {
      const { data, error } = await (supabase.rpc as unknown as (
        fn: string,
        params: Record<string, unknown>,
      ) => Promise<{ data: unknown; error: { message: string } | null }>)(
        "assign_user_role_safe",
        {
          p_user_id: input.user_id,
          p_role_name: input.role_name,
          p_organization_id: input.organization_id ?? null,
          p_assigned_by: input.assigned_by ?? null,
        },
      );

      if (error) {
        return {
          success: false,
          error: { code: "DB_ERROR", message: error.message },
        };
      }

      result = (data as { success: boolean; data: AssignUserRoleResult; error?: string }).data;
    }

    if (!result.id) {
      return {
        success: false,
        error: { code: "ASSIGN_FAILED", message: "Role assignment did not return an ID" },
      };
    }

    // Record audit trail (non-blocking)
    if (!result.already_exists) {
      await recordAudit({
        action: result.bootstrapped ? ("user.onboarded" as never) : "role.assigned",
        entity_type: "user_roles",
        entity_id: result.id,
        actor_name: "system",
        metadata: {
          user_id: input.user_id,
          role_name: input.role_name,
          bootstrapped: result.bootstrapped ?? false,
        },
      });
    }

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "ERROR",
        message: error instanceof Error ? error.message : "Failed to assign role",
      },
    };
  }
}

/**
 * getUserRole
 *
 * Returns the role name + id for a user, or null if unassigned.
 */
export async function getUserRole(userId: string): Promise<{
  role_id: string;
  role_name: string;
  organization_id: string | null;
} | null> {
  try {
    const { createAdminClient } = await import("@/lib/supabase/server");
    const supabase = await createAdminClient();

    const { data, error } = await (supabase.rpc as unknown as (
      fn: string,
      params: Record<string, unknown>,
    ) => Promise<{ data: unknown; error: { message: string } | null }>)(
      "get_user_role",
      { p_user_id: userId },
    );

    if (error || !data) return null;

    const rows = data as Array<{
      role_id: string;
      role_name: string;
      organization_id: string | null;
    }>;

    return rows[0] ?? null;
  } catch {
    return null;
  }
}

/**
 * hasRole
 *
 * Quick check if a user has any role assigned.
 */
export async function hasRole(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role !== null;
}

export async function updateRolePermissions(
  roleId: string,
  permissionIds: string[],
): Promise<ActionResponse<void>> {
  try {
    await requirePermission("roles.manage");
    const { error } = await rolesRepo.updateRolePermissions(roleId, permissionIds);
    if (error) {
      return { success: false, error: { code: "DB_ERROR", message: error.message } };
    }

    await recordAudit({
      action: "permission.updated",
      entity_type: "role_permissions",
      entity_id: roleId,
      metadata: { permission_ids: permissionIds },
    });

    return { success: true, data: undefined };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "ERROR",
        message: error instanceof Error ? error.message : "Failed to update permissions",
      },
    };
  }
}

// ============================================================
// PERMISSIONS
// ============================================================

export async function getAllPermissions(): Promise<ActionResponse<Permission[]>> {
  try {
    await requirePermission("roles.manage");
    const { data, error } = await permissionsRepo.findAllPermissions();
    if (error) {
      return { success: false, error: { code: "DB_ERROR", message: error.message } };
    }
    return { success: true, data: data ?? [] };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch permissions",
      },
    };
  }
}

export async function getPermissionsGrouped(): Promise<
  ActionResponse<PermissionModuleGroup[]>
> {
  try {
    await requirePermission("roles.manage");
    const { data, error } = await permissionsRepo.getPermissionsGroupedByModule();
    if (error) {
      return { success: false, error: { code: "DB_ERROR", message: error.message } };
    }
    return { success: true, data: data ?? [] };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch permissions",
      },
    };
  }
}

// ============================================================
// USERS WITH ROLES
// ============================================================

export async function getUsersWithRoles(): Promise<
  ActionResponse<Array<Record<string, unknown>>>
> {
  try {
    await requirePermission("roles.manage");
    const { data, error } = await rolesRepo.findAllUsersWithRoles();
    if (error) {
      return { success: false, error: { code: "DB_ERROR", message: error.message } };
    }
    return { success: true, data: data ?? [] };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch users",
      },
    };
  }
}

// ============================================================
// AUDIT LOGS
// ============================================================

export async function getAuditLogs(
  params: AuditFilterParams = {},
): Promise<ActionResponse<PaginatedResponse<AuditLog>>> {
  try {
    await requirePermission("audit-logs.view");
    const { data, error, count } = await auditLogsRepo.findAuditLogs(params);

    if (error) {
      return { success: false, error: { code: "DB_ERROR", message: error.message } };
    }

    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 25;

    return {
      success: true,
      data: {
        data: data ?? [],
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
        code: "ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch audit logs",
      },
    };
  }
}

export async function getAuditLogById(
  id: string,
): Promise<ActionResponse<AuditLog | null>> {
  try {
    await requirePermission("audit-logs.view");
    const { data, error } = await auditLogsRepo.findAuditLogById(id);
    if (error) {
      return { success: false, error: { code: "DB_ERROR", message: error.message } };
    }
    return { success: true, data: data ?? null };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch audit log",
      },
    };
  }
}

// ============================================================
// ACTIVITY TIMELINE
// ============================================================

const ACTION_LABELS: Record<string, string> = {
  "resident.created": "Resident Created",
  "resident.updated": "Resident Updated",
  "resident.archived": "Resident Archived",
  "room.created": "Room Created",
  "room.updated": "Room Updated",
  "allocation.transferred": "Resident Transferred",
  "payment.recorded": "Payment Recorded",
  "payment.refunded": "Refund Issued",
  "invoice.created": "Invoice Generated",
  "user.onboarded": "User Onboarded",
};

function getTimelineIcon(action: string): string {
  if (action.startsWith("resident")) return "User";
  if (action.startsWith("payment")) return "Wallet";
  if (action.startsWith("invoice")) return "FileText";
  if (action.startsWith("allocation")) return "MoveRight";
  if (action.startsWith("room")) return "DoorOpen";
  if (action.startsWith("charge")) return "CreditCard";
  if (action.startsWith("gate")) return "Logs";
  if (action.startsWith("role")) return "Shield";
  return "Activity";
}

function getTimelineColor(action: string): string {
  if (action.includes("created") || action.includes("recorded")) return "green";
  if (action.includes("updated") || action.includes("transferred")) return "blue";
  if (action.includes("archived") || action.includes("refunded") || action.includes("cancelled")) return "red";
  return "gray";
}

function buildTimelineDescription(
  action: string,
  entityType: string,
  entityId: string,
  metadata?: Record<string, unknown> | null,
): string {
  if (action === "payment.recorded" && metadata?.amount) {
    return `₹${metadata.amount} payment recorded`;
  }
  if (action === "payment.refunded" && metadata?.amount) {
    return `₹${metadata.amount} refund issued`;
  }
  if (action === "allocation.transferred") {
    return `Resident transferred`;
  }
  if (action === "invoice.created" && metadata?.invoice_number) {
    return `Invoice ${metadata.invoice_number} generated`;
  }
  return `${entityType.replace(/_/g, " ")} ${entityId.slice(0, 8)}`;
}

export async function getTimelineEvents(
  params: TimelineFilterParams = {},
): Promise<ActionResponse<PaginatedResponse<ActivityTimelineEvent>>> {
  try {
    const { data, error, count } = await auditLogsRepo.findTimelineEvents(params);

    if (error) {
      return { success: false, error: { code: "DB_ERROR", message: error.message } };
    }

    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;

    return {
      success: true,
      data: {
        data: data ?? [],
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
        code: "ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch timeline",
      },
    };
  }
}

// ============================================================
// RECORD AUDIT (sidecar function)
// ============================================================

export async function recordAudit(input: {
  action: AuditAction | string;
  entity_type: string;
  entity_id: string;
  actor_name?: string;
  before_state?: Record<string, unknown> | null;
  after_state?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  ip_address?: string;
  user_agent?: string;
}): Promise<void> {
  try {
    const user = await getCurrentUser();
    if (!user) return;

    const auditResult = await auditLogsRepo.createAuditLog({
      actor_id: user.id,
      actor_name: input.actor_name ?? user.email ?? user.id,
      action: input.action,
      entity_type: input.entity_type,
      entity_id: input.entity_id,
      before_state: input.before_state ?? null,
      after_state: input.after_state ?? null,
      metadata: input.metadata ?? null,
      ip_address: input.ip_address ?? null,
      user_agent: input.user_agent ?? null,
    });

    if (auditResult.data) {
      await auditLogsRepo.createTimelineEvent({
        audit_log_id: auditResult.data.id,
        actor_name: input.actor_name ?? user.email ?? user.id,
        action_label: ACTION_LABELS[input.action] ?? input.action,
        description: buildTimelineDescription(
          input.action,
          input.entity_type,
          input.entity_id,
          input.metadata,
        ),
        entity_type: input.entity_type,
        entity_id: input.entity_id,
        icon: getTimelineIcon(input.action),
        color: getTimelineColor(input.action),
      });
    }
  } catch {
    // Fail silently - audit should never break the main operation
  }
}

export async function getRolesForUser(
  userId: string,
): Promise<ActionResponse<Array<Record<string, unknown>>>> {
  try {
    const { data, error } = await rolesRepo.findUserRoles(userId);
    if (error) {
      return { success: false, error: { code: "DB_ERROR", message: error.message } };
    }
    return { success: true, data: data ?? [] };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch user roles",
      },
    };
  }
}
