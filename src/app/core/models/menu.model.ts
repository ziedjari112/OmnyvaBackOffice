export interface MenuDto {
  id: number;
  name: string;
  icon?: string | null;
  route?: string | null;
  displayOrder: number;
  requiredPermissionCode?: string | null;
  parentMenuId?: number | null;
  children: MenuDto[];
}

export interface MenuUpsertDto {
  name: string;
  icon?: string | null;
  route?: string | null;
  displayOrder: number;
  requiredPermissionCode?: string | null;
  parentMenuId?: number | null;
}
