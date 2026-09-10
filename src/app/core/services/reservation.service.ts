import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ReservationDto } from '../models/reservation.model';
import { BasePaginatedList, BasePaginatedQuery } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly baseUrl = `${environment.apiUrl}/reservations`;

  constructor(private readonly http: HttpClient) {}

  /** All reservations at the current entreprise (staff-facing full list). */
  getPaged(query: BasePaginatedQuery): Observable<BasePaginatedList<ReservationDto>> {
    return this.http.post<BasePaginatedList<ReservationDto>>(`${this.baseUrl}/list`, query);
  }

  /** Reservations booked by the current user, as a customer. */
  getMine(query: BasePaginatedQuery): Observable<BasePaginatedList<ReservationDto>> {
    return this.http.post<BasePaginatedList<ReservationDto>>(`${this.baseUrl}/mine/list`, query);
  }

  /** Reservations assigned to the current user, as staff. */
  getForStaff(query: BasePaginatedQuery): Observable<BasePaginatedList<ReservationDto>> {
    return this.http.post<BasePaginatedList<ReservationDto>>(`${this.baseUrl}/staff/list`, query);
  }
}
