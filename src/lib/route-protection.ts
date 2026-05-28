import { redirect } from "next/navigation";
import { requireAuth } from "@/services/auth";
import { hasPermission } from "@/services/rbac";

export async function requirePagePermission(permissionCode: string): Promise<void> {
  const user = await requireAuth();
  const permitted = await hasPermission(user.id, permissionCode);

  if (!permitted) {
    redirect("/dashboard");
  }
}

export async function requireAnyPagePermission(
  permissionCodes: string[],
): Promise<void> {
  const user = await requireAuth();

  for (const code of permissionCodes) {
    const permitted = await hasPermission(user.id, code);
    if (permitted) return;
  }

  redirect("/dashboard");
}
