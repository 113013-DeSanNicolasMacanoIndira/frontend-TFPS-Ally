import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Provider } from '../models/provider.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProviderService {
  private baseUrl = `${environment.apiUrl}/api/prestadores`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Provider[]> {
    return this.http.get<Provider[]>(this.baseUrl);
  }

  getById(id: number): Observable<Provider> {
    return this.http.get<Provider>(`${this.baseUrl}/${id}`);
  }
}
