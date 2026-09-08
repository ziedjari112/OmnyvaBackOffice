import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CompanyDto, CompanyUpsertDto } from '../models/company.model';
import { BasePaginatedList, BasePaginatedQuery } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private readonly baseUrl = `${environment.apiUrl}/companies`;

  constructor(private readonly http: HttpClient) {}

  getPaged(query: BasePaginatedQuery): Observable<BasePaginatedList<CompanyDto>> {
    return this.http.post<BasePaginatedList<CompanyDto>>(`${this.baseUrl}/list`, query);
  }

  getById(id: number): Observable<CompanyDto> {
    return this.http.get<CompanyDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: CompanyUpsertDto): Observable<CompanyDto> {
    return this.http.post<CompanyDto>(this.baseUrl, dto);
  }

  update(id: number, dto: CompanyUpsertDto): Observable<CompanyDto> {
    return this.http.put<CompanyDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
