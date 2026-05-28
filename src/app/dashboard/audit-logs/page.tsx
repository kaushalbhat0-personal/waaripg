"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { PageHeader } from "@/shared/page/page-header";
import { PageContainer } from "@/shared/page/page-container";
import { AuditLogsTable, AuditDetailDrawer, ActivityTimeline } from "@/features/rbac/components";
import { getAuditLogsAction, getTimelineEventsAction } from "@/features/rbac/actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollText, Clock } from "lucide-react";
import type { AuditLog, AuditFilterParams, ActivityTimelineEvent, TimelineFilterParams } from "@/features/rbac/types";

export default function AuditLogsPage() {
  const [activeTab, setActiveTab] = useState("logs");
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logTotal, setLogTotal] = useState(0);
  const [logPage, setLogPage] = useState(1);
  const [logFilters, setLogFilters] = useState<AuditFilterParams>({});
  const [selectedLog, _setSelectedLog] = useState<AuditLog | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [events, setEvents] = useState<ActivityTimelineEvent[]>([]);
  const [eventTotal, setEventTotal] = useState(0);
  const [eventPage, setEventPage] = useState(1);
  const [eventFilters, setEventFilters] = useState<TimelineFilterParams>({});
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      getAuditLogsAction({ page: 1, pageSize: 25 }).then((result) => {
        if (result.success) {
          setLogs(result.data.data);
          setLogTotal(result.data.total);
        }
      });
    }
  }, []);

  const loadLogs = useCallback(async (page: number, filters: AuditFilterParams) => {
    const result = await getAuditLogsAction({ ...filters, page, pageSize: 25 });
    if (result.success) {
      setLogs(result.data.data);
      setLogTotal(result.data.total);
    }
  }, []);

  const loadEvents = useCallback(async (page: number, filters: TimelineFilterParams) => {
    const result = await getTimelineEventsAction({ ...filters, page, pageSize: 20 });
    if (result.success) {
      setEvents(result.data.data);
      setEventTotal(result.data.total);
    }
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "logs") {
      loadLogs(logPage, logFilters);
    } else {
      loadEvents(eventPage, eventFilters);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Audit Logs"
        description="Track all critical system operations"
      />

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <ScrollText className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="timeline" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Activity Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <AuditLogsTable
            logs={logs}
            total={logTotal}
            page={logPage}
            pageSize={25}
            onFilterChange={(filters) => {
              setLogFilters(filters);
              setLogPage(1);
            }}
            onPageChange={(page) => {
              setLogPage(page);
              loadLogs(page, logFilters);
            }}
          />
        </TabsContent>

        <TabsContent value="timeline">
          <ActivityTimeline
            events={events}
            total={eventTotal}
            page={eventPage}
            pageSize={20}
            onFilterChange={(filters) => {
              setEventFilters(filters);
              setEventPage(1);
            }}
            onPageChange={(page) => {
              setEventPage(page);
              loadEvents(page, eventFilters);
            }}
          />
        </TabsContent>
      </Tabs>

      <AuditDetailDrawer
        log={selectedLog}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </PageContainer>
  );
}
