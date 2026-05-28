import type { ViolationSeverity, ViolationType, EntryMethod } from "./index";

export const ENTRY_METHODS: { label: string; value: EntryMethod }[] = [
  { label: "Manual", value: "manual" },
  { label: "QR Code", value: "qr" },
  { label: "RFID", value: "rfid" },
  { label: "Biometric", value: "biometric" },
  { label: "Face Recognition", value: "face" },
];

export const VIOLATION_TYPES: { label: string; value: ViolationType }[] = [
  { label: "Late Entry", value: "late_entry" },
  { label: "Missing Checkout", value: "missing_checkout" },
  { label: "Unauthorized Access", value: "unauthorized_access" },
  { label: "Curfew Breach", value: "curfew_breach" },
  { label: "Repeat Offense", value: "repeat_offense" },
];

export const VIOLATION_SEVERITIES: { label: string; value: ViolationSeverity }[] = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Critical", value: "critical" },
];

export const ATTENDANCE_STATUSES: { label: string; value: string }[] = [
  { label: "Present", value: "present" },
  { label: "Absent", value: "absent" },
  { label: "Late", value: "late" },
  { label: "Excused", value: "excused" },
  { label: "Unknown", value: "unknown" },
];

export const RESIDENT_TYPES = [
  { label: "PG Resident", value: "pg" },
  { label: "Hostel Student", value: "hostel" },
  { label: "All", value: "all" },
] as const;

export const DEFAULT_CURFEW_PENALTY = 100;
