import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminMetrics, AdminUser } from '../models/admin.model';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = '/api/admin';

  constructor(private http: HttpClient) {}

  getMetrics(): Observable<AdminMetrics> {
    return this.http.get<AdminMetrics>(`${this.apiUrl}/metrics`);
  }

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/users`);
  }

  toggleUser(id: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/users/${id}/toggle`, {});
  }
}
