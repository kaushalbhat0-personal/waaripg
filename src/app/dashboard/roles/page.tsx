import { PageHeader } from "@/shared/page/page-header";
import { PageContainer } from "@/shared/page/page-container";
import { RolesManagement, RoleAssignDialog } from "@/features/rbac/components";
import { getRolesAction, getPermissionsGroupedAction, assignRoleAction } from "@/features/rbac/actions";


export default async function RolesPage() {
  const [rolesResult, permissionsResult] = await Promise.all([
    getRolesAction(),
    getPermissionsGroupedAction(),
  ]);

  const roles = rolesResult.success ? rolesResult.data : [];
  const permissions = permissionsResult.success ? permissionsResult.data : [];

  return (
    <PageContainer>
      <PageHeader
        title="Roles & Permissions"
        description="Manage system roles and their permissions"
        actions={
          <RoleAssignDialog roles={roles} onAssign={assignRoleAction} />
        }
      />
      <RolesManagement roles={roles} permissions={permissions} />
    </PageContainer>
  );
}
