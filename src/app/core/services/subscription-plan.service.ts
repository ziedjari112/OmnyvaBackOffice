import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SubscriptionPlanDto, SubscriptionPlanUpsertDto } from '../models/subscription-plan.model';
import { BasePaginatedList, BasePaginatedQuery } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class SubscriptionPlanService {
  private readonly baseUrl = `${environment.apiUrl}/subscriptionplans`;

  constructor(private readonly http: HttpClient) {}

  getPaged(query: BasePaginatedQuery): Observable<BasePaginatedList<SubscriptionPlanDto>> {
    return this.http.post<BasePaginatedList<SubscriptionPlanDto>>(`${this.baseUrl}/list`, query);
  }

  getById(id: number): Observable<SubscriptionPlanDto> {
    return this.http.get<SubscriptionPlanDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: SubscriptionPlanUpsertDto): Observable<SubscriptionPlanDto> {
    return this.http.post<SubscriptionPlanDto>(this.baseUrl, dto);
  }

  update(id: number, dto: SubscriptionPlanUpsertDto): Observable<SubscriptionPlanDto> {
    return this.http.put<SubscriptionPlanDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
