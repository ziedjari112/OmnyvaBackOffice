import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CustomerReturnDecisionDto, CustomerReturnDto } from '../models/customer-return.model';
import { BasePaginatedList, BasePaginatedQuery } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class CustomerReturnService {
  private readonly baseUrl = `${environment.apiUrl}/customerreturns`;

  constructor(private readonly http: HttpClient) {}

  getPaged(query: BasePaginatedQuery): Observable<BasePaginatedList<CustomerReturnDto>> {
    return this.http.post<BasePaginatedList<CustomerReturnDto>>(`${this.baseUrl}/list`, query);
  }

  approve(id: number, note?: string): Observable<CustomerReturnDto> {
    const dto: CustomerReturnDecisionDto = { reason: note ?? null };
    return this.http.post<CustomerReturnDto>(`${this.baseUrl}/${id}/approve`, dto);
  }

  reject(id: number, reason?: string): Observable<CustomerReturnDto> {
    const dto: CustomerReturnDecisionDto = { reason: reason ?? null };
    return this.http.post<CustomerReturnDto>(`${this.baseUrl}/${id}/reject`, dto);
  }
}
