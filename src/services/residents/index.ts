import type { ActionResponse, PaginatedResponse, Resident } from "@/types";
import * as residentRepo from "@/repositories/residents";
import type { FindAllParams } from "@/repositories/residents";
import {
  createResidentSchema,
  updateResidentSchema,
} from "@/features/residents/schemas";
import type {
  CreateResidentInput,
  UpdateResidentInput,
  ResidentDetailDto,
} from "@/features/residents/types";

function toDto(resident: Resident): ResidentDetailDto {
  return resident as unknown as ResidentDetailDto;
}

export async function getResidents(
  params: FindAllParams = {},
): Promise<ActionResponse<PaginatedResponse<ResidentDetailDto>>> {
  try {
    const { data, error, count } = await residentRepo.findAll(params);

    if (error) {
      return {
        success: false,
        error: { code: "DB_ERROR", message: error.message },
      };
    }

    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 10;

    return {
      success: true,
      data: {
        data: (data ?? []).map((r) => toDto(r as Resident)),
        total: count ?? 0,
        page,
        pageSize,
        totalPages: Math.ceil((count ?? 0) / pageSize),
      },
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch residents",
      },
    };
  }
}

export async function getResidentById(
  id: string,
): Promise<ActionResponse<ResidentDetailDto | null>> {
  try {
    const { data, error } = await residentRepo.findById(id);

    if (error) {
      return {
        success: false,
        error: { code: "DB_ERROR", message: error.message },
      };
    }

    return {
      success: true,
      data: data ? toDto(data as Resident) : null,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to fetch resident",
      },
    };
  }
}

export async function createResident(
  input: CreateResidentInput,
): Promise<ActionResponse<ResidentDetailDto>> {
  const validated = createResidentSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: validated.error.flatten().fieldErrors as Record<string, string[]>,
      },
    };
  }

  const data = validated.data;

  // Check duplicate phone
  const existingPhone = await residentRepo.findByPhone(data.phone);
  if (existingPhone.data) {
    return {
      success: false,
      error: {
        code: "DUPLICATE_PHONE",
        message: "A resident with this phone number already exists",
      },
    };
  }

  // Check duplicate email if provided
  if (data.email) {
    const existingEmail = await residentRepo.findByEmail(data.email);
    if (existingEmail.data) {
      return {
        success: false,
        error: {
          code: "DUPLICATE_EMAIL",
          message: "A resident with this email already exists",
        },
      };
    }
  }

  // Validate hostel-specific fields
  if (data.type === "hostel" && !data.institution_name) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Institution name is required for hostel students",
        details: { institution_name: ["Required for hostel students"] },
      },
    };
  }

  try {
    const residentPayload: Record<string, unknown> = {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      type: data.type,
      gender: data.gender || null,
      date_of_birth: data.date_of_birth || null,
      joining_date: data.joining_date || new Date().toISOString().split("T")[0],
      address: data.address || null,
      city: data.city || null,
      state: data.state || null,
      pincode: data.pincode || null,
      id_proof_type: data.id_proof_type || null,
      id_proof_number: data.id_proof_number || null,
      occupation: data.occupation || null,
      institution_name: data.institution_name || null,
      institution_address: data.institution_address || null,
      guardian_name: data.guardian_name || null,
      guardian_phone: data.guardian_phone || null,
      roll_number: data.roll_number || null,
      course: data.course || null,
      year: data.year || null,
      curfew_time: data.curfew_time || null,
      notes: data.notes || null,
    };

    const contactsPayload = data.emergency_contacts?.map((c) => ({
      name: c.name,
      phone: c.phone,
      relationship: c.relationship || null,
      is_primary: c.is_primary ?? false,
    }));

    const { data: resident, error } = await residentRepo.create({
      resident: residentPayload,
      emergencyContacts: contactsPayload,
    });

    if (error || !resident) {
      return {
        success: false,
        error: { code: "DB_ERROR", message: error?.message ?? "Failed to create resident" },
      };
    }

    return {
      success: true,
      data: toDto(resident),
      message: "Resident created successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to create resident",
      },
    };
  }
}

