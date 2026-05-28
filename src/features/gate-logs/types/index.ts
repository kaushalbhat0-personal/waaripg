export type EntryType = "entry" | "exit";
export type EntryMethod = "manual" | "qr" | "rfid" | "biometric" | "face";

export type GateLog = {
  id: string;
  organization_id: string | null;
  resident_id: string;
  entry_type: EntryType;
  timestamp: string;
  is_late: boolean;
  verified_by: string | null;
  verified_by_name: string | null;
  method: EntryMethod;
  notes: string | null;
  override_reason: string | null;
  overridden_by: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type GateLogWithResident = GateLog & {
  resident: { id: string; name: string; phone: string; type: string } | null;
};

export type CurfewRule = {
  id: string;
  organization_id: string | null;
  name: string;
  resident_type: "pg" | "hostel" | "all" | null;
  room_type: string | null;
  property_id: string | null;
  curfew_time: string;
  grace_period_minutes: number;
  applicable_days: number[];
  is_active: boolean;
  penalty_amount: number | null;
  created_at: string;
  updated_at: string;
};

export type AttendanceStatus = "present" | "absent" | "late" | "excused" | "unknown";

export type AttendanceSnapshot = {
  id: string;
  organization_id: string | null;
  resident_id: string;
  snapshot_date: string;
  status: AttendanceStatus;
  first_entry_at: string | null;
  last_exit_at: string | null;
  is_late: boolean;
  late_minutes: number | null;
  violation_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type AttendanceWithResident = AttendanceSnapshot & {
  resident: { id: string; name: string; phone: string } | null;
};

export type ViolationType =
  | "late_entry"
  | "missing_checkout"
  | "unauthorized_access"
  | "curfew_breach"
  | "repeat_offense";

export type ViolationSeverity = "low" | "medium" | "high" | "critical";

export type ViolationLog = {
  id: string;
  organization_id: string | null;
  resident_id: string;
  violation_type: ViolationType;
  severity: ViolationSeverity;
  gate_log_id: string | null;
  description: string;
  detected_at: string;
  penalty_amount: number | null;
  resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  notes: string | null;
  created_at: string;
};

export type ViolationWithResident = ViolationLog & {
  resident: { id: string; name: string; phone: string } | null;
};

export type GateDashboard = {
  currently_inside: number;
  currently_outside: number;
  today_entries: number;
  today_exits: number;
  late_entries_today: number;
  violations_today: number;
  active_occupancy: number;
  total_capacity: number;
};

export type ResidentPresence = {
  resident_id: string;
  name: string;
  phone: string;
  type: string;
  is_inside: boolean;
  last_entry: string | null;
  last_exit: string | null;
  is_late: boolean;
};
