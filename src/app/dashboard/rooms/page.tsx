"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, DoorOpen, BedDouble, Building2, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/shared/page/page-header";
import { PageContainer } from "@/shared/page/page-container";
import { LoadingState } from "@/shared/feedback";
import { RoomCard, RoomFilters, RoomFormDialog, RoomAllocationDialog } from "@/features/rooms/components";
import { getRoomsAction, createRoomAction, updateRoomAction, deleteRoomAction, allocateResidentAction, getRoomStatsAction } from "@/features/rooms/actions";
import type { RoomWithBeds } from "@/features/rooms/types";
import type { PaginatedResponse } from "@/types";
import { toast } from "sonner";

type StatCard = {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
};

export default function RoomsPage() {
  const [data, setData] = useState<PaginatedResponse<RoomWithBeds & { occupancy?: { total: number; available: number; occupied: number; reserved: number; maintenance: number; percentage: number } }> | null>(null);
  const [stats, setStats] = useState<{ total: number; occupied: number; available: number; maintenance: number; occupancyRate: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [allocateDialogOpen, setAllocateDialogOpen] = useState(false);
  const [allocatingRoom, setAllocatingRoom] = useState<RoomWithBeds | null>(null);
  const [editingRoom, setEditingRoom] = useState<RoomWithBeds | null>(null);
  const fetchIdRef = useRef(0);

  useEffect(() => {
    const fetchId = ++fetchIdRef.current;
    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);

      const [roomsResult, statsResult] = await Promise.all([
        getRoomsAction({
          search: search || undefined,
          type: (typeFilter || undefined) as "single" | "double" | "triple" | "dormitory" | undefined,
          page,
          pageSize,
        }),
        getRoomStatsAction(),
      ]);

      if (!cancelled && fetchId === fetchIdRef.current) {
        if (roomsResult.success) {
          setData(roomsResult.data as PaginatedResponse<RoomWithBeds & { occupancy?: { total: number; available: number; occupied: number; reserved: number; maintenance: number; percentage: number } }>);
        } else {
          toast.error(roomsResult.error.message);
        }
        if (statsResult.success) {
          setStats(statsResult.data);
        }
        setIsLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [search, typeFilter, statusFilter, page, pageSize]);

  function handleCreate() {
    setEditingRoom(null);
    setDialogOpen(true);
  }

  function handleEdit(room: RoomWithBeds) {
    setEditingRoom(room);
    setDialogOpen(true);
  }

  async function handleSubmit(data: { room_number: string; type: "single" | "double" | "triple" | "dormitory"; capacity: number; rent_amount: number; description?: string | null; property_id?: string | null; floor_id?: string | null; is_active?: boolean }) {
    if (editingRoom) {
      const result = await updateRoomAction(editingRoom.id, data);
      if (result.success) {
        toast.success("Room updated successfully");
      } else {
        toast.error(result.error.message);
        throw new Error(result.error.message);
      }
    } else {
      const result = await createRoomAction(data);
      if (result.success) {
        toast.success("Room created successfully");
      } else {
        toast.error(result.error.message);
        throw new Error(result.error.message);
      }
    }
  }

  async function handleDelete(room: RoomWithBeds) {
    const confirmed = window.confirm(
      `Are you sure you want to delete Room ${room.room_number}?`,
    );
    if (!confirmed) return;

    const result = await deleteRoomAction(room.id);
    if (result.success) {
      toast.success("Room deleted");
    } else {
      toast.error(result.error.message);
    }
  }

  function handleAllocate(room: RoomWithBeds) {
    setAllocatingRoom(room);
    setAllocateDialogOpen(true);
  }

  async function handleAllocateSubmit(data: { resident_id: string; bed_id: string; room_id: string; rent_amount: number; security_deposit: number; notes?: string | null }) {
    const result = await allocateResidentAction(data);
    if (result.success) {
      toast.success("Resident allocated successfully");
    } else {
      toast.error(result.error.message);
      throw new Error(result.error.message);
    }
  }

  const availableBedsForAllocation = (allocatingRoom?.beds ?? [])
    .filter((b) => b.status === "available")
    .map((b) => ({
      id: b.id,
      bed_number: b.bed_number,
      room_id: allocatingRoom!.id,
      room_number: allocatingRoom!.room_number,
      rent_amount: allocatingRoom!.rent_amount,
    }));

  const statCards: StatCard[] = [
    {
      title: "Total Rooms",
      value: stats?.total ?? 0,
      icon: DoorOpen,
      description: "Registered rooms",
    },
    {
      title: "Occupied Beds",
      value: stats?.occupied ?? 0,
      icon: BedDouble,
      description: "Currently occupied",
    },
    {
      title: "Available Beds",
      value: stats?.available ?? 0,
      icon: Building2,
      description: "Ready for allocation",
    },
    {
      title: "Occupancy Rate",
      value: stats ? `${stats.occupancyRate}%` : "0%",
      icon: Percent,
      description: stats ? `${stats.available} beds free` : "",
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title="Rooms"
        description="Manage rooms, beds, and allocations"
        actions={
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Room
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <RoomFilters
        type={typeFilter}
        status={statusFilter}
        onTypeChange={(v) => {
          setTypeFilter(v === "all" ? "" : v);
          setPage(1);
        }}
        onStatusChange={(v) => {
          setStatusFilter(v === "all" ? "" : v);
          setPage(1);
        }}
      />

      {isLoading ? (
        <LoadingState message="Loading rooms..." />
      ) : !data || data.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-12 text-center">
          <DoorOpen className="h-12 w-12 text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">
              {search ? "No rooms match your search" : "No rooms yet"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {search
                ? "Try a different search term or clear filters."
                : "Add your first room to start managing beds and allocations."}
            </p>
          </div>
          {!search && (
            <Button onClick={handleCreate} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.data.map((room) => (
              <RoomCard
                key={room.id}
                id={room.id}
                roomNumber={room.room_number}
                type={room.type}
                capacity={room.capacity}
                rentAmount={room.rent_amount}
                isActive={room.is_active}
                occupancy={room.occupancy}
                onEdit={() => handleEdit(room)}
                onDelete={() => handleDelete(room)}
                onAllocate={(room as { beds?: { id: string; status: string }[] }).beds?.some((b) => b.status === "available")
                  ? () => handleAllocate(room)
                  : undefined}
              />
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, data.total)} of {data.total} rooms
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= data.totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <RoomFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultValues={editingRoom ? {
          room_number: editingRoom.room_number,
          type: editingRoom.type,
          capacity: editingRoom.capacity,
          rent_amount: editingRoom.rent_amount,
          description: editingRoom.description,
          is_active: editingRoom.is_active,
        } : undefined}
        onSubmit={handleSubmit}
        title={editingRoom ? "Edit Room" : "Add Room"}
      />

      <RoomAllocationDialog
        open={allocateDialogOpen}
        onOpenChange={setAllocateDialogOpen}
        availableBeds={availableBedsForAllocation}
        onSubmit={handleAllocateSubmit}
        title={`Allocate Resident - Room ${allocatingRoom?.room_number ?? ""}`}
      />
    </PageContainer>
  );
}
