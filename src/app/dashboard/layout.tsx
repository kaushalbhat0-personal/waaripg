import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/auth";
import { hasRole } from "@/services/rbac";
import { DashboardShell } from "./_components/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  console.log(`[DASHBOARD_LAYOUT] user=`, user ? JSON.stringify({ id: user.id, email: user.email }) : "null");

  if (!user) {
    console.log(`[DASHBOARD_LAYOUT] No user — redirecting to /login`);
    redirect("/login");
  }

  const hasExistingRole = await hasRole(user.id);

  console.log(`[DASHBOARD_LAYOUT] hasRole(${user.id})=${hasExistingRole}`);

  if (!hasExistingRole) {
    console.log(`[DASHBOARD_LAYOUT] No role — redirecting to /onboarding`);
    redirect("/onboarding");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
