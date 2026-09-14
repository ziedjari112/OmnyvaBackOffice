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

// One audit-ledger row for a product's stock level — written on every stock movement (receipt or
// adjustment) AND on every confirmed order line that consumes this product, so the full history of
// an article is just this list, already ordered newest-first by the backend.
export interface StockArticleDto {
  id: number;
  productId: number;
  productName?: string | null;
  stockMovementId?: number | null;
  orderId?: number | null;
  oldStock: number;
  newStock: number;
  createdAt: string;
}
