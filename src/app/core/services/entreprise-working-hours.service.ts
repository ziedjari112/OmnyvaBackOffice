import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EntrepriseWorkingHoursDto, SetEntrepriseWorkingHoursDto } from '../models/entreprise-working-hours.model';

@Injectable({ providedIn: 'root' })
export class EntrepriseWorkingHoursService {
  private readonly baseUrl = `${environment.apiUrl}/entrepriseworkinghours`;

  constructor(private readonly http: HttpClient) {}

  get(): Observable<EntrepriseWorkingHoursDto[]> {
    return this.http.get<EntrepriseWorkingHoursDto[]>(this.baseUrl);
  }

  set(dto: SetEntrepriseWorkingHoursDto): Observable<EntrepriseWorkingHoursDto[]> {
    return this.http.put<EntrepriseWorkingHoursDto[]>(this.baseUrl, dto);
  }
}
