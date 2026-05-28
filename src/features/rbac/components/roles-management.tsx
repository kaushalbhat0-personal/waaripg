"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Users2, Check } from "lucide-react";
import type { Role, PermissionModuleGroup } from "../types";

type RolesManagementProps = {
  roles: Role[];
  permissions: PermissionModuleGroup[];
};

export function RolesManagement({ roles, permissions }: RolesManagementProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [isSaving, _setIsSaving] = useState(false);

  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
    setSelectedPermissions(new Set());
  };

  const togglePermission = (permissionId: string) => {
    const next = new Set(selectedPermissions);
    if (next.has(permissionId)) {
      next.delete(permissionId);
    } else {
      next.add(permissionId);
    }
    setSelectedPermissions(next);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4" />
            Roles
          </CardTitle>
          <CardDescription>Select a role to manage permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className={`w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                selectedRole === role.id
                  ? "border-foreground bg-accent"
                  : "hover:bg-muted"
              }`}
            >
              <span className="font-medium capitalize">{role.name}</span>
              {role.description && (
                <p className="mt-0.5 text-xs text-muted-foreground truncate">
                  {role.description}
                </p>
              )}
            </button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users2 className="h-4 w-4" />
            Permissions
          </CardTitle>
          <CardDescription>
            {selectedRole
              ? `Configure permissions for the selected role`
              : "Select a role to view and edit permissions"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedRole ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Select a role from the left panel to manage its permissions.
            </p>
          ) : (
            <div className="space-y-6">
              {permissions.map((group) => (
                <div key={group.module}>
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.module}
                  </h4>
                  <div className="space-y-1">
                    {group.permissions.map((perm) => (
                      <label
                        key={perm.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-muted/50"
                      >
                        <button
                          type="button"
                          onClick={() => togglePermission(perm.id)}
                          className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                            selectedPermissions.has(perm.id)
                              ? "border-foreground bg-foreground text-background"
                              : "border-input hover:border-foreground"
                          }`}
                        >
                          {selectedPermissions.has(perm.id) && (
                            <Check className="h-3 w-3" />
                          )}
                        </button>
                        <div className="flex-1">
                          <span className="font-medium">{perm.name}</span>
                          {perm.description && (
                            <p className="text-xs text-muted-foreground">
                              {perm.description}
                            </p>
                          )}
                        </div>
                        <code className="text-[10px] text-muted-foreground">
                          {perm.code}
                        </code>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <Button className="w-full" disabled={isSaving || selectedPermissions.size === 0}>
                {isSaving ? "Saving..." : "Save Permissions"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
