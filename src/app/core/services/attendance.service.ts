import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SetStaffAttendanceDto, StaffAttendanceStatusDto } from '../models/attendance.model';

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly baseUrl = `${environment.apiUrl}/attendance`;

  constructor(private readonly http: HttpClient) {}

  getForDate(date: string): Observable<StaffAttendanceStatusDto[]> {
    return this.http.get<StaffAttendanceStatusDto[]>(this.baseUrl, { params: { date } });
  }

  set(staffId: number, date: string, dto: SetStaffAttendanceDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${staffId}`, dto, { params: { date } });
  }
}
