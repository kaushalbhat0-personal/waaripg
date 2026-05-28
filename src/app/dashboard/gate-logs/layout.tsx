import { requirePagePermission } from "@/lib/route-protection";

export default async function GateLogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requirePagePermission("gate-logs.view");
  return <>{children}</>;
}
