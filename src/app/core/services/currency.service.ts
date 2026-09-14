import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CurrencyDto } from '../models/currency.model';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private readonly baseUrl = `${environment.apiUrl}/currencies`;

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<CurrencyDto[]> {
    return this.http.get<CurrencyDto[]>(this.baseUrl);
  }
}
