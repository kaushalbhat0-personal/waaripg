"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatPhone, formatTime } from "@/lib/formatters";
import {
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  User,
  Clock,
  GraduationCap,
  Users,
  Hash,
  BookOpen,
} from "lucide-react";
import type { StudentDetailDto } from "../types";

type StudentProfileCardProps = {
  student: StudentDetailDto;
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

export function StudentProfileCard({ student }: StudentProfileCardProps) {
  const statusVariant:
    | "default"
    | "secondary"
    | "destructive"
    | "outline" = student.status === "active"
    ? "default"
    : student.status === "inactive"
      ? "secondary"
      : "destructive";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{student.name}</CardTitle>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant="secondary">Hostel Student</Badge>
                <Badge variant={statusVariant}>
                  {student.status.charAt(0).toUpperCase() +
                    student.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailRow icon={Phone} label="Phone" value={student.phone ? formatPhone(student.phone) : null} />
            <DetailRow icon={Mail} label="Email" value={student.email} />
            <DetailRow icon={User} label="Gender" value={student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1) : null} />
            <DetailRow icon={Calendar} label="Date of Birth" value={student.date_of_birth ? formatDate(student.date_of_birth) : null} />
            <DetailRow icon={Calendar} label="Joining Date" value={student.joining_date ? formatDate(student.joining_date) : null} />
            <DetailRow icon={Hash} label="ID Proof" value={student.id_proof_type && student.id_proof_number ? `${student.id_proof_type.toUpperCase()}: ${student.id_proof_number}` : null} />
          </div>
        </CardContent>
      </Card>

      {(student.address || student.city || student.state || student.pincode) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailRow icon={MapPin} label="Address" value={student.address} />
              <DetailRow icon={MapPin} label="City" value={student.city} />
              <DetailRow icon={MapPin} label="State" value={student.state} />
              <DetailRow icon={Hash} label="Pincode" value={student.pincode} />
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Institution Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <DetailRow icon={Building2} label="Institution" value={student.institution_name} />
            <DetailRow icon={MapPin} label="Institution Address" value={student.institution_address} />
            <DetailRow icon={GraduationCap} label="Course" value={student.course} />
            <DetailRow icon={BookOpen} label="Year" value={student.year} />
            <DetailRow icon={Hash} label="Roll Number" value={student.roll_number} />
            <DetailRow icon={Clock} label="Curfew Time" value={student.curfew_time ? formatTime(student.curfew_time) : null} />
          </div>
        </CardContent>
      </Card>

      {(student.guardian_name || student.guardian_phone) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Guardian</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailRow icon={Users} label="Name" value={student.guardian_name} />
              <DetailRow icon={Phone} label="Phone" value={student.guardian_phone ? formatPhone(student.guardian_phone) : null} />
            </div>
          </CardContent>
        </Card>
      )}

      {student.emergency_contacts && student.emergency_contacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Emergency Contacts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {student.emergency_contacts.map((contact) => (
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

      {student.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {student.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
