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

/** A service performed on the spot for a walk-in client — recorded straight as a Completed
 * reservation on the backend, so there is no quantity or schedule, just which service and which
 * staff member performed it. */
export interface AwardLoyaltyServiceLineDto {
  serviceId: number;
  staffId: number;
}

export interface AwardLoyaltyPointsDto {
  referenceCode: string;
  entrepriseId: number;
  lines: AwardLoyaltyPointsLineDto[];
  serviceLines: AwardLoyaltyServiceLineDto[];
}
