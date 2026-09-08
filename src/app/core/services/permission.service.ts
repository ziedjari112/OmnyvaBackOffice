import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PermissionDto } from '../models/role.model';

@Injectable({ providedIn: 'root' })
export class PermissionService {
  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<PermissionDto[]> {
    return this.http.get<PermissionDto[]>(`${environment.apiUrl}/permissions`);
  }
}
