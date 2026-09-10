import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FamilyDto, FamilyUpsertDto } from '../models/family.model';
import { BasePaginatedList, BasePaginatedQuery } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class FamilyService {
  private readonly baseUrl = `${environment.apiUrl}/families`;

  constructor(private readonly http: HttpClient) {}

  getPaged(query: BasePaginatedQuery): Observable<BasePaginatedList<FamilyDto>> {
    return this.http.post<BasePaginatedList<FamilyDto>>(`${this.baseUrl}/list`, query);
  }

  create(dto: FamilyUpsertDto): Observable<FamilyDto> {
    return this.http.post<FamilyDto>(this.baseUrl, dto);
  }

  update(id: number, dto: FamilyUpsertDto): Observable<FamilyDto> {
    return this.http.put<FamilyDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
