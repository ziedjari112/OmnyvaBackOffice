import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MenuDto, MenuUpsertDto } from '../models/menu.model';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly baseUrl = `${environment.apiUrl}/menus`;

  constructor(private readonly http: HttpClient) {}

  getMine(): Observable<MenuDto[]> {
    return this.http.get<MenuDto[]>(`${this.baseUrl}/mine`);
  }

  getAll(): Observable<MenuDto[]> {
    return this.http.get<MenuDto[]>(this.baseUrl);
  }

  create(dto: MenuUpsertDto): Observable<MenuDto> {
    return this.http.post<MenuDto>(this.baseUrl, dto);
  }

  update(id: number, dto: MenuUpsertDto): Observable<MenuDto> {
    return this.http.put<MenuDto>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
