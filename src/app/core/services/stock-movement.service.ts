import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateStockMovementDto, StockMovementDto } from '../models/stock-movement.model';
import { BasePaginatedList, BasePaginatedQuery } from '../models/pagination.model';

@Injectable({ providedIn: 'root' })
export class StockMovementService {
  private readonly baseUrl = `${environment.apiUrl}/stockmovements`;

  constructor(private readonly http: HttpClient) {}

  getPaged(query: BasePaginatedQuery): Observable<BasePaginatedList<StockMovementDto>> {
    return this.http.post<BasePaginatedList<StockMovementDto>>(`${this.baseUrl}/list`, query);
  }

  create(dto: CreateStockMovementDto): Observable<StockMovementDto> {
    return this.http.post<StockMovementDto>(this.baseUrl, dto);
  }
}
