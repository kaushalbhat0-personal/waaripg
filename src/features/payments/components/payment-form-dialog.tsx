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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks";
import { PAYMENT_METHODS } from "@/lib/constants";
import { formatCurrency } from "@/lib/formatters";
import { Loader2, Plus, X } from "lucide-react";

type InvoiceOption = {
  id: string;
  invoice_number: string;
  total_amount: number;
  balance: number;
};

type PaymentFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    resident_id: string;
    amount: number;
    payment_method_id: string;
    reference_number?: string | null;
    allocation?: { invoice_id: string; amount: number }[];
    notes?: string | null;
  }) => Promise<void>;
  defaultResidentId?: string;
  defaultInvoiceId?: string;
  invoices?: InvoiceOption[];
};

export function PaymentFormDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultResidentId,
  defaultInvoiceId,
  invoices = [],
}: PaymentFormDialogProps) {
  function handleOpenChange(newOpen: boolean) {
    if (!newOpen) {
      setAmount("");
      setPaymentMethodId("");
      setReferenceNumber("");
      setNotes("");
      setSelectedInvoiceId("");
      setAllocAmount("");
      setAllocations([]);
    }
    return onOpenChange(newOpen);
  }
  const isMobile = useIsMobile();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(defaultInvoiceId ?? "");
  const [allocAmount, setAllocAmount] = useState("");
  const [allocations, setAllocations] = useState<{ invoice_id: string; amount: number }[]>([]);
  const [paymentMethods] = useState<{ id: string; code: string; name: string }[]>(
    () => PAYMENT_METHODS.map((pm, i) => ({ id: `pm-${i}`, code: pm.value, name: pm.label })),
  );

  function addAllocation() {
    if (!selectedInvoiceId || !allocAmount) return;
    const numAmount = parseFloat(allocAmount);
    if (numAmount <= 0) return;
    setAllocations([...allocations, { invoice_id: selectedInvoiceId, amount: numAmount }]);
    setSelectedInvoiceId("");
    setAllocAmount("");
  }

  function removeAllocation(index: number) {
    setAllocations(allocations.filter((_, i) => i !== index));
  }

  const remainingInvoices = invoices.filter(
    (inv) => !allocations.find((a) => a.invoice_id === inv.id),
  );

  function canSubmit() {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return false;
    if (!paymentMethodId) return false;
    if (!defaultResidentId) return false;
    return true;
  }

  async function handleSubmit() {
    if (!canSubmit()) return;
    setIsSubmitting(true);
    try {
      const allocs = allocations.length > 0 ? allocations : undefined;
      await onSubmit({
        resident_id: defaultResidentId!,
        amount: parseFloat(amount),
        payment_method_id: paymentMethodId,
        reference_number: referenceNumber || null,
        allocation: allocs,
        notes: notes || null,
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  const formContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount">Amount (₹) *</Label>
        <Input
          id="amount"
          type="number"
          min={1}
          step={0.01}
          placeholder="e.g. 5000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="method">Payment Method *</Label>
        <Select value={paymentMethodId} onValueChange={(val) => setPaymentMethodId(val ?? "")}>
          <SelectTrigger>
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            {paymentMethods.map((pm) => (
              <SelectItem key={pm.code} value={pm.code}>
                {pm.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reference">Reference Number (optional)</Label>
        <Input
          id="reference"
          placeholder="UPI txn ID, cheque no., etc."
          value={referenceNumber}
          onChange={(e) => setReferenceNumber(e.target.value)}
        />
      </div>

      {invoices.length > 0 && (
        <div className="space-y-2">
          <Label>Allocate to Invoices (optional)</Label>
          {allocations.length > 0 && (
            <div className="space-y-1">
              {allocations.map((alloc, i) => {
                const inv = invoices.find((inv) => inv.id === alloc.invoice_id);
                return (
                  <div key={i} className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
                    <span>{inv?.invoice_number ?? alloc.invoice_id.slice(0, 8)}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{formatCurrency(alloc.amount)}</span>
                      <button onClick={() => removeAllocation(i)} className="text-muted-foreground hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Select value={selectedInvoiceId} onValueChange={(val) => setSelectedInvoiceId(val ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select invoice" />
                </SelectTrigger>
                <SelectContent>
                  {remainingInvoices.map((inv) => (
                    <SelectItem key={inv.id} value={inv.id}>
                      {inv.invoice_number} ({formatCurrency(inv.balance)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-28 space-y-1">
              <Input
                type="number"
                min={0.01}
                step={0.01}
                placeholder="Amount"
                value={allocAmount}
                onChange={(e) => setAllocAmount(e.target.value)}
              />
            </div>
            <Button type="button" size="icon" variant="outline" onClick={addAllocation}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Textarea
          id="notes"
          placeholder="Payment notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting || !canSubmit()}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Recording...
            </>
          ) : (
            "Record Payment"
          )}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Record Payment</SheetTitle>
            <SheetDescription>Record a payment received from the resident.</SheetDescription>
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
          <DialogTitle>Record Payment</DialogTitle>
          <DialogDescription>Record a payment received from the resident.</DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
