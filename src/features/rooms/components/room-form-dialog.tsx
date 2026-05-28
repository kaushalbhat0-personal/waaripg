"use client";

import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks";
import { ROOM_TYPES } from "@/lib/constants";

type RoomFormData = {
  room_number: string;
  type: "single" | "double" | "triple" | "dormitory";
  capacity: number;
  rent_amount: number;
  description?: string | null;
  property_id?: string | null;
  floor_id?: string | null;
  is_active?: boolean;
};

type RoomFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: RoomFormData) => Promise<void>;
  defaultValues?: Partial<RoomFormData>;
  title?: string;
};

export function RoomFormDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultValues,
  title,
}: RoomFormDialogProps) {
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formTitle = title ?? (defaultValues ? "Edit Room" : "Add Room");
  const formDescription = defaultValues
    ? "Update room information below."
    : "Enter room details to add a new room.";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    control,
  } = useForm<RoomFormData>({
    defaultValues: {
      room_number: "",
      type: "single",
      capacity: 1,
      rent_amount: 0,
      description: null,
      property_id: null,
      floor_id: null,
      is_active: true,
      ...defaultValues,
    },
  });

  const selectedType = useWatch({ control, name: "type" });

  function handleTypeChange(value: string | null) {
    if (!value) return;
    setValue("type", value as RoomFormData["type"], { shouldValidate: true });
    const capacityMap: Record<string, number> = {
      single: 1,
      double: 2,
      triple: 3,
      dormitory: 4,
    };
    setValue("capacity", capacityMap[value] ?? 1);
  }

  async function onFormSubmit(data: RoomFormData) {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      reset();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  const formContent = (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="room_number">Room Number *</Label>
        <Input id="room_number" placeholder="e.g. 101, A-201" {...register("room_number")} />
        {errors.room_number && (
          <p className="text-xs text-destructive">{errors.room_number.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Room Type *</Label>
        <Select value={selectedType} onValueChange={handleTypeChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {ROOM_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-xs text-destructive">{errors.type.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="capacity">Capacity</Label>
        <Input
          id="capacity"
          type="number"
          min={1}
          max={50}
          {...register("capacity", { valueAsNumber: true })}
        />
        {errors.capacity && (
          <p className="text-xs text-destructive">{errors.capacity.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="rent_amount">Rent Amount (₹) *</Label>
        <Input
          id="rent_amount"
          type="number"
          min={0}
          placeholder="e.g. 5000"
          {...register("rent_amount", { valueAsNumber: true })}
        />
        {errors.rent_amount && (
          <p className="text-xs text-destructive">{errors.rent_amount.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          placeholder="Any additional notes about the room"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : defaultValues ? "Update Room" : "Create Room"}
        </Button>
      </div>
    </form>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{formTitle}</SheetTitle>
            <SheetDescription>{formDescription}</SheetDescription>
          </SheetHeader>
          <div className="mt-6">{formContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{formTitle}</DialogTitle>
          <DialogDescription>{formDescription}</DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
