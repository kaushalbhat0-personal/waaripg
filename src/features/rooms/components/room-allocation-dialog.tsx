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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks";
import { Bed, Search, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { getResidentsAction } from "@/features/residents/actions";

type ResidentOption = {
  id: string;
  name: string;
  phone: string;
  type: string;
};

type BedOption = {
  id: string;
  bed_number: string;
  room_id: string;
  room_number: string;
  rent_amount: number;
};

type RoomAllocationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    resident_id: string;
    bed_id: string;
    room_id: string;
    rent_amount: number;
    security_deposit: number;
    notes?: string | null;
  }) => Promise<void>;
  availableBeds: BedOption[];
  title?: string;
};

export function RoomAllocationDialog({
  open,
  onOpenChange,
  onSubmit,
  availableBeds,
  title,
}: RoomAllocationDialogProps) {
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [residentSearch, setResidentSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ResidentOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [selectedResident, setSelectedResident] = useState<ResidentOption | null>(null);
  const [selectedBedId, setSelectedBedId] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState(0);
  const [notes, setNotes] = useState("");

  function handleOpenChange(open: boolean) {
    if (!open) {
      setResidentSearch("");
      setSearchResults([]);
      setSelectedResident(null);
      setSelectedBedId("");
      setSecurityDeposit(0);
      setNotes("");
    }
    onOpenChange(open);
  }

  async function handleSearch(value: string) {
    setResidentSearch(value);
    if (searchTimeout) clearTimeout(searchTimeout);

    if (value.length < 2) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const result = await getResidentsAction({ search: value, pageSize: 10 });
        if (result.success) {
          setSearchResults(
            result.data.data.map((r) => ({
              id: r.id,
              name: r.name,
              phone: r.phone,
              type: r.type,
            })),
          );
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    setSearchTimeout(timeout);
  }

  const selectedBed = availableBeds.find((b) => b.id === selectedBedId);

  async function handleSubmit() {
    if (!selectedResident || !selectedBedId) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        resident_id: selectedResident.id,
        bed_id: selectedBedId,
        room_id: selectedBed?.room_id ?? "",
        rent_amount: selectedBed?.rent_amount ?? 0,
        security_deposit: securityDeposit,
        notes: notes || null,
      });
      handleOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  const formContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select Resident *</Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={residentSearch}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        {isSearching && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Searching...
          </div>
        )}
        {searchResults.length > 0 && (
          <div className="max-h-40 overflow-y-auto rounded-md border">
            {searchResults.map((r) => (
              <button
                key={r.id}
                type="button"
                className={cn(
                  "w-full px-3 py-2 text-left text-sm transition-colors hover:bg-muted",
                  selectedResident?.id === r.id && "bg-muted font-medium",
                )}
                onClick={() => {
                  setSelectedResident(r);
                  setResidentSearch(`${r.name} (${r.phone})`);
                  setSearchResults([]);
                }}
              >
                <div>{r.name}</div>
                <div className="text-xs text-muted-foreground">
                  {r.phone} · {r.type === "hostel" ? "Hostel" : "PG"}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Select Bed *</Label>
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
                <div>{bed.bed_number}</div>
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(bed.rent_amount)}/mo
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Security Deposit (₹)</Label>
        <Input
          type="number"
          min={0}
          value={securityDeposit}
          onChange={(e) => setSecurityDeposit(Number(e.target.value))}
        />
      </div>

      <div className="space-y-2">
        <Label>Notes (optional)</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any additional notes..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || !selectedResident || !selectedBedId}
        >
          {isSubmitting ? "Allocating..." : "Allocate Resident"}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{title ?? "Allocate Resident"}</SheetTitle>
            <SheetDescription>Assign a resident to a bed in this room.</SheetDescription>
          </SheetHeader>
          <div className="mt-6">{formContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title ?? "Allocate Resident"}</DialogTitle>
          <DialogDescription>Assign a resident to a bed in this room.</DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
