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
  entrepriseId: number;
  serviceId: number;
  serviceName?: string | null;
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
  entrepriseId: number;
  serviceId: number;
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
