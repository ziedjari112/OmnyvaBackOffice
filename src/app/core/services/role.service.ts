import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoleDto, RoleUpsertDto } from '../models/role.model';
import { BasePaginatedList, BasePaginatedQuery } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly baseUrl = `${environment.apiUrl}/roles`;

  constructor(private readonly http: HttpClient) {}

  getPaged(query: BasePaginatedQuery): Observable<BasePaginatedList<RoleDto>> {
    return this.http.post<BasePaginatedList<RoleDto>>(`${this.baseUrl}/list`, query);
  }

  create(dto: RoleUpsertDto): Observable<RoleDto> {
    return this.http.post<RoleDto>(this.baseUrl, dto);
  }

  update(id: number, dto: RoleUpsertDto): Observable<RoleDto> {
    return this.http.put<RoleDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
