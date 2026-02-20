import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PatientApiService {
  private API = `${environment.apiUrl}/api/pacientes`;

  constructor(private http: HttpClient) {}

 
  getPaciente(id: number) {
  return this.http.get<any>(`${environment.apiUrl}/api/pacientes/${id}`);
}
}