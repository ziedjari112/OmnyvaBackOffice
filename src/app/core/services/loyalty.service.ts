import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LoyaltyConfigDto,
  LoyaltyConfigUpsertDto,
  LoyaltyReferenceLookupDto,
  MyLoyaltyPointsDto
} from '../models/loyalty.model';

@Injectable({ providedIn: 'root' })
export class LoyaltyService {
  private readonly baseUrl = `${environment.apiUrl}/loyalty`;

  constructor(private readonly http: HttpClient) {}

  getConfig(): Observable<LoyaltyConfigDto> {
    return this.http.get<LoyaltyConfigDto>(`${this.baseUrl}/config`);
  }

  updateConfig(dto: LoyaltyConfigUpsertDto): Observable<LoyaltyConfigDto> {
    return this.http.put<LoyaltyConfigDto>(`${this.baseUrl}/config`, dto);
  }

  getMine(): Observable<MyLoyaltyPointsDto[]> {
    return this.http.get<MyLoyaltyPointsDto[]>(`${this.baseUrl}/mine`);
  }

  getMyQrCode(): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/my-qr`, { responseType: 'blob' });
  }

  lookupByReference(code: string): Observable<LoyaltyReferenceLookupDto> {
    return this.http.get<LoyaltyReferenceLookupDto>(`${this.baseUrl}/reference/${encodeURIComponent(code)}`);
  }
}
