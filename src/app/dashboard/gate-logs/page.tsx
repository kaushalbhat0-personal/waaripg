"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/shared/page/page-header";
import { PageContainer } from "@/shared/page/page-container";
import { GateStats, QuickCheckInOut, ViolationsTable, AttendanceTimeline } from "@/features/gate-logs/components";
import {
  getGateDashboardAction,
  getResidentPresenceAction,
  checkInResidentAction,
  checkOutResidentAction,
  getViolationsAction,
  getAttendanceAction,
} from "@/features/gate-logs/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CalendarDays } from "lucide-react";
import { LoadingState } from "@/shared/feedback";
import type {
  GateDashboard,
  ResidentPresence,
  ViolationWithResident,
  AttendanceWithResident,
} from "@/features/gate-logs/types";
import type {
  ViolationFilterParams,
  AttendanceFilterParams,
} from "@/features/gate-logs/schemas";

export default function GateLogsPage() {
  const [dashboard, setDashboard] = useState<GateDashboard | null>(null);
  const [residents, setResidents] = useState<ResidentPresence[]>([]);
  const [violations, setViolations] = useState<ViolationWithResident[]>([]);
  const [violationTotal, setViolationTotal] = useState(0);
  const [violationPage, setViolationPage] = useState(1);
  const [attendance, setAttendance] = useState<AttendanceWithResident[]>([]);
  const [attendanceTotal, setAttendanceTotal] = useState(0);
  const [attendancePage, setAttendancePage] = useState(1);
  const [activeTab, setActiveTab] = useState("violations");
  const [violationsLoading, setViolationsLoading] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      getGateDashboardAction(),
      getResidentPresenceAction(),
      getViolationsAction({ page: 1, pageSize: 10 }),
    ]).then(([dashResult, presenceResult, violationsResult]) => {
      if (dashResult.success) setDashboard(dashResult.data);
      if (presenceResult.success) setResidents(presenceResult.data);
      if (violationsResult.success) {
        setViolations(violationsResult.data.data);
        setViolationTotal(violationsResult.data.total);
      }
      setViolationsLoading(false);
    });
  }, []);

  const loadViolations = useCallback(async (page: number) => {
    setViolationsLoading(true);
    setViolationPage(page);
    const result = await getViolationsAction({ page, pageSize: 10 });
    if (result.success) {
      setViolations(result.data.data);
      setViolationTotal(result.data.total);
    }
    setViolationsLoading(false);
  }, []);

  const loadAttendance = useCallback(async (page: number) => {
    setAttendanceLoading(true);
    setAttendancePage(page);
    const result = await getAttendanceAction({ page, pageSize: 10 });
    if (result.success) {
      setAttendance(result.data.data);
      setAttendanceTotal(result.data.total);
    }
    setAttendanceLoading(false);
  }, []);

  const handleCheckIn = async (residentId: string) => {
    const result = await checkInResidentAction({ resident_id: residentId, method: "manual" });
    if (result.success) {
      const [dashResult, presenceResult] = await Promise.all([
        getGateDashboardAction(),
        getResidentPresenceAction(),
      ]);
      if (dashResult.success) setDashboard(dashResult.data);
      if (presenceResult.success) setResidents(presenceResult.data);
    }
  };

  const handleCheckOut = async (residentId: string) => {
    const result = await checkOutResidentAction({ resident_id: residentId, method: "manual" });
    if (result.success) {
      const [dashResult, presenceResult] = await Promise.all([
        getGateDashboardAction(),
        getResidentPresenceAction(),
      ]);
      if (dashResult.success) setDashboard(dashResult.data);
      if (presenceResult.success) setResidents(presenceResult.data);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Gate Management"
        description="Monitor entry/exit, track presence, and manage violations"
      />

      {dashboard && <GateStats dashboard={dashboard} />}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={(tab) => { setActiveTab(tab);
            if (tab === "violations") loadViolations(1);
            if (tab === "attendance") loadAttendance(1);
          }}>
            <TabsList>
              <TabsTrigger value="violations" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Violations
              </TabsTrigger>
              <TabsTrigger value="attendance" className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                Attendance
              </TabsTrigger>
            </TabsList>
            <TabsContent value="violations" className="mt-4">
              {violationsLoading ? (
                <LoadingState message="Loading violations..." />
              ) : (
                <ViolationsTable
                  violations={violations}
                  total={violationTotal}
                  page={violationPage}
                  pageSize={10}
                  onFilterChange={(_filters: ViolationFilterParams) => loadViolations(1)}
                  onPageChange={loadViolations}
                />
              )}
            </TabsContent>
            <TabsContent value="attendance" className="mt-4">
              {attendanceLoading ? (
                <LoadingState message="Loading attendance..." />
              ) : (
                <AttendanceTimeline
                  records={attendance}
                  total={attendanceTotal}
                  page={attendancePage}
                  pageSize={10}
                  onFilterChange={(_filters: AttendanceFilterParams) => loadAttendance(1)}
                  onPageChange={loadAttendance}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <QuickCheckInOut
            residents={residents}
            onCheckIn={handleCheckIn}
            onCheckOut={handleCheckOut}
          />
        </div>
      </div>
    </PageContainer>
  );
}
