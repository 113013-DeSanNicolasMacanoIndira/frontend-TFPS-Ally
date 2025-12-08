import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// Interface para las especialidades
export interface Specialty {
  id: number;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
  monto?: number; //  Asegurar que el monto venga del backend
}

@Injectable({
  providedIn: 'root'
})
export class SpecialtyService {

  private baseUrl = `${environment.apiUrl}/api/especialidades`;

  constructor(private http: HttpClient) {}

  // Obtener todas las especialidades - CORREGIDO: usar any[] en lugar de Specialty[]
  getAll(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  // Obtener especialidad por ID - CORREGIDO: usar any en lugar de Specialty
  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  // Obtener especialidades activas - CORREGIDO: usar any[] en lugar de Specialty[]
  getActivas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/activas`);

  }
   // 🆕 ACTUALIZAR MONTO DE UNA ESPECIALIDAD
  updateMonto(id: number, nuevoMonto: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/monto`, { monto: nuevoMonto });
  }
}
