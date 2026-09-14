export type DayOfWeekName = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export interface EntrepriseWorkingHoursDto {
  dayOfWeek: DayOfWeekName;
  isDayOff: boolean;
  startTime?: string | null;
  endTime?: string | null;
}

export interface SetEntrepriseWorkingHoursDto {
  days: EntrepriseWorkingHoursDto[];
}
