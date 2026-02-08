import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProviderReports } from '../models/provider-reports.model';

@Injectable({ providedIn: 'root' })
export class ProviderReportsService {
  private baseUrl = `${environment.apiUrl}/api/prestadores`;

  constructor(private http: HttpClient) {}

  getReports(
    prestadorId: number,
    periodo: '6M' | '12M' | 'ALL'
  ): Observable<ProviderReports> {
    return this.http.get<ProviderReports>(`${this.baseUrl}/${prestadorId}/reportes`, {
      params: { periodo }
    });
  }
}