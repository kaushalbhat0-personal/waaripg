import { PageHeader } from "@/shared/page/page-header";
import { PageContainer } from "@/shared/page/page-container";
import { EmptyState } from "@/shared/feedback";
import { Button } from "@/components/ui/button";
import { GraduationCap, Plus } from "lucide-react";

export default function StudentsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Students"
        description="Manage hostel students"
        actions={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        }
      />
      <EmptyState
        icon={GraduationCap}
        title="No students yet"
        message="Add your first student to get started."
      />
    </PageContainer>
  );
}
