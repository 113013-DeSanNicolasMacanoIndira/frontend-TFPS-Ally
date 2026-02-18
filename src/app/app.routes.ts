import { Routes } from '@angular/router';

// LOGEO
import { LoginComponent } from './features/logeo/pages/login/login.component';
import { RegisterComponent } from './features/logeo/pages/register/register.component';

// PACIENTES
import { PortalPacienteComponent } from './features/pacientes/pages/portal-paciente/portal-paciente.component';
import { PortalPacientesDetalleComponent } from './features/pacientes/pages/portal-pacientes-detalle/portal-pacientes-detalle.component';
import { RegistrarPacienteComponent } from './features/pacientes/pages/registrar-paciente/registrar-paciente.component';


// PRESTADOR + TRANSPORTISTA
import { PortalPrestadorComponent } from './features/prestadores/portal-prestador/portal-prestador.component';
import { PortalTransportistaComponent } from './features/transportistas/portal-transportista/portal-transportista.component';

// PRESTACIONES
import { ProviderListComponent } from './components/provider-list/provider-list.component';
import { ServiceRequestComponent } from './components/service-request/service-request.component';
import { MyServicesComponent } from './components/my-services/my-services.component';

// ADMIN
//import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';

export const routes: Routes = [
  // ================================
  //        RUTAS PÚBLICAS
  // ================================
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registrar', component: RegistrarPacienteComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./features/logeo/pages/reset-password/reset-password.component')
        .then(c => c.ResetPasswordComponent),
  },

  // ================================
  //        RUTAS DE PACIENTE
  // ================================
  { path: 'portal-paciente', component: PortalPacienteComponent },
  { path: 'portal-pacientes', component: PortalPacientesDetalleComponent },
  { path: 'portal-pacientes', component: PortalPacientesDetalleComponent },
  // TÉRMINOS Y CONDICIONES
  {
    path: 'terms',
    loadComponent: () =>
      import('./features/logeo/pages/terms/terms.component').then((c) => c.TermsComponent),
  },

  // SOLICITUDES PACIENTE
  {
    path: 'solicitudes-paciente',
    loadComponent: () =>
      import('./features/pacientes/pages/solicitudes-paciente/solicitudes-paciente.component').then(
        (c) => c.SolicitudesPacienteComponent,
      ),
  },

  // PAGOS PACIENTE
  {
    path: 'pagos-paciente',
    loadComponent: () =>
      import('./features/pacientes/pages/pagos-paciente/pagos-paciente.component').then(
        (c) => c.PagosPacienteComponent,
      ),
  },

  // PAGO SERVICIO (alias para compatibilidad)
  {
    path: 'pago-servicio',
    loadComponent: () =>
      import('./features/pacientes/pages/pagos-paciente/pagos-paciente.component').then(
        (c) => c.PagosPacienteComponent,
      ),
  },

  // MODIFICAR PACIENTE
  {
    path: 'modificar-paciente',
    loadComponent: () =>
      import('./features/pacientes/pages/modificar-paciente/modificar-paciente.component').then(
        (c) => c.ModificarPacienteComponent,
      ),
  },
  {
    path: 'reportes-paciente',
    loadComponent: () =>
      import('./features/pacientes/pages/reportes-paciente/reportes-paciente.component').then(
        (m) => m.ReportesPacienteComponent,
      ),
  },


  {
    path: 'discapacidad-mental',
    loadComponent: () =>
      import('./features/pacientes/pages/discapacidad-mental/discapacidad-mental.component')
        .then(m => m.DiscapacidadMentalComponent),
  },
  {
    path: 'discapacidad-fisica',
    loadComponent: () =>
      import('./features/pacientes/pages/discapacidad-fisica/discapacidad-fisica.component')
        .then(m => m.DiscapacidadFisicaComponent),
  },

  // ================================
  //        RUTAS DE PRESTADOR
  // ================================
  { path: 'portal-prestador', component: PortalPrestadorComponent },

  // RUTAS INTERNAS PRESTADOR
  {
    path: 'prestador/disponibilidad',
    loadComponent: () =>
      import('./features/prestadores/pages/disponibilidad/disponibilidad.component').then(
        (c) => c.DisponibilidadComponent,
      ),
  },
  {
    path: 'prestador/turnos',
    loadComponent: () =>
      import('./features/prestadores/pages/turnos-prestador/turnos-prestador.component').then(
        (c) => c.TurnosPrestadorComponent,
      ),
  },
  {
    path: 'prestador/pagos',
    loadComponent: () =>
      import('./features/prestadores/pages/pagos-prestador/pagos-prestador.component').then(
        (c) => c.PagosPrestadorComponent,
      ),
  },
  {
    path: 'prestador/configuracion',
    loadComponent: () =>
      import('./features/prestadores/pages/configuracion-prestador/configuracion-prestador.component').then(
        (c) => c.ConfiguracionPrestadorComponent,
      ),
  },

  // ================================
  //        RUTAS DE TRANSPORTISTA
  // ================================
  { path: 'portal-transportista', component: PortalTransportistaComponent },
  {
    path: 'transportista/zonas',
    loadComponent: () =>
      import('./features/transportistas/pages/zonas-asignadas/zonas-asignadas.component')
        .then(m => m.ZonasAsignadasComponent),
  },
  // ================================
  //        PRESTACIONES
  // ================================
  { path: 'buscar-prestadores', component: ProviderListComponent },
  { path: 'prestadores/:id', component: ServiceRequestComponent },
  { path: 'mis-prestaciones', component: MyServicesComponent },

  // ================================
  //        ADMIN
  // ================================
  {
    path: 'admin-dashboard',
    loadComponent: () =>
      import('./features/admin/admin-dashboard.component').then((c) => c.AdminDashboardComponent),
  },

  // ================================
  //        RUTA DE FALLBACK
  // ================================
  { path: '**', redirectTo: 'login' },
];
