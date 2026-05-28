"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, LogIn, LogOut, UserCheck } from "lucide-react";
import type { ResidentPresence } from "../types";

type QuickCheckInOutProps = {
  residents: ResidentPresence[];
  onCheckIn: (residentId: string) => Promise<void>;
  onCheckOut: (residentId: string) => Promise<void>;
};

export function QuickCheckInOut({ residents, onCheckIn, onCheckOut }: QuickCheckInOutProps) {
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = search
    ? residents.filter(
        (r) =>
          r.name.toLowerCase().includes(search.toLowerCase()) ||
          r.phone.includes(search),
      )
    : residents;

  const handleAction = async (residentId: string, isInside: boolean) => {
    setLoadingId(residentId);
    try {
      if (isInside) {
        await onCheckOut(residentId);
      } else {
        await onCheckIn(residentId);
      }
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <UserCheck className="h-4 w-4" />
          Quick Check-In / Out
        </CardTitle>
        <CardDescription>Search resident and tap to check in or out</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-11 pl-9 text-base"
            autoFocus
          />
        </div>
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {search ? "No residents found" : "No active residents"}
            </p>
          ) : (
            filtered.map((resident) => (
              <div
                key={resident.resident_id}
                className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                      resident.is_inside ? "bg-emerald-500" : "bg-gray-300"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{resident.name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{resident.phone}</span>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                        {resident.type === "hostel" ? "Hostel" : "PG"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={resident.is_inside ? "outline" : "default"}
                  onClick={() => handleAction(resident.resident_id, resident.is_inside)}
                  disabled={loadingId === resident.resident_id}
                  className="shrink-0 ml-2 h-9 min-w-[90px]"
                >
                  {loadingId === resident.resident_id ? (
                    "..."
                  ) : resident.is_inside ? (
                    <>
                      <LogOut className="mr-1.5 h-3.5 w-3.5" />
                      Exit
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-1.5 h-3.5 w-3.5" />
                      Entry
                    </>
                  )}
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
