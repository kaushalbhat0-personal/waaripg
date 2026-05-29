"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks";
import { ResidentForm } from "@/features/residents/components/resident-form";
import type { CreateStudentInput } from "../types";

type StudentFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: CreateStudentInput & { id?: string } | null;
  onSubmit: (data: CreateStudentInput) => Promise<void>;
  title?: string;
};

export function StudentFormDialog({
  open,
  onOpenChange,
  student,
  onSubmit,
  title,
}: StudentFormDialogProps) {
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formTitle = title ?? (student ? "Edit Student" : "Add Student");
  const formDescription = student
    ? "Update student information below."
    : "Enter student details to add them to the system.";

  async function handleSubmit(data: CreateStudentInput) {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{formTitle}</SheetTitle>
            <SheetDescription>{formDescription}</SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <ResidentForm
              defaultValues={student ?? undefined}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
              defaultType="hostel"
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{formTitle}</DialogTitle>
          <DialogDescription>{formDescription}</DialogDescription>
        </DialogHeader>
        <ResidentForm
          defaultValues={student ?? undefined}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          defaultType="hostel"
        />
      </DialogContent>
    </Dialog>
  );
}
