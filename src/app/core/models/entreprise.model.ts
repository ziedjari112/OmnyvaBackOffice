export type BusinessType = 'Retail' | 'ServiceBased' | 'ServiceAndRetail';
export type BusinessGender = 'Male' | 'Female' | 'Unisex';

export interface EntrepriseDto {
  id: number;
  name: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  email?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  businessType: BusinessType;
  gender?: BusinessGender | null;
  matriculeFiscal: string;
  registerCommerceNumber?: string | null;
  legalForm?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  currency: string;
  isActive: boolean;
}

export interface EntrepriseUpsertDto {
  name: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  phone?: string | null;
  email?: string | null;
  latitude?: string | null;
  longitude?: string | null;
  businessType: BusinessType;
  gender?: BusinessGender | null;
  matriculeFiscal: string;
  registerCommerceNumber?: string | null;
  legalForm?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  currency: string;

  /** Required on create only: the login account auto-created for this entreprise's admin. Ignored on update. */
  adminName?: string | null;
  adminEmail?: string | null;

  /** Optional, create-only: sets up the initial subscription (requires all three together). Ignored on
   * update — use SubscriptionService.set to renew an existing entreprise's subscription instead. */
  subscriptionPlanId?: number | null;
  subscriptionStartDate?: string | null;
  subscriptionEndDate?: string | null;
  subscriptionDiscountPercentage: number;
}
