export interface StaffAttendanceStatusDto {
  staffId: number;
  staffName: string;
  date: string;
  isPresent: boolean;
  isDefaultDayOff: boolean;
}

export interface SetStaffAttendanceDto {
  isPresent: boolean;
}
