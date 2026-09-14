export interface PayrollConfigDto {
  hasConfig: boolean;
  staffPercentage: number;
}

export interface SetPayrollConfigDto {
  staffPercentage: number;
}

export interface PayrollTransactionDto {
  id: number;
  staffId: number;
  staffName: string;
  reservationId: number;
  workDate: string;
  grossAmount: number;
  staffShare: number;
  entrepriseShare: number;
  isSettled: boolean;
  settledAt?: string | null;
}

export interface MyPayrollDto {
  balance: number;
  transactions: PayrollTransactionDto[];
}

export interface StaffPayrollSummaryDto {
  staffId: number;
  staffName: string;
  unsettledBalance: number;
  generatedInPeriod: number;
}

export interface PayrollSummaryDto {
  entrepriseTotal: number;
  byStaff: StaffPayrollSummaryDto[];
}

export interface SettleResultDto {
  amountSettled: number;
}
