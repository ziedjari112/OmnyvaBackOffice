export interface ProductDto {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  stockQuantity: number;
  entrepriseId: number;
  isActive: boolean;
}

export interface ProductUpsertDto {
  name: string;
  description?: string | null;
  price: number;
  entrepriseId: number;
}
