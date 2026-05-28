import type { RoleName, AuditAction } from "./index";

export const ROLE_NAMES: { label: string; value: RoleName }[] = [
  { label: "Admin", value: "admin" },
  { label: "Manager", value: "manager" },
  { label: "Accountant", value: "accountant" },
  { label: "Guard", value: "guard" },
];

export const AUDIT_ACTIONS: { label: string; value: AuditAction }[] = [
  { label: "Resident Created", value: "resident.created" },
  { label: "Resident Updated", value: "resident.updated" },
  { label: "Resident Archived", value: "resident.archived" },
  { label: "Room Created", value: "room.created" },
  { label: "Room Updated", value: "room.updated" },
  { label: "Room Archived", value: "room.archived" },
  { label: "Bed Created", value: "bed.created" },
  { label: "Bed Updated", value: "bed.updated" },
  { label: "Bed Status Changed", value: "bed.status_changed" },
  { label: "Allocation Created", value: "allocation.created" },
  { label: "Allocation Updated", value: "allocation.updated" },
  { label: "Allocation Transferred", value: "allocation.transferred" },
  { label: "Allocation Ended", value: "allocation.ended" },
  { label: "Invoice Created", value: "invoice.created" },
  { label: "Invoice Updated", value: "invoice.updated" },
  { label: "Invoice Cancelled", value: "invoice.cancelled" },
  { label: "Payment Recorded", value: "payment.recorded" },
  { label: "Payment Refunded", value: "payment.refunded" },
  { label: "Charge Created", value: "charge.created" },
  { label: "Charge Updated", value: "charge.updated" },
  { label: "Gate Log Created", value: "gate_log.created" },
  { label: "Gate Log Verified", value: "gate_log.verified" },
  { label: "Role Assigned", value: "role.assigned" },
  { label: "Role Revoked", value: "role.revoked" },
  { label: "Permission Updated", value: "permission.updated" },
  { label: "Settings Updated", value: "settings.updated" },
  { label: "User Login", value: "user.login" },
  { label: "User Logout", value: "user.logout" },
];

export const PERMISSION_MODULES = [
  "residents",
  "rooms",
  "beds",
  "allocations",
  "invoices",
  "payments",
  "charges",
  "gate-logs",
  "rbac",
  "settings",
] as const;

export const TEMPLATE_ACTIONS: Record<string, { action: AuditAction; label: string; icon: string; color: string }> = {
  "resident.created": { action: "resident.created", label: "Resident Created", icon: "UserPlus", color: "green" },
  "resident.updated": { action: "resident.updated", label: "Resident Updated", icon: "UserCheck", color: "blue" },
  "resident.archived": { action: "resident.archived", label: "Resident Archived", icon: "UserX", color: "red" },
  "allocation.transferred": { action: "allocation.transferred", label: "Resident Transferred", icon: "MoveRight", color: "amber" },
  "payment.recorded": { action: "payment.recorded", label: "Payment Recorded", icon: "Wallet", color: "green" },
  "payment.refunded": { action: "payment.refunded", label: "Refund Issued", icon: "Undo2", color: "red" },
  "invoice.created": { action: "invoice.created", label: "Invoice Generated", icon: "FileText", color: "blue" },
};
