import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SetSubscriptionDto, SubscriptionStatusDto } from '../models/subscription.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly baseUrl = `${environment.apiUrl}/subscriptions`;

  constructor(private readonly http: HttpClient) {}

  getMine(): Observable<SubscriptionStatusDto> {
    return this.http.get<SubscriptionStatusDto>(`${this.baseUrl}/mine`);
  }

  get(entrepriseId: number): Observable<SubscriptionStatusDto> {
    return this.http.get<SubscriptionStatusDto>(`${this.baseUrl}/${entrepriseId}`);
  }

  set(entrepriseId: number, dto: SetSubscriptionDto): Observable<SubscriptionStatusDto> {
    return this.http.put<SubscriptionStatusDto>(`${this.baseUrl}/${entrepriseId}`, dto);
  }
}
