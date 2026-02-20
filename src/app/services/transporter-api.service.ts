import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export type TransporterCreateDTO = {
  nombre: string;
  apellido: string;
  fechaNacimiento: string; // yyyy-MM-dd
  direccion: string;
  telefono: string;
  telegram?: string | null;
  correoElectronico: string;
  usuarioId: number;
  zonaCobertura: string;
};

@Injectable({ providedIn: 'root' })
export class TransporterApiService {
  private API = `${environment.apiUrl}/api/transportistas`;

  constructor(private http: HttpClient) {}

  getByUsuarioId(usuarioId: number): Observable<any> {
    return this.http.get<any>(`${this.API}/usuario/${usuarioId}`);
  }

  create(payload: TransporterCreateDTO): Observable<any> {
    return this.http.post<any>(`${this.API}`, payload);
  }

  getZonasCobertura(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API}/zonas-cobertura`);
  }
}