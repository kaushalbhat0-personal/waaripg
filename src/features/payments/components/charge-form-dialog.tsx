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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks";
import { CHARGE_CATEGORIES, CHARGE_RECURRENCES } from "@/lib/constants";
import { Loader2 } from "lucide-react";

type ChargeFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    category: "rent" | "electricity" | "water" | "maintenance" | "fine" | "deposit" | "discount" | "other";
    description: string;
    amount: number;
    recurrence?: "monthly" | "one-time" | "quarterly" | "yearly";
    resident_id?: string | null;
    start_date?: string | null;
    end_date?: string | null;
  }) => Promise<void>;
  defaultResidentId?: string;
};

export function ChargeFormDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultResidentId,
}: ChargeFormDialogProps) {
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [recurrence, setRecurrence] = useState("monthly");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  function resetForm() {
    setCategory("");
    setDescription("");
    setAmount("");
    setRecurrence("monthly");
    setStartDate("");
    setEndDate("");
  }

  async function handleSubmit() {
    if (!category || !description || !amount) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        category: category as "rent" | "electricity" | "water" | "maintenance" | "fine" | "deposit" | "discount" | "other",
        description,
        amount: parseFloat(amount),
        recurrence: recurrence as "monthly" | "one-time" | "quarterly" | "yearly",
        resident_id: defaultResidentId ?? null,
        start_date: startDate || null,
        end_date: endDate || null,
      });
      resetForm();
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  const formContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Category *</Label>
        <Select value={category} onValueChange={(val) => setCategory(val ?? "")}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {CHARGE_CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="desc">Description *</Label>
        <Input
          id="desc"
          placeholder="e.g. Monthly Rent, Electricity Bill"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="amt">Amount (₹) *</Label>
        <Input
          id="amt"
          type="number"
          min={1}
          step={0.01}
          placeholder="e.g. 5000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Recurrence</Label>
        <Select value={recurrence} onValueChange={(val) => setRecurrence(val ?? "monthly")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CHARGE_RECURRENCES.map((r) => (
              <SelectItem key={r.value} value={r.value}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start">Start Date</Label>
          <Input id="start" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="end">End Date</Label>
          <Input id="end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => { resetForm(); onOpenChange(false); }}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting || !category || !description || !amount}>
          {isSubmitting ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
          ) : (
            "Create Charge"
          )}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Create Charge</SheetTitle>
            <SheetDescription>Add a reusable charge template.</SheetDescription>
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
          <DialogTitle>Create Charge</DialogTitle>
          <DialogDescription>Add a reusable charge template.</DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
