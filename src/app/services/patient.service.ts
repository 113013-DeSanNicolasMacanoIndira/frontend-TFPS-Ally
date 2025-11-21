import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; //  import

export interface Patient {
  id?: number;
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  direccion?: string;
  telefono?: string;
  telegram?: string | null;
  correoElectronico: string;
  idUsuario?: number;
  numeroHistoriaClinica: string;
  codigoObraSocial: string;
  nroAfiliadoObraSocial: string;
  tipoDiscapacidad?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private baseUrl = `${environment.apiUrl}/patients`;

  constructor(private http: HttpClient) {}

  create(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(this.baseUrl, patient);
  }

  getAll(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.baseUrl);
  }

  getById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.baseUrl}/${id}`);
  }
  //  NUEVO MÉTODO
  getByUserId(idUsuario: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.baseUrl}/usuario/${idUsuario}`);
  }

  update(id: number, patient: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.baseUrl}/${id}`, patient);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
