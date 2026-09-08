import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AssignUserRoleDto, CreateUserDto, UpdateUserDto, UserDto } from '../models/auth.model';
import { BasePaginatedList, BasePaginatedQuery } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = `${environment.apiUrl}/users`;

  constructor(private readonly http: HttpClient) {}

  getPaged(query: BasePaginatedQuery): Observable<BasePaginatedList<UserDto>> {
    return this.http.post<BasePaginatedList<UserDto>>(`${this.baseUrl}/list`, query);
  }

  create(dto: CreateUserDto): Observable<UserDto> {
    return this.http.post<UserDto>(this.baseUrl, dto);
  }

  update(id: number, dto: UpdateUserDto): Observable<UserDto> {
    return this.http.put<UserDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  assignRole(id: number, dto: AssignUserRoleDto): Observable<UserDto> {
    return this.http.post<UserDto>(`${this.baseUrl}/${id}/roles`, dto);
  }

  removeRole(id: number, userRoleId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/roles/${userRoleId}`);
  }
}
