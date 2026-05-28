import { createClient } from "@/lib/supabase/server";
import type { Permission, PermissionModuleGroup } from "@/features/rbac/types";

export async function findAllPermissions() {
  const supabase = await createClient();
  return supabase
    .from("permissions")
    .select("*")
    .order("module", { ascending: true })
    .order("code", { ascending: true }) as unknown as Promise<{
    data: Permission[] | null;
    error: { message: string } | null;
  }>;
}

export async function findPermissionsByRoleId(roleId: string) {
  const supabase = await createClient();
  return supabase
    .from("role_permissions")
    .select("permission:permissions(*)")
    .eq("role_id", roleId) as unknown as Promise<{
    data: Array<Record<string, unknown>> | null;
    error: { message: string } | null;
  }>;
}

export async function findPermissionByCode(code: string) {
  const supabase = await createClient();
  return supabase
    .from("permissions")
    .select("id")
    .eq("code", code)
    .maybeSingle() as unknown as Promise<{
    data: { id: string } | null;
    error: { message: string } | null;
  }>;
}

export async function getPermissionsGroupedByModule(): Promise<{
  data: PermissionModuleGroup[] | null;
  error: { message: string } | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("permissions")
    .select("*")
    .order("module", { ascending: true })
    .order("code", { ascending: true });

  if (error || !data) {
    return { data: null, error };
  }

  const grouped: Record<string, Permission[]> = {};
  for (const perm of data as unknown as Permission[]) {
    if (!grouped[perm.module]) {
      grouped[perm.module] = [];
    }
    (grouped[perm.module] as Permission[]).push(perm);
  }

  const result = Object.entries(grouped).map(([module, permissions]) => ({
    module,
    permissions,
  }));

  return { data: result, error: null };
}
