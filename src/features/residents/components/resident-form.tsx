"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/shared/forms";
import { createResidentSchema } from "../schemas";
import type { CreateResidentInput } from "../types";
import type { z } from "zod";

type FormValues = z.input<typeof createResidentSchema>;

type ResidentFormProps = {
  defaultValues?: CreateResidentInput;
  onSubmit: (data: CreateResidentInput) => Promise<void>;
  isSubmitting: boolean;
  defaultType?: "pg" | "hostel";
};

export function ResidentForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  defaultType,
}: ResidentFormProps) {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createResidentSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      phone: defaultValues?.phone ?? "",
      email: defaultValues?.email ?? "",
      type: defaultValues?.type ?? defaultType ?? "pg",
      gender: defaultValues?.gender ?? null,
      date_of_birth: defaultValues?.date_of_birth ?? null,
      joining_date: defaultValues?.joining_date ?? null,
      address: defaultValues?.address ?? null,
      city: defaultValues?.city ?? null,
      state: defaultValues?.state ?? null,
      pincode: defaultValues?.pincode ?? null,
      id_proof_type: defaultValues?.id_proof_type ?? null,
      id_proof_number: defaultValues?.id_proof_number ?? null,
      occupation: defaultValues?.occupation ?? null,
      institution_name: defaultValues?.institution_name ?? null,
      institution_address: defaultValues?.institution_address ?? null,
      guardian_name: defaultValues?.guardian_name ?? null,
      guardian_phone: defaultValues?.guardian_phone ?? null,
      roll_number: defaultValues?.roll_number ?? null,
      course: defaultValues?.course ?? null,
      year: defaultValues?.year ?? null,
      curfew_time: defaultValues?.curfew_time ?? null,
      notes: defaultValues?.notes ?? null,
      emergency_contacts: defaultValues?.emergency_contacts ?? [],
    },
  });

  const residentType = useWatch({ control, name: "type" });
  const emergencyContacts = useWatch({ control, name: "emergency_contacts" }) ?? [];
  const gender = useWatch({ control, name: "gender" });
  const idProofType = useWatch({ control, name: "id_proof_type" });
  const year = useWatch({ control, name: "year" });

  function addEmergencyContact() {
    setValue("emergency_contacts", [
      ...emergencyContacts,
      { name: "", phone: "", relationship: "", is_primary: false },
    ]);
  }

  function removeEmergencyContact(index: number) {
    const updated = emergencyContacts.filter((_, i) => i !== index);
    setValue("emergency_contacts", updated);
  }

  async function onFormSubmit(values: FormValues) {
    await onSubmit(values as CreateResidentInput);
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Personal Information
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Full Name" error={errors.name} required>
            <Input placeholder="Enter full name" {...register("name")} />
          </FormField>
          <FormField label="Phone" error={errors.phone} required>
            <Input placeholder="+91 98765 43210" {...register("phone")} />
          </FormField>
          <FormField label="Email" error={errors.email}>
            <Input
              type="email"
              placeholder="resident@example.com"
              {...register("email")}
            />
          </FormField>
          {!defaultType && (
            <FormField label="Resident Type" required>
              <Select
                value={residentType}
                onValueChange={(value) =>
                  setValue("type", (value ?? "pg") as "pg" | "hostel")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pg">PG Resident</SelectItem>
                  <SelectItem value="hostel">Hostel Student</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          )}
          <FormField label="Gender">
            <Select
              value={gender ?? ""}
              onValueChange={(value) =>
                setValue("gender", (value || null) as "male" | "female" | "other" | null)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Date of Birth">
            <Input type="date" {...register("date_of_birth")} />
          </FormField>
          <FormField label="Joining Date">
            <Input type="date" {...register("joining_date")} />
          </FormField>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Address
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Address" className="sm:col-span-2">
            <Textarea
              placeholder="Full address"
              className="resize-none"
              {...register("address")}
            />
          </FormField>
          <FormField label="City">
            <Input placeholder="City" {...register("city")} />
          </FormField>
          <FormField label="State">
            <Input placeholder="State" {...register("state")} />
          </FormField>
          <FormField label="Pincode">
            <Input placeholder="6-digit pincode" {...register("pincode")} />
          </FormField>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          ID Proof
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="ID Proof Type">
            <Select
              value={idProofType ?? ""}
              onValueChange={(value) =>
                setValue("id_proof_type", (value || null) as "aadhar" | "pan" | "voter_id" | "driving_license" | "passport" | "other" | null)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select ID type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aadhar">Aadhar Card</SelectItem>
                <SelectItem value="pan">PAN Card</SelectItem>
                <SelectItem value="voter_id">Voter ID</SelectItem>
                <SelectItem value="driving_license">Driving License</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="ID Proof Number">
            <Input placeholder="ID number" {...register("id_proof_number")} />
          </FormField>
        </div>
      </div>

      {residentType === "hostel" && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Institution & Guardian
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Institution Name" required>
              <Input
                placeholder="College / institute name"
                {...register("institution_name")}
              />
            </FormField>
            <FormField label="Institution Address">
              <Input
                placeholder="Institution address"
                {...register("institution_address")}
              />
            </FormField>
            <FormField label="Roll Number">
              <Input placeholder="Roll number" {...register("roll_number")} />
            </FormField>
            <FormField label="Course">
              <Input placeholder="Course name" {...register("course")} />
            </FormField>
            <FormField label="Year">
              <Select
                value={year ?? ""}
                onValueChange={(value) => setValue("year", value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st Year">1st Year</SelectItem>
                  <SelectItem value="2nd Year">2nd Year</SelectItem>
                  <SelectItem value="3rd Year">3rd Year</SelectItem>
                  <SelectItem value="4th Year">4th Year</SelectItem>
                  <SelectItem value="Final Year">Final Year</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
            <FormField label="Guardian Name">
              <Input
                placeholder="Guardian name"
                {...register("guardian_name")}
              />
            </FormField>
            <FormField label="Guardian Phone">
              <Input
                placeholder="Guardian phone"
                {...register("guardian_phone")}
              />
            </FormField>
            <FormField label="Curfew Time">
              <Input type="time" {...register("curfew_time")} />
            </FormField>
          </div>
        </div>
      )}

      {residentType === "pg" && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Occupation
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Occupation">
              <Input
                placeholder="Job / business"
                {...register("occupation")}
              />
            </FormField>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Emergency Contacts
          </h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addEmergencyContact}
          >
            <Plus className="mr-1 h-3 w-3" />
            Add Contact
          </Button>
        </div>
        {emergencyContacts.map((_, index) => (
          <div
            key={index}
            className="grid gap-4 rounded-lg border p-4 sm:grid-cols-3"
          >
            <FormField label="Name">
              <Input
                placeholder="Contact name"
                {...register(`emergency_contacts.${index}.name` as const)}
              />
            </FormField>
            <FormField label="Phone">
              <Input
                placeholder="Contact phone"
                {...register(`emergency_contacts.${index}.phone` as const)}
              />
            </FormField>
            <div className="flex items-end gap-2">
              <FormField label="Relationship" className="flex-1">
                <Input
                  placeholder="e.g. Father, Spouse"
                  {...register(`emergency_contacts.${index}.relationship` as const)}
                />
              </FormField>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mb-0.5 h-8 w-8 text-destructive"
                onClick={() => removeEmergencyContact(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Notes
        </h3>
        <FormField label="Additional Notes">
          <Textarea
            placeholder="Any additional information..."
            className="resize-none"
            {...register("notes")}
          />
        </FormField>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {defaultValues ? "Update Resident" : "Create Resident"}
        </Button>
      </div>
    </form>
  );
}
