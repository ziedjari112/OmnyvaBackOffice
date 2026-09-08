import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FranchiseDto, FranchiseUpsertDto } from '../models/franchise.model';
import { BasePaginatedList, BasePaginatedQuery } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class FranchiseService {
  private readonly baseUrl = `${environment.apiUrl}/franchises`;

  constructor(private readonly http: HttpClient) {}

  getPaged(query: BasePaginatedQuery): Observable<BasePaginatedList<FranchiseDto>> {
    return this.http.post<BasePaginatedList<FranchiseDto>>(`${this.baseUrl}/list`, query);
  }

  getById(id: number): Observable<FranchiseDto> {
    return this.http.get<FranchiseDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: FranchiseUpsertDto): Observable<FranchiseDto> {
    return this.http.post<FranchiseDto>(this.baseUrl, dto);
  }

  update(id: number, dto: FranchiseUpsertDto): Observable<FranchiseDto> {
    return this.http.put<FranchiseDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
