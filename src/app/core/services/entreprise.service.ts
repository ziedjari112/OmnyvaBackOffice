import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EntrepriseDto, EntrepriseUpsertDto } from '../models/entreprise.model';
import { BasePaginatedList, BasePaginatedQuery } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class EntrepriseService {
  private readonly baseUrl = `${environment.apiUrl}/entreprises`;

  constructor(private readonly http: HttpClient) {}

  getPaged(query: BasePaginatedQuery): Observable<BasePaginatedList<EntrepriseDto>> {
    return this.http.post<BasePaginatedList<EntrepriseDto>>(`${this.baseUrl}/list`, query);
  }

  getById(id: number): Observable<EntrepriseDto> {
    return this.http.get<EntrepriseDto>(`${this.baseUrl}/${id}`);
  }

  create(dto: EntrepriseUpsertDto): Observable<EntrepriseDto> {
    return this.http.post<EntrepriseDto>(this.baseUrl, dto);
  }

  update(id: number, dto: EntrepriseUpsertDto): Observable<EntrepriseDto> {
    return this.http.put<EntrepriseDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
