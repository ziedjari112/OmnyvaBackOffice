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

  /** Staff acknowledges a Pending reservation, moving it to Confirmed. */
  confirm(id: number): Observable<ReservationDto> {
    return this.http.post<ReservationDto>(`${this.baseUrl}/${id}/confirm`, null);
  }

  /** Closes the reservation as Completed once the service has been performed. */
  complete(id: number): Observable<ReservationDto> {
    return this.http.post<ReservationDto>(`${this.baseUrl}/${id}/complete`, null);
  }

  /** Staff declines a Pending reservation, or cancels a Confirmed one, optionally with a reason. */
  cancel(id: number, reason?: string): Observable<ReservationDto> {
    return this.http.post<ReservationDto>(`${this.baseUrl}/${id}/cancel`, { reason: reason ?? null });
  }
}
