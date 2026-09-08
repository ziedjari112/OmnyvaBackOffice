import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ServiceDto, ServiceUpsertDto } from '../models/service.model';
import { BasePaginatedList, BasePaginatedQuery } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class ServiceService {
  private readonly baseUrl = `${environment.apiUrl}/services`;

  constructor(private readonly http: HttpClient) {}

  getPaged(query: BasePaginatedQuery): Observable<BasePaginatedList<ServiceDto>> {
    return this.http.post<BasePaginatedList<ServiceDto>>(`${this.baseUrl}/list`, query);
  }

  create(dto: ServiceUpsertDto): Observable<ServiceDto> {
    return this.http.post<ServiceDto>(this.baseUrl, dto);
  }

  update(id: number, dto: ServiceUpsertDto): Observable<ServiceDto> {
    return this.http.put<ServiceDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
