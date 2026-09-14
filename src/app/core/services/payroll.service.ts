import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  MyPayrollDto,
  PayrollConfigDto,
  PayrollSummaryDto,
  PayrollTransactionDto,
  SetPayrollConfigDto,
  SettleResultDto
} from '../models/payroll.model';

@Injectable({ providedIn: 'root' })
export class PayrollService {
  private readonly baseUrl = `${environment.apiUrl}/payroll`;

  constructor(private readonly http: HttpClient) {}

  private dateParams(from?: string | null, to?: string | null): Record<string, string> {
    const params: Record<string, string> = {};
    if (from) params['from'] = from;
    if (to) params['to'] = to;
    return params;
  }

  getConfig(): Observable<PayrollConfigDto> {
    return this.http.get<PayrollConfigDto>(`${this.baseUrl}/config`);
  }

  setConfig(dto: SetPayrollConfigDto): Observable<PayrollConfigDto> {
    return this.http.put<PayrollConfigDto>(`${this.baseUrl}/config`, dto);
  }

  getMine(from?: string | null, to?: string | null): Observable<MyPayrollDto> {
    return this.http.get<MyPayrollDto>(`${this.baseUrl}/mine`, { params: this.dateParams(from, to) });
  }

  getSummary(from?: string | null, to?: string | null): Observable<PayrollSummaryDto> {
    return this.http.get<PayrollSummaryDto>(`${this.baseUrl}/summary`, { params: this.dateParams(from, to) });
  }

  getStaffHistory(staffId: number, from?: string | null, to?: string | null): Observable<PayrollTransactionDto[]> {
    return this.http.get<PayrollTransactionDto[]>(`${this.baseUrl}/staff/${staffId}/history`, {
      params: this.dateParams(from, to)
    });
  }

  settle(staffId: number): Observable<SettleResultDto> {
    return this.http.post<SettleResultDto>(`${this.baseUrl}/staff/${staffId}/settle`, {});
  }
}
