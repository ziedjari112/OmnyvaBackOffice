export enum ProductType {
  Merchandise = 'Merchandise',
  Service = 'Service'
}

export interface ProductDto {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  type: ProductType;
  durationMinutes?: number | null;
  stockQuantity?: number | null;
  franchiseId: number;
  isActive: boolean;
}

export interface ProductUpsertDto {
  name: string;
  description?: string | null;
  price: number;
  type: ProductType;
  durationMinutes?: number | null;
  stockQuantity?: number | null;
  franchiseId: number;
}
