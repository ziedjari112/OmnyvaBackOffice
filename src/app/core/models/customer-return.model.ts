export type CustomerReturnStatus = 'Pending' | 'Approved' | 'Rejected';

export interface CustomerReturnLineDto {
  id: number;
  orderLineId: number;
  productId: number;
  productName: string;
  quantity: number;
  reason?: string | null;
}

export interface CustomerReturnDto {
  id: number;
  orderId: number;
  entrepriseId: number;
  userId: number;
  clientName: string;
  status: CustomerReturnStatus;
  staffNote?: string | null;
  createdAt: string;
  lines: CustomerReturnLineDto[];
}

export interface CustomerReturnDecisionDto {
  reason?: string | null;
}
