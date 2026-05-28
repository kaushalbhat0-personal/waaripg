export interface PilotOrganization {
  name: string;
  type: "pg" | "hostel";
  total_rooms: number;
  admin_email: string;
  admin_name: string;
}

export interface ProvisioningResult {
  success: boolean;
  organization_id?: string;
  admin_user_id?: string;
  errors: string[];
}

export interface BootstrapConfig {
  sample_residents: number;
  sample_rooms: number;
  sample_invoices: boolean;
  sample_gate_logs: boolean;
  sample_violations: boolean;
}
