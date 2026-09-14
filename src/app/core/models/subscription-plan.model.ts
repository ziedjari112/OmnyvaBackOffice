import { BusinessType } from './entreprise.model';

export interface SubscriptionPlanDto {
  id: number;
  name: string;
  businessType: BusinessType;
  isTrial: boolean;
  price: number;
}

export interface SubscriptionPlanUpsertDto {
  name: string;
  businessType: BusinessType;
  isTrial: boolean;
  price: number;
}
