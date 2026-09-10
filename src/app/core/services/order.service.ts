import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrderDto } from '../models/order.model';
import { BasePaginatedList, BasePaginatedQuery } from '../models/pagination.model';
import { AwardLoyaltyPointsDto } from '../models/loyalty.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly baseUrl = `${environment.apiUrl}/orders`;

  constructor(private readonly http: HttpClient) {}

  getPaged(query: BasePaginatedQuery): Observable<BasePaginatedList<OrderDto>> {
    return this.http.post<BasePaginatedList<OrderDto>>(`${this.baseUrl}/list`, query);
  }

  createWalkIn(dto: AwardLoyaltyPointsDto): Observable<OrderDto> {
    return this.http.post<OrderDto>(`${this.baseUrl}/walk-in`, dto);
  }
}
