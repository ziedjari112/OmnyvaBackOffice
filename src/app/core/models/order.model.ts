export type OrderStatus = 'Pending' | 'Confirmed' | 'Cancelled';
export type OrderLineType = 'Product' | 'Reservation';

export interface OrderLineDto {
  id: number;
  type: OrderLineType;
  productId?: number | null;
  productName?: string | null;
  quantity: number;
  availableStock?: number | null;
  serviceId?: number | null;
  serviceName?: string | null;
  staffId?: number | null;
  staffName?: string | null;
  scheduledAt?: string | null;
  reservationId?: number | null;
  unitPrice: number;
  subtotal: number;
}

export interface OrderDto {
  id: number;
  entrepriseId: number;
  status: OrderStatus;
  totalAmount: number;
  customerName?: string | null;
  customerEmail?: string | null;
  createdAt: string;
  lines: OrderLineDto[];
}