export async function updateResident(
  id: string,
  input: UpdateResidentInput,
): Promise<ActionResponse<ResidentDetailDto>> {
  const validated = updateResidentSchema.safeParse(input);

  if (!validated.success) {
    return {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid input",
        details: validated.error.flatten().fieldErrors as Record<string, string[]>,
      },
    };
  }

  // Verify resident exists
  const existingResult = await residentRepo.findById(id);
  const existingData = existingResult.data as Record<string, unknown> | null;
  if (existingResult.error || !existingData) {
    return {
      success: false,
      error: { code: "NOT_FOUND", message: "Resident not found" },
    };
  }

  const data = validated.data;

  // Check duplicate phone (if changed)
  if (data.phone && data.phone !== existingData.phone) {
    const phoneCheck = await residentRepo.findByPhone(data.phone);
    if (phoneCheck.data) {
      return {
        success: false,
        error: {
          code: "DUPLICATE_PHONE",
          message: "Another resident already uses this phone number",
        },
      };
    }
  }

  // Check duplicate email (if changed)
  if (data.email && data.email !== existingData.email) {
    const emailCheck = await residentRepo.findByEmail(data.email);
    if (emailCheck.data) {
      return {
        success: false,
        error: {
          code: "DUPLICATE_EMAIL",
          message: "Another resident already uses this email",
        },
      };
    }
  }

  try {
    const residentPayload: Record<string, unknown> = {};
    const fields: (keyof typeof data)[] = [
      "name", "phone", "email", "gender", "date_of_birth",
      "joining_date", "address", "city", "state", "pincode",
      "id_proof_type", "id_proof_number", "occupation",
      "institution_name", "institution_address", "guardian_name",
      "guardian_phone", "roll_number", "course", "year",
      "curfew_time", "notes",
    ];

    for (const field of fields) {
      if (field in data) {
        const value = data[field as keyof typeof data];
        residentPayload[field] = value ?? null;
      }
    }

    const contactsPayload = data.emergency_contacts?.map((c) => ({
      name: c.name,
      phone: c.phone,
      relationship: c.relationship || null,
      is_primary: c.is_primary ?? false,
    }));

    const { data: resident, error } = await residentRepo.update(id, {
      resident: residentPayload,
      emergencyContacts: contactsPayload,
    });

    if (error || !resident) {
      return {
        success: false,
        error: { code: "DB_ERROR", message: error?.message ?? "Failed to update resident" },
      };
    }

    return {
      success: true,
      data: toDto(resident),
      message: "Resident updated successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to update resident",
      },
    };
  }
}

export async function archiveResident(
  id: string,
): Promise<ActionResponse<void>> {
  try {
    const { data: resident } = await residentRepo.findById(id);

    if (!resident) {
      return {
        success: false,
        error: { code: "NOT_FOUND", message: "Resident not found" },
      };
    }

    if ((resident as Record<string, unknown>).status === "terminated") {
      return {
        success: false,
        error: {
          code: "ALREADY_ARCHIVED",
          message: "Resident is already archived",
        },
      };
    }

    const { error } = await residentRepo.archive(id);

    if (error) {
      return {
        success: false,
        error: { code: "DB_ERROR", message: error.message },
      };
    }

    return {
      success: true,
      data: undefined,
      message: "Resident archived successfully",
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Failed to archive resident",
      },
    };
  }
}

export async function searchResidents(
  query: string,
): Promise<
  ActionResponse<
    Array<{ id: string; name: string; phone: string; type: string }>
  >
> {
  try {
    const { data, error } = await residentRepo.findAll({
      search: query,
      pageSize: 20,
    });

    if (error) {
      return {
        success: false,
        error: { code: "DB_ERROR", message: error.message },
      };
    }

    return {
      success: true,
      data: (data ?? []).map((r) => {
        const row = r as Record<string, unknown>;
        return {
          id: row.id as string,
          name: row.name as string,
          phone: row.phone as string,
          type: row.type as string,
        };
      }),
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Search failed",
      },
    };
  }
}
