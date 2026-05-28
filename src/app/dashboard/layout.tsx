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

  if (!user) {
    redirect("/login");
  }

  const hasExistingRole = await hasRole(user.id);

  if (!hasExistingRole) {
    redirect("/onboarding");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
