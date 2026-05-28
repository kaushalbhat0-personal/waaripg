import { z } from "zod";

export const roleNameSchema = z.enum(["admin", "manager", "accountant", "guard"]);

export const createRoleSchema = z.object({
  name: roleNameSchema,
  description: z.string().optional(),
});

export const assignRoleSchema = z.object({
  user_id: z.string().uuid(),
  role_id: z.string().uuid(),
  organization_id: z.string().uuid().optional(),
});

export const updateRolePermissionsSchema = z.object({
  role_id: z.string().uuid(),
  permission_ids: z.array(z.string().uuid()).min(1, "At least one permission is required"),
});

export const auditFilterSchema = z.object({
  action: z.string().optional(),
  actor_id: z.string().uuid().optional(),
  entity_type: z.string().optional(),
  entity_id: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  search: z.string().optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
});

export const timelineFilterSchema = z.object({
  entity_type: z.string().optional(),
  entity_id: z.string().optional(),
  actor_name: z.string().optional(),
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().positive().optional(),
});
