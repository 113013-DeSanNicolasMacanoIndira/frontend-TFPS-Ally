import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PatientLocationApiService {
  private API = `${environment.apiUrl}/api/pacientes`;

  constructor(private http: HttpClient) {}

  getUbicacionPaciente(pacienteId: number) {
    return this.http.get<any>(`${this.API}/${pacienteId}/ubicacion`);
  }
}