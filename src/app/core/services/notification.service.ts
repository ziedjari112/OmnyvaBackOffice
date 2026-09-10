import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationDto } from '../models/notification.model';
import { BasePaginatedList, BasePaginatedQuery } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly baseUrl = `${environment.apiUrl}/notifications`;

  constructor(private readonly http: HttpClient) {}

  getMine(query: BasePaginatedQuery): Observable<BasePaginatedList<NotificationDto>> {
    return this.http.post<BasePaginatedList<NotificationDto>>(`${this.baseUrl}/list`, query);
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/unread-count`);
  }

  markAsRead(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/read`, {});
  }

  markAsUnread(id: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${id}/unread`, {});
  }
}
