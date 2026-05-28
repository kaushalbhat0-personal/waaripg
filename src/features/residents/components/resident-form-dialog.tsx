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
import { ResidentForm } from "./resident-form";
import type { CreateResidentInput } from "../types";

type ResidentFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resident?: CreateResidentInput & { id?: string } | null;
  onSubmit: (data: CreateResidentInput) => Promise<void>;
  title?: string;
};

export function ResidentFormDialog({
  open,
  onOpenChange,
  resident,
  onSubmit,
  title,
}: ResidentFormDialogProps) {
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formTitle = title ?? (resident ? "Edit Resident" : "Add Resident");
  const formDescription = resident
    ? "Update resident information below."
    : "Enter resident details to add them to the system.";

  async function handleSubmit(data: CreateResidentInput) {
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
              defaultValues={resident ?? undefined}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
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
          defaultValues={resident ?? undefined}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}
