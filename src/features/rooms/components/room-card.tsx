"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bed, IndianRupee, MoreHorizontal } from "lucide-react";
import { formatCurrency, capitalize } from "@/lib/formatters";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type RoomCardProps = {
  id: string;
  roomNumber: string;
  type: string;
  capacity: number;
  rentAmount: number;
  isActive: boolean;
  occupancy?: {
    total: number;
    available: number;
    occupied: number;
    reserved: number;
    maintenance: number;
    percentage: number;
  };
  onEdit?: () => void;
  onDelete?: () => void;
  onAllocate?: () => void;
  onView?: () => void;
};

export function RoomCard({
  roomNumber,
  type,
  capacity,
  rentAmount,
  isActive,
  occupancy,
  onEdit,
  onDelete,
  onAllocate,
  onView,
}: RoomCardProps) {
  const occupancyPercentage = occupancy ? occupancy.percentage : 0;
  const availableBeds = occupancy ? occupancy.available : capacity;

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>
              <button onClick={onView} className="hover:underline text-left font-medium">
                Room {roomNumber}
              </button>
            </CardTitle>
            <CardDescription>
              <Badge variant={type === "single" ? "outline" : "secondary"}>
                {capitalize(type)}
              </Badge>
              {!isActive && (
                <Badge variant="destructive" className="ml-2">
                  Inactive
                </Badge>
              )}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              className="h-8 w-8"
              render={<Button variant="ghost" size="icon" />}
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onView}>View Details</DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
              {availableBeds > 0 && isActive && (
                <DropdownMenuItem onClick={onAllocate}>
                  Allocate Resident
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={onDelete}>
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Bed className="h-4 w-4" />
            <span>
              {occupancy
                ? `${occupancy.occupied}/${occupancy.total} Occupied`
                : `${capacity} ${capacity === 1 ? "Bed" : "Beds"}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <IndianRupee className="h-4 w-4" />
            <span>{formatCurrency(rentAmount)}/mo</span>
          </div>
        </div>
        {occupancy && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Occupancy</span>
              <span>{occupancyPercentage}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  occupancyPercentage >= 100
                    ? "bg-destructive"
                    : occupancyPercentage >= 50
                      ? "bg-warning"
                      : "bg-success",
                )}
                style={{ width: `${occupancyPercentage}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-1">
          {occupancy?.available ? (
            <Badge variant="secondary" className="text-xs">
              {occupancy.available} available
            </Badge>
          ) : occupancy ? (
            <Badge variant="destructive" className="text-xs">
              Full
            </Badge>
          ) : null}
          {occupancy?.maintenance ? (
            <Badge variant="outline" className="text-xs">
              {occupancy.maintenance} maintenance
            </Badge>
          ) : null}
        </div>
      </CardFooter>
    </Card>
  );
}
