export type BusinessType = 'Retail' | 'ServiceBased';
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
}
