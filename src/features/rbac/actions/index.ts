"use server";

import { revalidatePath } from "next/cache";
import * as rbacService from "@/services/rbac";
import type {
  AuditLog,
  AuditFilterParams,
  ActivityTimelineEvent,
  TimelineFilterParams,
  Role,
  RoleWithPermissions,
  Permission,
  PermissionModuleGroup,
} from "@/features/rbac/types";
import type { ActionResponse, PaginatedResponse } from "@/types";

// ============================================================
// ROLE ACTIONS
// ============================================================

export async function getRolesAction(): Promise<ActionResponse<Role[]>> {
  return rbacService.getRoles();
}

export async function getRoleWithPermissionsAction(
  id: string,
): Promise<ActionResponse<RoleWithPermissions>> {
  return rbacService.getRoleWithPermissions(id);
}

export async function assignRoleAction(input: {
  user_id: string;
  role_id: string;
  organization_id?: string;
}): Promise<ActionResponse<{ id: string }>> {
  const result = await rbacService.assignRole(input);
  if (result.success) {
    revalidatePath("/dashboard/roles");
  }
  return result;
}

export async function revokeRoleAction(
  userId: string,
  roleId: string,
): Promise<ActionResponse<void>> {
  const result = await rbacService.revokeRole(userId, roleId);
  if (result.success) {
    revalidatePath("/dashboard/roles");
  }
  return result;
}

export async function updateRolePermissionsAction(
  roleId: string,
  permissionIds: string[],
): Promise<ActionResponse<void>> {
  const result = await rbacService.updateRolePermissions(roleId, permissionIds);
  if (result.success) {
    revalidatePath("/dashboard/roles");
  }
  return result;
}

// ============================================================
// PERMISSION ACTIONS
// ============================================================

export async function getAllPermissionsAction(): Promise<ActionResponse<Permission[]>> {
  return rbacService.getAllPermissions();
}

export async function getPermissionsGroupedAction(): Promise<
  ActionResponse<PermissionModuleGroup[]>
> {
  return rbacService.getPermissionsGrouped();
}

// ============================================================
// USER ACTIONS
// ============================================================

export async function getUsersWithRolesAction(): Promise<
  ActionResponse<Array<Record<string, unknown>>>
> {
  return rbacService.getUsersWithRoles();
}

// ============================================================
// AUDIT LOG ACTIONS
// ============================================================

export async function getAuditLogsAction(
  params: AuditFilterParams = {},
): Promise<ActionResponse<PaginatedResponse<AuditLog>>> {
  return rbacService.getAuditLogs(params);
}

export async function getAuditLogByIdAction(
  id: string,
): Promise<ActionResponse<AuditLog | null>> {
  return rbacService.getAuditLogById(id);
}

// ============================================================
// TIMELINE ACTIONS
// ============================================================

export async function getTimelineEventsAction(
  params: TimelineFilterParams = {},
): Promise<ActionResponse<PaginatedResponse<ActivityTimelineEvent>>> {
  return rbacService.getTimelineEvents(params);
}
