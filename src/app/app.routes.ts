import { Routes } from '@angular/router';
import { PortalPacienteComponent } from './features/pacientes/pages/portal-paciente/portal-paciente.component';
import { PortalPacientesDetalleComponent } from './features/pacientes/pages/portal-pacientes-detalle/portal-pacientes-detalle.component';
import { RegistrarPacienteComponent } from './features/pacientes/pages/registrar-paciente/registrar-paciente.component';

export const routes: Routes = [
  { path: '', redirectTo: 'portal-paciente', pathMatch: 'full' },
  { path: 'portal-paciente', component: PortalPacienteComponent },
  { path: 'portal-pacientes', component: PortalPacientesDetalleComponent },
  { path: 'registrar', component: RegistrarPacienteComponent },
  { path: '**', redirectTo: 'portal-paciente' }
];


