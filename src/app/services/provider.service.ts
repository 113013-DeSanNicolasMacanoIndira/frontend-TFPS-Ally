import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Provider } from '../models/provider.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProviderService {
  private baseUrl = `${environment.apiUrl}/api/prestadores`;

  constructor(private http: HttpClient) {}

  // Obtener todos los prestadores
  getAll(): Observable<Provider[]> {
    return this.http.get<Provider[]>(this.baseUrl);
  }

  // Obtener prestador por ID
  getById(id: number): Observable<Provider> {
    return this.http.get<Provider>(`${this.baseUrl}/${id}`);
  }

  // Obtener prestador por ID de usuario
  getByUsuarioId(usuarioId: number): Observable<Provider> {
    return this.http.get<Provider>(`${this.baseUrl}/usuario/${usuarioId}`);
  }

  // Crear nuevo prestador
  create(prestador: Provider): Observable<Provider> {
    return this.http.post<Provider>(this.baseUrl, prestador);
  }

  // Actualizar prestador existente
  update(id: number, prestador: Provider): Observable<Provider> {
    return this.http.put<Provider>(`${this.baseUrl}/${id}`, prestador);
  }

  // Baja lógica del prestador
  darDeBaja(id: number): Observable<Provider> {
    return this.http.patch<Provider>(`${this.baseUrl}/${id}/baja`, {});
  }

  // Reactivar prestador
  reactivar(id: number): Observable<Provider> {
    return this.http.patch<Provider>(`${this.baseUrl}/${id}/reactivar`, {});
  }
}
