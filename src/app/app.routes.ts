import { Routes } from '@angular/router';
import { LoginComponent } from './features/pacientes/pages/login/login.component';
import { PortalPacienteComponent } from './features/pacientes/pages/portal-paciente/portal-paciente.component';
import { PortalPacientesDetalleComponent } from './features/pacientes/pages/portal-pacientes-detalle/portal-pacientes-detalle.component';
import { RegistrarPacienteComponent } from './features/pacientes/pages/registrar-paciente/registrar-paciente.component';
import { RegisterComponent } from './features/pacientes/pages/register/register.component'; // ✅ import nuevo
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'portal-paciente', component: PortalPacienteComponent },
  { path: 'portal-pacientes', component: PortalPacientesDetalleComponent },
  { path: 'registrar', component: RegistrarPacienteComponent },
    { path: 'register', component: RegisterComponent }, // ✅ nueva ruta
  { path: '**', redirectTo: 'login' }
];


