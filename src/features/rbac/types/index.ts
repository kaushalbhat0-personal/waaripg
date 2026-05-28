

export type RoleName = "admin" | "manager" | "accountant" | "guard";

export type Role = {
  id: string;
  name: RoleName;
  description: string | null;
  is_system: boolean;
  created_at: string;
  updated_at: string;
};

export type Permission = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  module: string;
  created_at: string;
};

export type RoleWithPermissions = Role & {
  permissions: Permission[];
};

export type UserRole = {
  id: string;
  user_id: string;
  role_id: string;
  organization_id: string | null;
  assigned_by: string | null;
  created_at: string;
};

export type UserRoleWithDetails = UserRole & {
  role: Role;
};

export type AuditAction =
  | "resident.created"
  | "resident.updated"
  | "resident.archived"
  | "room.created"
  | "room.updated"
  | "room.archived"
  | "bed.created"
  | "bed.updated"
  | "bed.status_changed"
  | "allocation.created"
  | "allocation.updated"
  | "allocation.transferred"
  | "allocation.ended"
  | "invoice.created"
  | "invoice.updated"
  | "invoice.cancelled"
  | "payment.recorded"
  | "payment.refunded"
  | "charge.created"
  | "charge.updated"
  | "gate_log.created"
  | "gate_log.verified"
  | "role.assigned"
  | "role.revoked"
  | "permission.updated"
  | "settings.updated"
  | "user.login"
  | "user.logout"
  | "user.onboarded";

export type AuditLog = {
  id: string;
  organization_id: string | null;
  actor_id: string;
  actor_name: string | null;
  action: AuditAction;
  entity_type: string;
  entity_id: string;
  before_state: Record<string, unknown> | null;
  after_state: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type ActivityTimelineEvent = {
  id: string;
  audit_log_id: string;
  organization_id: string | null;
  actor_name: string | null;
  action_label: string;
  description: string;
  entity_type: string;
  entity_id: string;
  icon: string | null;
  color: string | null;
  created_at: string;
};

export type AuditFilterParams = {
  action?: string;
  actor_id?: string;
  entity_type?: string;
  entity_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  pageSize?: number;
};

export type TimelineFilterParams = {
  entity_type?: string;
  entity_id?: string;
  actor_name?: string;
  page?: number;
  pageSize?: number;
};

export type AuthorizationResult = {
  authorized: boolean;
  reason?: string;
};

export type CreateRoleInput = {
  name: RoleName;
  description?: string;
};

export type AssignRoleInput = {
  user_id: string;
  role_id: string;
  organization_id?: string;
};

export type UpdateRolePermissionsInput = {
  role_id: string;
  permission_ids: string[];
};

export type UserWithRoles = {
  id: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  roles: Role[];
};

export type AuditLogDetailDto = AuditLog & {
  actor?: { id: string; name: string | null; email: string | null };
};

export type PermissionModuleGroup = {
  module: string;
  permissions: Permission[];
};
