import { createClient } from "@/lib/supabase/server";
import type { Role, RoleWithPermissions, Permission } from "@/features/rbac/types";

export async function findAllRoles() {
  const supabase = await createClient();
  return supabase
    .from("roles")
    .select("*")
    .order("name", { ascending: true }) as unknown as Promise<{
    data: Role[] | null;
    error: { message: string } | null;
  }>;
}

export async function findRoleById(id: string) {
  const supabase = await createClient();
  return supabase
    .from("roles")
    .select("*, role_permissions(permission_id)")
    .eq("id", id)
    .single() as unknown as Promise<{
    data: Record<string, unknown> | null;
    error: { message: string } | null;
  }>;
}

export async function findRoleWithPermissions(id: string) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const roleResult = await (supabase as any)
    .from("roles")
    .select("*")
    .eq("id", id)
    .single();

  if (roleResult.error) {
    return { data: null as RoleWithPermissions | null, error: roleResult.error };
  }
  if (!roleResult.data) {
    return { data: null as RoleWithPermissions | null, error: { message: "Role not found" } };
  }

  const roleData = roleResult.data as Record<string, unknown>;

  const permsResult = await supabase
    .from("role_permissions")
    .select("permission:permissions(*)")
    .eq("role_id", id);

  const permissions = ((permsResult.data ?? []) as Array<Record<string, unknown>>)
    .map((rp) => rp.permission as Permission)
    .filter(Boolean);

  return {
    data: { ...roleData, permissions } as RoleWithPermissions,
    error: permsResult.error ?? null,
  };
}

export async function createRole(data: { name: string; description?: string }) {
  const supabase = await createClient();
  return supabase
    .from("roles")
    .insert(data as never)
    .select()
    .single() as unknown as Promise<{
    data: Role | null;
    error: { message: string } | null;
  }>;
}

export async function updateRolePermissions(roleId: string, permissionIds: string[]) {
  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from("role_permissions")
    .delete()
    .eq("role_id", roleId);

  if (deleteError) {
    return { error: deleteError };
  }

  if (permissionIds.length === 0) {
    return { error: null };
  }

  const rows = permissionIds.map((permissionId) => ({
    role_id: roleId,
    permission_id: permissionId,
  }));

  const { error: insertError } = await supabase
    .from("role_permissions")
    .insert(rows as never);

  return { error: insertError };
}

export async function assignUserRole(data: {
  user_id: string;
  role_id: string;
  organization_id?: string;
  assigned_by: string;
}) {
  const supabase = await createClient();
  return supabase
    .from("user_roles")
    .insert(data as never)
    .select()
    .single() as unknown as Promise<{
    data: { id: string } | null;
    error: { message: string } | null;
  }>;
}

export async function removeUserRole(userId: string, roleId: string) {
  const supabase = await createClient();
  return supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("role_id", roleId) as unknown as Promise<{
    error: { message: string } | null;
  }>;
}

export async function findUserRoles(userId: string) {
  const supabase = await createClient();
  return supabase
    .from("user_roles")
    .select("*, role:roles(*)")
    .eq("user_id", userId) as unknown as Promise<{
    data: Array<Record<string, unknown>> | null;
    error: { message: string } | null;
  }>;
}

export async function findAllUsersWithRoles() {
  const supabase = await createClient();
  return supabase
    .from("admin_users")
    .select("*, user_roles(*, role:roles(*))")
    .order("created_at", { ascending: false }) as unknown as Promise<{
    data: Array<Record<string, unknown>> | null;
    error: { message: string } | null;
  }>;
}
