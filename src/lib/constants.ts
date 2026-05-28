export const SITE_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "WaaRi PG";

export const SITE_DESCRIPTION = "PG & Hostel Management System";

export const ITEMS_PER_PAGE = 10;

export const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;

export const PAYMENT_METHODS = [
  { label: "Cash", value: "cash" },
  { label: "UPI", value: "upi" },
  { label: "Bank Transfer", value: "bank_transfer" },
  { label: "Card", value: "card" },
  { label: "Cheque", value: "cheque" },
] as const;

export const CHARGE_CATEGORIES = [
  { label: "Rent", value: "rent" },
  { label: "Electricity", value: "electricity" },
  { label: "Water", value: "water" },
  { label: "Maintenance", value: "maintenance" },
  { label: "Fine", value: "fine" },
  { label: "Deposit", value: "deposit" },
  { label: "Discount", value: "discount" },
  { label: "Other", value: "other" },
] as const;

export const CHARGE_RECURRENCES = [
  { label: "Monthly", value: "monthly" },
  { label: "One-Time", value: "one-time" },
  { label: "Quarterly", value: "quarterly" },
  { label: "Yearly", value: "yearly" },
] as const;

export const INVOICE_STATUSES = [
  { label: "Draft", value: "draft" },
  { label: "Pending", value: "pending" },
  { label: "Partial", value: "partial" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
  { label: "Cancelled", value: "cancelled" },
] as const;

export const ROOM_TYPES = [
  { label: "Single", value: "single" },
  { label: "Double", value: "double" },
  { label: "Triple", value: "triple" },
  { label: "Dormitory", value: "dormitory" },
] as const;

export const BED_STATUSES = [
  { label: "Available", value: "available" },
  { label: "Occupied", value: "occupied" },
  { label: "Reserved", value: "reserved" },
  { label: "Maintenance", value: "maintenance" },
] as const;

export const RESIDENT_TYPES = [
  { label: "PG Resident", value: "pg" },
  { label: "Hostel Student", value: "hostel" },
] as const;

export const ACCOMMODATION_STATUSES = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Terminated", value: "terminated" },
] as const;

export const ADMIN_ROLES = [
  { label: "Super Admin", value: "super_admin" },
  { label: "Admin", value: "admin" },
  { label: "Manager", value: "manager" },
] as const;

export const GATE_LOG_TYPES = [
  { label: "Entry", value: "entry" },
  { label: "Exit", value: "exit" },
] as const;
