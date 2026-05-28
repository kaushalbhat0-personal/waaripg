import type { Resident, EmergencyContact, ResidentDocument } from "@/types";

export type ResidentWithRelations = Resident & {
  emergency_contacts?: EmergencyContact[];
  documents?: ResidentDocument[];
};

export type ResidentListDto = Pick<
  Resident,
  | "id"
  | "name"
  | "phone"
  | "email"
  | "type"
  | "gender"
  | "status"
  | "joining_date"
  | "occupation"
  | "institution_name"
  | "city"
  | "created_at"
>;

export type ResidentDetailDto = ResidentWithRelations;

export type CreateResidentInput = {
  name: string;
  phone: string;
  email?: string | null;
  type: "pg" | "hostel";
  gender?: "male" | "female" | "other" | null;
  date_of_birth?: string | null;
  joining_date?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  id_proof_type?: "aadhar" | "pan" | "voter_id" | "driving_license" | "passport" | "other" | null;
  id_proof_number?: string | null;
  occupation?: string | null;
  institution_name?: string | null;
  institution_address?: string | null;
  guardian_name?: string | null;
  guardian_phone?: string | null;
  roll_number?: string | null;
  course?: string | null;
  year?: string | null;
  curfew_time?: string | null;
  notes?: string | null;
  emergency_contacts?: {
    name: string;
    phone: string;
    relationship?: string | null;
    is_primary?: boolean;
  }[];
};

export type UpdateResidentInput = Partial<CreateResidentInput>;

export type ResidentFilterParams = {
  search?: string;
  type?: "pg" | "hostel" | "";
  status?: "active" | "inactive" | "terminated" | "";
  gender?: "male" | "female" | "other" | "";
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: "asc" | "desc";
};
