export interface ProductDto {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stockQuantity: number;
  entrepriseId: number;
  isActive: boolean;
  familyId?: number | null;
  familyName?: string | null;
  imageUrl?: string | null;
  loyaltyPoints: number;
}

export interface ProductUpsertDto {
  name: string;
  description?: string | null;
  price: number;
  entrepriseId: number;
  familyId?: number | null;
  imageUrl?: string | null;
  loyaltyPoints: number;
}
