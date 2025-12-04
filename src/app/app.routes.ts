import { Routes } from '@angular/router';

// LOGIN
import { LoginComponent } from './features/logeo/pages/login/login.component';
import { RegisterComponent } from './features/logeo/pages/register/register.component';

// PACIENTES
import { PortalPacienteComponent } from './features/pacientes/pages/portal-paciente/portal-paciente.component';
import { PortalPacientesDetalleComponent } from './features/pacientes/pages/portal-pacientes-detalle/portal-pacientes-detalle.component';
import { RegistrarPacienteComponent } from './features/pacientes/pages/registrar-paciente/registrar-paciente.component';
import { PagosPacienteComponent } from './features/pacientes/pages/pagos-paciente/pagos-paciente.component';

// PRESTADOR + TRANSPORTISTA
import { PortalPrestadorComponent } from './features/prestadores/portal-prestador/portal-prestador.component';
import { PortalTransportistaComponent } from './features/transportistas/portal-transportista/portal-transportista.component';

// ADMIN
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';

// PRESTACIONES
import { ProviderListComponent } from './components/provider-list/provider-list.component';
import { ServiceRequestComponent } from './components/service-request/service-request.component';
import { MyServicesComponent } from './components/my-services/my-services.component';

export const routes: Routes = [

  // Públicos
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registrar', component: RegistrarPacienteComponent },
  { path: 'register', component: RegisterComponent },

  // Paciente
  { path: 'portal-paciente', component: PortalPacienteComponent },
  { path: 'portal-paciente-detalle', component: PortalPacientesDetalleComponent },
  { path: 'pagos-paciente', component: PagosPacienteComponent },

  {
    path: 'solicitudes-paciente',
    loadComponent: () =>
      import('./features/pacientes/pages/solicitudes-paciente/solicitudes-paciente.component')
        .then(c => c.SolicitudesPacienteComponent)
  },

  {
    path: 'modificar-paciente',
    loadComponent: () =>
      import('./features/pacientes/pages/modificar-paciente/modificar-paciente.component')
        .then(c => c.ModificarPacienteComponent)
  },

  // Prestador
  { path: 'portal-prestador', component: PortalPrestadorComponent },

  {
    path: 'prestador/disponibilidad',
    loadComponent: () =>
      import('./features/prestadores/pages/disponibilidad/disponibilidad.component')
        .then(c => c.DisponibilidadComponent)
  },
  {
    path: 'prestador/turnos',
    loadComponent: () =>
      import('./features/prestadores/pages/turnos-prestador/turnos-prestador.component')
        .then(c => c.TurnosPrestadorComponent)
  },
  {
    path: 'prestador/pagos',
    loadComponent: () =>
      import('./features/prestadores/pages/pagos-prestador/pagos-prestador.component')
        .then(c => c.PagosPrestadorComponent)
  },
  {
    path: 'prestador/configuracion',
    loadComponent: () =>
      import('./features/prestadores/pages/configuracion-prestador/configuracion-prestador.component')
        .then(c => c.ConfiguracionPrestadorComponent)
  },

  // Transportista
  { path: 'portal-transportista', component: PortalTransportistaComponent },

  // Prestaciones
  { path: 'buscar-prestadores', component: ProviderListComponent },
  { path: 'prestadores/:id', component: ServiceRequestComponent },
  { path: 'mis-prestaciones', component: MyServicesComponent },

  // ADMIN
  { path: 'admin-dashboard', component: AdminDashboardComponent },

  // Fallback
  { path: '**', redirectTo: 'login' }
];
