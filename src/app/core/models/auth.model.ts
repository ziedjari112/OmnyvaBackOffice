export interface LoginDto {
  email: string;
  password: string;
}

export interface UserRoleAssignmentDto {
  id: number;
  roleId: number;
  roleName: string;
  franchiseId?: number | null;
}

export interface UserPermissionOverrideDto {
  id: number;
  permissionId: number;
  permissionCode: string;
  isGranted: boolean;
}

export interface UserDto {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string | null;
  isActive: boolean;
  roles: string[];
  roleAssignments: UserRoleAssignmentDto[];
  permissionOverrides: UserPermissionOverrideDto[];
}

export interface AuthResultDto {
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: UserDto;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string | null;
}

export interface UpdateUserDto {
  name: string;
  email: string;
  phoneNumber?: string | null;
}

export interface AssignUserRoleDto {
  roleId: number;
  franchiseId?: number | null;
}

export interface SetPermissionOverrideDto {
  permissionId: number;
  isGranted: boolean;
}
