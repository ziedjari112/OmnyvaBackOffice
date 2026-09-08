import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MenuDto } from '../models/menu.model';

@Injectable({ providedIn: 'root' })
export class MenuService {
  constructor(private readonly http: HttpClient) {}

  getMine(): Observable<MenuDto[]> {
    return this.http.get<MenuDto[]>(`${environment.apiUrl}/menus/mine`);
  }
}
