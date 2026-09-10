import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SupplierDto, SupplierUpsertDto } from '../models/supplier.model';
import { BasePaginatedList, BasePaginatedQuery } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class SupplierService {
  private readonly baseUrl = `${environment.apiUrl}/suppliers`;

  constructor(private readonly http: HttpClient) {}

  getPaged(query: BasePaginatedQuery): Observable<BasePaginatedList<SupplierDto>> {
    return this.http.post<BasePaginatedList<SupplierDto>>(`${this.baseUrl}/list`, query);
  }

  create(dto: SupplierUpsertDto): Observable<SupplierDto> {
    return this.http.post<SupplierDto>(this.baseUrl, dto);
  }

  update(id: number, dto: SupplierUpsertDto): Observable<SupplierDto> {
    return this.http.put<SupplierDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
