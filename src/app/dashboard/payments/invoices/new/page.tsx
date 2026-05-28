"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/shared/page/page-header";
import { PageContainer } from "@/shared/page/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { generateInvoiceAction } from "@/features/payments/actions";
import { getResidentsAction } from "@/features/residents/actions";
import { CHARGE_CATEGORIES } from "@/lib/constants";
import { Loader2, Plus, X, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type LineItem = {
  category: string;
  description: string;
  quantity: number;
  unit_amount: number;
};

type ResidentOption = {
  id: string;
  name: string;
  phone: string;
  type: string;
};

export default function NewInvoicePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [residentSearch, setResidentSearch] = useState("");
  const [searchResults, setSearchResults] = useState<ResidentOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResident, setSelectedResident] = useState<ResidentOption | null>(null);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split("T")[0];
  });
  const [periodStart, setPeriodStart] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split("T")[0];
  });
  const [periodEnd, setPeriodEnd] = useState(() => new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { category: "rent", description: "Monthly Rent", quantity: 1, unit_amount: 0 },
  ]);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleSearch(value: string) {
    setResidentSearch(value);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (value.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const result = await getResidentsAction({ search: value, pageSize: 10 });
      if (result.success) {
        setSearchResults(result.data.data.map((r) => ({
          id: r.id,
          name: r.name,
          phone: r.phone,
          type: r.type,
        })));
      }
      setIsSearching(false);
    }, 300);
  }

  function addItem() {
    setItems([...items, { category: "other", description: "", quantity: 1, unit_amount: 0 }]);
  }

  function removeItem(index: number) {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof LineItem, value: string | number | null) {
    if (value === null) return;
    const updated = [...items];
    const item = { ...updated[index] };
    if (field === "category") { item.category = value as string; }
    else if (field === "description") { item.description = value as string; }
    else if (field === "quantity") { item.quantity = value as number; }
    else if (field === "unit_amount") { item.unit_amount = value as number; }
    updated[index] = item as LineItem;
    setItems(updated);
  }

  function getSubtotal() {
    return items.reduce((sum, item) => sum + item.quantity * item.unit_amount, 0);
  }

  async function handleSubmit() {
    if (!selectedResident) {
      toast.error("Please select a resident");
      return;
    }
    if (items.some((item) => !item.description)) {
      toast.error("All line items need a description");
      return;
    }
    if (items.some((item) => item.unit_amount <= 0)) {
      toast.error("All line items need a positive amount");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await generateInvoiceAction({
        resident_id: selectedResident!.id,
        due_date: dueDate!,
        period_start: periodStart!,
        period_end: periodEnd!,
        items: items.map((item) => ({
          category: item.category as "rent" | "electricity" | "water" | "maintenance" | "fine" | "deposit" | "discount" | "other",
          description: item.description,
          quantity: item.quantity,
          unit_amount: item.unit_amount,
        })),
        notes: notes || null,
      });

      if (result.success) {
        toast.success("Invoice generated successfully");
        router.push(`/dashboard/payments/invoices/${result.data.id}`);
      } else {
        toast.error(result.error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageContainer>
      <PageHeader
        title="New Invoice"
        description="Generate a new invoice for a resident"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Resident *</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or phone..."
                  value={residentSearch}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              {isSearching && <p className="text-xs text-muted-foreground">Searching...</p>}
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
                      <div className="text-xs text-muted-foreground">{r.phone} · {r.type === "hostel" ? "Hostel" : "PG"}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date *</Label>
                <Input id="due_date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="period_start">Period Start *</Label>
                <Input id="period_start" type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period_end">Period End *</Label>
              <Input id="period_end" type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Invoice notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <Label>Line Items</Label>
              <Button type="button" variant="outline" size="sm" onClick={addItem}>
                <Plus className="mr-1 h-3 w-3" />
                Add Item
              </Button>
            </div>

            {items.map((item, index) => (
              <div key={index} className="space-y-2 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Item {index + 1}</span>
                  {items.length > 1 && (
                    <button onClick={() => removeItem(index)} className="text-muted-foreground hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px]">Category</Label>
                    <Select
                      value={item.category}
                      onValueChange={(v) => updateItem(index, "category", v)}
                    >
                      <SelectTrigger className="h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CHARGE_CATEGORIES.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Description</Label>
                    <Input
                      className="h-8"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateItem(index, "description", e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px]">Qty</Label>
                    <Input
                      className="h-8"
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, "quantity", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Unit Amount (₹)</Label>
                    <Input
                      className="h-8"
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.unit_amount}
                      onChange={(e) => updateItem(index, "unit_amount", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                </div>
                <div className="text-right text-sm font-medium">
                  Total: ₹{(item.quantity * item.unit_amount).toFixed(2)}
                </div>
              </div>
            ))}

            <div className="flex justify-between border-t pt-3 text-lg font-bold">
              <span>Subtotal</span>
              <span>₹{getSubtotal().toFixed(2)}</span>
            </div>

            <Button
              className="w-full"
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedResident || items.some((i) => !i.description || i.unit_amount <= 0)}
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                "Generate Invoice"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
