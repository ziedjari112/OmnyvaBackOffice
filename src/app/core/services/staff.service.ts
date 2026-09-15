import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SetStaffWorkingHoursDto, StaffDto, StaffUpsertDto, StaffWorkingHoursDto } from '../models/staff.model';
import { BasePaginatedList, BasePaginatedQuery } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class StaffService {
  private readonly baseUrl = `${environment.apiUrl}/staff`;

  constructor(private readonly http: HttpClient) {}

  getPaged(query: BasePaginatedQuery): Observable<BasePaginatedList<StaffDto>> {
    return this.http.post<BasePaginatedList<StaffDto>>(`${this.baseUrl}/list`, query);
  }

  create(dto: StaffUpsertDto): Observable<StaffDto> {
    return this.http.post<StaffDto>(this.baseUrl, dto);
  }

  update(id: number, dto: StaffUpsertDto): Observable<StaffDto> {
    return this.http.put<StaffDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getServices(id: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/${id}/services`);
  }

  setServices(id: number, serviceIds: number[]): Observable<number[]> {
    return this.http.put<number[]>(`${this.baseUrl}/${id}/services`, serviceIds);
  }

  getWorkingHours(id: number): Observable<StaffWorkingHoursDto[]> {
    return this.http.get<StaffWorkingHoursDto[]>(`${this.baseUrl}/${id}/working-hours`);
  }

  setWorkingHours(id: number, dto: SetStaffWorkingHoursDto): Observable<StaffWorkingHoursDto[]> {
    return this.http.put<StaffWorkingHoursDto[]>(`${this.baseUrl}/${id}/working-hours`, dto);
  }

  /** The Staff record linked to the current user's own account. 404 (via the Observable's error) means
   * this account isn't linked to a staff member — "My Account" uses that to hide the photo section. */
  getMine(): Observable<StaffDto> {
    return this.http.get<StaffDto>(`${this.baseUrl}/me`);
  }

  updateMyPhoto(photoUrl: string | null): Observable<StaffDto> {
    return this.http.put<StaffDto>(`${this.baseUrl}/me/photo`, { photoUrl });
  }
}
