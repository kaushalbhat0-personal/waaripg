import { createClient } from "@/lib/supabase/server";
import { requireAuth } from "@/services/auth";

export async function getCurrentOrganizationId(): Promise<string | null> {
  try {
    const user = await requireAuth();
    const supabase = await createClient();
    const { data } = await supabase
      .from("user_roles")
      .select("organization_id")
      .eq("user_id", user.id)
      .maybeSingle();
    return (data as { organization_id: string | null } | null)?.organization_id ?? null;
  } catch {
    return null;
  }
}

export async function getOrganizationIdOrThrow(): Promise<string> {
  const orgId = await getCurrentOrganizationId();
  if (!orgId) {
    throw new Error("Organization context required");
  }
  return orgId;
}

export async function withOrg<T>(
  query: Promise<{ data: T | null; error: { message: string } | null }>,
): Promise<{ data: T | null; error: { message: string } | null }> {
  return query;
}
