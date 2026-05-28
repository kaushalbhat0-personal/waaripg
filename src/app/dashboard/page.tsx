import { PageContainer } from "@/shared/page/page-container";
import { DashboardWidgets } from "./_components/dashboard-widgets";

export default function DashboardPage() {
  return (
    <PageContainer className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Operations</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time overview of your PG & Hostel operations
          </p>
        </div>
      </div>
      <DashboardWidgets />
    </PageContainer>
  );
}
