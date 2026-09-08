export interface StaffDto {
  id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  franchiseId: number;
  userId?: number | null;
  isActive: boolean;
}

export interface StaffUpsertDto {
  name: string;
  phone?: string | null;
  email?: string | null;
  franchiseId: number;
  userId?: number | null;
}

export interface StaffWorkingHoursDto {
  dayOfWeek:
    | 'Sunday'
    | 'Monday'
    | 'Tuesday'
    | 'Wednesday'
    | 'Thursday'
    | 'Friday'
    | 'Saturday';
  isDayOff: boolean;
  startTime?: string | null;
  endTime?: string | null;
}

export interface SetStaffWorkingHoursDto {
  days: StaffWorkingHoursDto[];
}
