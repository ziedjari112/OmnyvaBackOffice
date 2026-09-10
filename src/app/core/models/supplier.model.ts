export interface SupplierDto {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  entrepriseId: number;
  isActive: boolean;
}

export interface SupplierUpsertDto {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  entrepriseId: number;
}
