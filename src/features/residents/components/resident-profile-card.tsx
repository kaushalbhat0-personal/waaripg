"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatPhone } from "@/lib/formatters";
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  User,
  Shield,
  Clock,
  GraduationCap,
  Users,
  Hash,
} from "lucide-react";
import type { ResidentDetailDto } from "../types";

type ResidentProfileCardProps = {
  resident: ResidentDetailDto;
};

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null | undefined;
}) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm break-words">{value}</p>
      </div>
    </div>
  );
}

export function ResidentProfileCard({ resident }: ResidentProfileCardProps) {
  const statusVariant:
    | "default"
    | "secondary"
    | "destructive"
    | "outline" = resident.status === "active"
    ? "default"
    : resident.status === "inactive"
      ? "secondary"
      : "destructive";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{resident.name}</CardTitle>
              <div className="mt-1 flex items-center gap-2">
                <Badge
                  variant={resident.type === "hostel" ? "secondary" : "outline"}
                >
                  {resident.type === "hostel" ? "Hostel Student" : "PG Resident"}
                </Badge>
                <Badge variant={statusVariant}>
                  {resident.status.charAt(0).toUpperCase() +
                    resident.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailRow icon={Phone} label="Phone" value={resident.phone ? formatPhone(resident.phone) : null} />
            <DetailRow icon={Mail} label="Email" value={resident.email} />
            <DetailRow icon={User} label="Gender" value={resident.gender ? resident.gender.charAt(0).toUpperCase() + resident.gender.slice(1) : null} />
            <DetailRow icon={Calendar} label="Date of Birth" value={resident.date_of_birth ? formatDate(resident.date_of_birth) : null} />
            <DetailRow icon={Calendar} label="Joining Date" value={resident.joining_date ? formatDate(resident.joining_date) : null} />
            <DetailRow icon={Shield} label="ID Proof" value={resident.id_proof_type && resident.id_proof_number ? `${resident.id_proof_type.toUpperCase()}: ${resident.id_proof_number}` : null} />
          </div>
        </CardContent>
      </Card>

      {(resident.address || resident.city || resident.state || resident.pincode) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailRow icon={MapPin} label="Address" value={resident.address} />
              <DetailRow icon={MapPin} label="City" value={resident.city} />
              <DetailRow icon={MapPin} label="State" value={resident.state} />
              <DetailRow icon={Hash} label="Pincode" value={resident.pincode} />
            </div>
          </CardContent>
        </Card>
      )}

      {resident.type === "hostel" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Institution Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailRow icon={Building2} label="Institution" value={resident.institution_name} />
              <DetailRow icon={MapPin} label="Institution Address" value={resident.institution_address} />
              <DetailRow icon={GraduationCap} label="Course" value={resident.course} />
              <DetailRow icon={Calendar} label="Year" value={resident.year} />
              <DetailRow icon={Hash} label="Roll Number" value={resident.roll_number} />
              <DetailRow icon={Clock} label="Curfew Time" value={resident.curfew_time} />
            </div>
          </CardContent>
        </Card>
      )}

      {resident.type === "pg" && resident.occupation && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Occupation</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailRow icon={Building2} label="Occupation" value={resident.occupation} />
          </CardContent>
        </Card>
      )}

      {(resident.guardian_name || resident.guardian_phone) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Guardian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailRow icon={Users} label="Name" value={resident.guardian_name} />
              <DetailRow icon={Phone} label="Phone" value={resident.guardian_phone ? formatPhone(resident.guardian_phone) : null} />
            </div>
          </CardContent>
        </Card>
      )}

      {resident.emergency_contacts && resident.emergency_contacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Emergency Contacts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {resident.emergency_contacts.map((contact) => (
              <div key={contact.id}>
                <div className="grid gap-2 sm:grid-cols-3">
                  <DetailRow icon={User} label="Name" value={contact.name} />
                  <DetailRow icon={Phone} label="Phone" value={formatPhone(contact.phone)} />
                  <DetailRow icon={Users} label="Relationship" value={contact.relationship} />
                </div>
                <Separator className="mt-3" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {resident.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {resident.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
