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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks";
import { Bed, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";

type BedOption = {
  id: string;
  bed_number: string;
  room_id: string;
  room_number: string;
  rent_amount: number;
};

type RoomOption = {
  id: string;
  room_number: string;
  type: string;
  availableBeds: BedOption[];
};

type RoomTransferDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    current_bed_id: string;
    new_bed_id: string;
    new_room_id: string;
    reason?: string | null;
  }) => Promise<void>;
  currentBedId: string;
  currentRoomName: string;
  currentBedName: string;
  residentName?: string;
  rooms: RoomOption[];
};

export function RoomTransferDialog({
  open,
  onOpenChange,
  onSubmit,
  currentBedId,
  currentRoomName,
  currentBedName,
  residentName,
  rooms,
}: RoomTransferDialogProps) {
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [selectedBedId, setSelectedBedId] = useState("");
  const [reason, setReason] = useState("");

  const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
  const availableBeds = selectedRoom?.availableBeds ?? [];

  function handleReset() {
    setSelectedRoomId("");
    setSelectedBedId("");
    setReason("");
  }

  async function handleSubmit() {
    if (!selectedBedId) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        current_bed_id: currentBedId,
        new_bed_id: selectedBedId,
        new_room_id: selectedRoomId,
        reason: reason || null,
      });
      handleReset();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  const formContent = (
    <div className="space-y-4">
      {residentName && (
        <div className="rounded-md bg-muted p-3 text-sm">
          Transferring <span className="font-medium">{residentName}</span> from{' '}
          <span className="font-medium">{currentRoomName} - {currentBedName}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label>Select Target Room *</Label>
        <div className="grid grid-cols-1 gap-2">
          {rooms
            .filter((r) => r.availableBeds.length > 0)
            .map((room) => (
              <button
                key={room.id}
                type="button"
                className={cn(
                  "flex items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted",
                  selectedRoomId === room.id && "border-primary bg-primary/5",
                )}
                onClick={() => {
                  setSelectedRoomId(room.id);
                  setSelectedBedId("");
                }}
              >
                <div className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-muted-foreground" />
                  <span>Room {room.room_number}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {room.availableBeds.length} bed{room.availableBeds.length !== 1 ? "s" : ""} available
                </span>
              </button>
            ))}
        </div>
      </div>

      {selectedRoom && (
        <div className="space-y-2">
          <Label>Select Target Bed *</Label>
          <div className="grid grid-cols-2 gap-2">
            {availableBeds.map((bed) => (
              <button
                key={bed.id}
                type="button"
                className={cn(
                  "flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted",
                  selectedBedId === bed.id && "border-primary bg-primary/5",
                )}
                onClick={() => setSelectedBedId(bed.id)}
              >
                <Bed className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-1">
                    {bed.bed_number}
                    {selectedBedId === bed.id && <ArrowRight className="h-3 w-3 text-primary" />}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(bed.rent_amount)}/mo
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Transfer Reason (optional)</Label>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why is this resident being transferred?"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => { handleReset(); onOpenChange(false); }}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting || !selectedBedId}>
          {isSubmitting ? "Transferring..." : "Transfer Resident"}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Transfer Resident</SheetTitle>
            <SheetDescription>Move resident to a different bed or room.</SheetDescription>
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
          <DialogTitle>Transfer Resident</DialogTitle>
          <DialogDescription>Move resident to a different bed or room.</DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
