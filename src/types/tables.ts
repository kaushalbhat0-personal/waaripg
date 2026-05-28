export type ResidentType = "pg" | "hostel";
export type AccommodationStatus = "active" | "inactive" | "terminated";
export type Gender = "male" | "female" | "other";
export type IdProofType = "aadhar" | "pan" | "voter_id" | "driving_license" | "passport" | "other";

export type RoomType = "single" | "double" | "triple" | "dormitory";
export type BedStatus = "available" | "occupied" | "reserved" | "maintenance";

export type Resident = {
  id: string;
  organization_id: string | null;
  name: string;
  phone: string;
  email: string | null;
  photo_url: string | null;
  type: ResidentType;
  gender: Gender | null;
  date_of_birth: string | null;
  joining_date: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  id_proof_type: IdProofType | null;
  id_proof_number: string | null;
  occupation: string | null;
  institution_name: string | null;
  institution_address: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  roll_number: string | null;
  course: string | null;
  year: string | null;
  curfew_time: string | null;
  status: AccommodationStatus;
  notes: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type EmergencyContact = {
  id: string;
  resident_id: string;
  name: string;
  phone: string;
  relationship: string | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export type ResidentDocument = {
  id: string;
  resident_id: string;
  document_type: string;
  document_url: string;
  document_name: string | null;
  uploaded_at: string;
};

export type Property = {
  id: string;
  organization_id: string | null;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type Floor = {
  id: string;
  property_id: string;
  floor_number: number;
  name: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type Room = {
  id: string;
  property_id: string | null;
  floor_id: string | null;
  organization_id: string | null;
  room_number: string;
  type: RoomType;
  capacity: number;
  rent_amount: number;
  is_active: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type Bed = {
  id: string;
  room_id: string;
  bed_number: string;
  status: BedStatus;
  created_at: string;
  updated_at: string;
};

export type Allocation = {
  id: string;
  resident_id: string;
  bed_id: string;
  room_id: string;
  check_in_date: string;
  check_out_date: string | null;
  rent_amount: number;
  security_deposit: number;
  is_active: boolean;
  transferred_from_id: string | null;
  transferred_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type InvoiceStatus = "draft" | "pending" | "partial" | "paid" | "overdue" | "cancelled";
export type ChargeCategory = "rent" | "electricity" | "water" | "maintenance" | "fine" | "deposit" | "discount" | "other";
export type ChargeRecurrence = "monthly" | "one-time" | "quarterly" | "yearly";

export type Invoice = {
  id: string;
  resident_id: string;
  allocation_id: string | null;
  invoice_number: string;
  status: InvoiceStatus;
  due_date: string;
  period_start: string;
  period_end: string;
  subtotal: number;
  discount_amount: number;
  discount_reason: string | null;
  total_amount: number;
  paid_amount: number;
  balance: number;
  notes: string | null;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type InvoiceItem = {
  id: string;
  invoice_id: string;
  charge_id: string | null;
  category: ChargeCategory;
  description: string;
  quantity: number;
  unit_amount: number;
  total_amount: number;
  created_at: string;
};

export type PaymentMethod = {
  id: string;
  code: string;
  name: string;
  is_active: boolean;
  created_at: string;
};

export type Payment = {
  id: string;
  resident_id: string;
  payment_date: string;
  amount: number;
  payment_method_id: string;
  reference_number: string | null;
  receipt_number: string | null;
  notes: string | null;
  is_refund: boolean;
  refunds_payment_id: string | null;
  organization_id: string | null;
  created_at: string;
};

export type PaymentAllocation = {
  id: string;
  payment_id: string;
  invoice_id: string;
  amount: number;
  created_at: string;
};

export type Charge = {
  id: string;
  resident_id: string | null;
  allocation_id: string | null;
  category: ChargeCategory;
  description: string;
  amount: number;
  recurrence: ChargeRecurrence;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type GateLog = {
  id: string;
  resident_id: string;
  entry_type: "entry" | "exit";
  timestamp: string;
  is_late: boolean;
  verified_by: string | null;
  notes: string | null;
  created_at: string;
};

export type LateEntry = {
  id: string;
  resident_id: string;
  entry_time: string;
  reason: string;
  approved_by: string | null;
  penalty_amount: number | null;
  created_at: string;
};

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "super_admin" | "admin" | "manager";
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
};
