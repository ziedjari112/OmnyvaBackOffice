export interface SubscriptionStatusDto {
  hasSubscription: boolean;
  startDate?: string | null;
  endDate?: string | null;
  planId?: number | null;
  planName?: string | null;
  isTrial?: boolean | null;
  discountPercentage?: number | null;
  finalPrice?: number | null;
  isExpired: boolean;
  daysUntilExpiry?: number | null;
}

export interface SetSubscriptionDto {
  planId: number;
  startDate: string;
  endDate: string;
  discountPercentage: number;
}
