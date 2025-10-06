import { Routes } from '@angular/router';
import { PortalPacienteComponent } from '../pages/portal-paciente/portal-paciente.component';
import { PortalPacientesDetalleComponent } from '../pages/portal-pacientes-detalle/portal-pacientes-detalle.component';
import { RegistrarPacienteComponent } from '../pages/registrar-paciente/registrar-paciente.component';

export const routes: Routes = [
  { path: '', component: PortalPacienteComponent },
  { path: 'portal-pacientes', component: PortalPacientesDetalleComponent },
  { path: 'registrar', component: RegistrarPacienteComponent },
];
