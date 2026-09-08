export interface CompanyDto {
  id: number;
  name: string;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  matriculeFiscal: string;
  registerCommerceNumber?: string | null;
  legalForm?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  isActive: boolean;
}

export interface CompanyUpsertDto {
  name: string;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  matriculeFiscal: string;
  registerCommerceNumber?: string | null;
  legalForm?: string | null;
  website?: string | null;
  logoUrl?: string | null;
}
