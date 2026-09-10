export type StockMovementType = 'Receipt' | 'Adjustment';

export interface StockMovementLineDto {
  id: number;
  productId: number;
  productName?: string | null;
  quantity: number;
  unitPriceHT: number;
  unitPriceTTC: number;
  totalHT: number;
  totalTTC: number;
  totalTVA: number;
}

export interface StockMovementDto {
  id: number;
  type: StockMovementType;
  entrepriseId: number;
  supplierId?: number | null;
  supplierName?: string | null;
  totalHT: number;
  totalTTC: number;
  totalTVA: number;
  createdAt: string;
  lines: StockMovementLineDto[];
}

export interface CreateStockMovementLineDto {
  productId: number;
  /** Positive for a receipt. For an Adjustment, may be negative to decrease stock. */
  quantity: number;
  /** Exactly one of unitPriceHT / unitPriceTTC for a Receipt line; both omitted for an Adjustment line. */
  unitPriceHT?: number | null;
  unitPriceTTC?: number | null;
}

export interface CreateStockMovementDto {
  type: StockMovementType;
  entrepriseId: number;
  /** Required when type is Receipt. */
  supplierId?: number | null;
  lines: CreateStockMovementLineDto[];
}
