export interface FamilyDto {
  id: number;
  name: string;
  entrepriseId: number;
  isActive: boolean;
  imageUrl?: string | null;
}

export interface FamilyUpsertDto {
  name: string;
  entrepriseId: number;
  imageUrl?: string | null;
}
