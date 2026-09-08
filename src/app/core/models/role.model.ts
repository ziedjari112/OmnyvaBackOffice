export interface RoleDto {
  id: number;
  name: string;
  description?: string | null;
  entrepriseId?: number | null;
  isSystemRole: boolean;
  isActive: boolean;
  permissions: string[];
}

export interface RoleUpsertDto {
  name: string;
  description?: string | null;
  entrepriseId?: number | null;
  permissionIds: number[];
}

export interface PermissionDto {
  id: number;
  code: string;
  description?: string | null;
  module: string;
}
