import { z } from "zod";
import { phoneSchema, emailSchema, nameSchema } from "@/lib/validations";

const idProofTypes = ["aadhar", "pan", "voter_id", "driving_license", "passport", "other"] as const;
const genders = ["male", "female", "other"] as const;

const emergencyContactSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  relationship: z.string().max(100).optional().nullable(),
  is_primary: z.boolean().optional().default(false),
});

const residentBaseSchema = z.object({
  name: nameSchema,
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal("")),
  type: z.enum(["pg", "hostel"]),
  gender: z.enum(genders).optional().nullable(),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional().nullable(),
  joining_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(100).optional().nullable(),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode").optional().nullable(),
  id_proof_type: z.enum(idProofTypes).optional().nullable(),
  id_proof_number: z.string().max(50).optional().nullable(),
  occupation: z.string().max(100).optional().nullable(),
  institution_name: z.string().max(200).optional().nullable(),
  institution_address: z.string().max(500).optional().nullable(),
  guardian_name: z.string().max(100).optional().nullable(),
  guardian_phone: phoneSchema.optional().nullable(),
  roll_number: z.string().max(50).optional().nullable(),
  course: z.string().max(100).optional().nullable(),
  year: z.string().max(50).optional().nullable(),
  curfew_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)").optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  emergency_contacts: z.array(emergencyContactSchema).max(3).optional(),
});

export const createResidentSchema = residentBaseSchema.refine(
  (data) => {
    if (data.type === "hostel") {
      return !!data.institution_name;
    }
    return true;
  },
  {
    message: "Institution name is required for hostel students",
    path: ["institution_name"],
  },
);

export const updateResidentSchema = residentBaseSchema.partial();

export const residentFilterSchema = z.object({
  search: z.string().max(200).optional(),
  type: z.enum(["pg", "hostel"]).optional(),
  status: z.enum(["active", "inactive", "terminated"]).optional(),
  gender: z.enum(genders).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).optional(),
});

export type CreateResidentSchema = z.infer<typeof createResidentSchema>;
export type UpdateResidentSchema = z.infer<typeof updateResidentSchema>;
export type ResidentFilterSchema = z.infer<typeof residentFilterSchema>;
