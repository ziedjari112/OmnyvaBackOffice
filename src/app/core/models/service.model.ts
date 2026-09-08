export interface ServiceDto {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  durationMinutes: number;
  entrepriseId: number;
  isActive: boolean;
}

export interface ServiceUpsertDto {
  name: string;
  description?: string | null;
  price: number;
  durationMinutes: number;
  entrepriseId: number;
}
