export type LoyaltyExpirationPolicy = 'Never' | 'FixedDays' | 'EndOfYear';

export interface LoyaltyConfigDto {
  entrepriseId: number;
  expirationPolicy: LoyaltyExpirationPolicy;
  expirationDays: number;
}

export interface LoyaltyConfigUpsertDto {
  expirationPolicy: LoyaltyExpirationPolicy;
  expirationDays: number;
}

export interface MyLoyaltyPointsDto {
  entrepriseId: number;
  entrepriseName: string;
  totalPoints: number;
}

export interface LoyaltyReferenceLookupDto {
  userId: number;
  name: string;
  email: string;
}

export interface AwardLoyaltyPointsLineDto {
  productId: number;
  quantity: number;
}

export interface AwardLoyaltyPointsDto {
  referenceCode: string;
  entrepriseId: number;
  lines: AwardLoyaltyPointsLineDto[];
}
