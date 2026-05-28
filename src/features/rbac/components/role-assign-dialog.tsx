"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Shield, UserPlus } from "lucide-react";
import type { Role, AssignRoleInput } from "../types";
import type { ActionResponse } from "@/types";

type RoleAssignDialogProps = {
  roles: Role[];
  onAssign: (input: AssignRoleInput) => Promise<ActionResponse<{ id: string }>>;
};

export function RoleAssignDialog({ roles, onAssign }: RoleAssignDialogProps) {
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!userId || !selectedRoleId) return;
    setIsSubmitting(true);
    try {
      const result = await onAssign({ user_id: userId, role_id: selectedRoleId });
      if (result.success) {
        setOpen(false);
        setUserId("");
        setSelectedRoleId("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <UserPlus className="mr-2 h-4 w-4" />
        Assign Role
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Assign Role to User
          </DialogTitle>
          <DialogDescription>
            Enter a user ID and select the role to assign.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">User ID</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Enter user UUID..."
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRoleId(role.id)}
                  className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-colors capitalize ${
                    selectedRoleId === role.id
                      ? "border-foreground bg-accent"
                      : "hover:bg-muted"
                  }`}
                >
                  {role.name}
                </button>
              ))}
            </div>
          </div>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!userId || !selectedRoleId || isSubmitting}
          >
            {isSubmitting ? "Assigning..." : "Assign Role"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
