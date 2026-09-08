export enum ReservationStatus {
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Cancelled = 'Cancelled',
  Completed = 'Completed',
  Expired = 'Expired'
}

export interface ReservationDto {
  id: number;
  name: string;
  franchiseId: number;
  productId: number;
  productName?: string | null;
  staffId: number;
  staffName?: string | null;
  customerName: string;
  customerPhone?: string | null;
  customerEmail: string;
  customerUserId?: number | null;
  scheduledAt: string;
  status: ReservationStatus;
  notes?: string | null;
  verificationToken: string;
  checkedInAt?: string | null;
}

export interface ReservationUpsertDto {
  franchiseId: number;
  productId: number;
  staffId: number;
  customerName: string;
  customerPhone?: string | null;
  customerEmail: string;
  scheduledAt: string;
  notes?: string | null;
}

export interface VerifyReservationDto {
  token: string;
}
