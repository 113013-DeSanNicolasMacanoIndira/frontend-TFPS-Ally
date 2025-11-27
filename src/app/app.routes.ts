import { Routes } from '@angular/router';

// PACIENTES
import { LoginComponent } from './features/pacientes/pages/login/login.component';
import { PortalPacienteComponent } from './features/pacientes/pages/portal-paciente/portal-paciente.component';
import { PortalPacientesDetalleComponent } from './features/pacientes/pages/portal-pacientes-detalle/portal-pacientes-detalle.component';
import { RegistrarPacienteComponent } from './features/pacientes/pages/registrar-paciente/registrar-paciente.component';
import { RegisterComponent } from './features/pacientes/pages/register/register.component';
import { PagosPacienteComponent} from './features/pacientes/pages/pagos-paciente/pagos-paciente';
// PRESTADOR + TRANSPORTISTA
import { PortalPrestadorComponent } from './features/prestadores/portal-prestador/portal-prestador.component';
import { PortalTransportistaComponent } from './features/transportistas/portal-transportista/portal-transportista.component';

// PRESTACIONES
import { ProviderListComponent } from './components/provider-list/provider-list.component';
import { ServiceRequestComponent } from './components/service-request/service-request.component';
import { MyServicesComponent } from './components/my-services/my-services.component';

export const routes: Routes = [
  // ================================
  //        RUTAS PÚBLICAS
  // ================================
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registrar', component: RegistrarPacienteComponent },
  { path: 'register', component: RegisterComponent },

  // ================================
  //        RUTAS DE PACIENTE
  // ================================
  { path: 'portal-paciente', component: PortalPacienteComponent },
  { path: 'portal-pacientes', component: PortalPacientesDetalleComponent },

  // SOLICITUDES Y GESTIÓN DE PACIENTE
  {
    path: 'solicitudes-paciente',
    loadComponent: () =>
      import('./features/pacientes/pages/solicitudes-paciente/solicitudes-paciente.component')
        .then(c => c.SolicitudesPacienteComponent)
  },

  // ➕ NUEVO: PAGOS PACIENTE
  {
    path: 'pagos-paciente',
    loadComponent: () =>
      import('./features/pacientes/pages/pagos-paciente/pagos-paciente.component')
        .then(c => c.PagosPacienteComponent)
  },

  // ➕ NUEVO: PAGO SERVICIO (alias para compatibilidad)
  {
    path: 'pago-servicio',
    loadComponent: () =>
      import('./features/pacientes/pages/pagos-paciente/pagos-paciente.component')
        .then(c => c.PagosPacienteComponent)
  },

  // GESTIÓN DE PERFIL PACIENTE
  {
    path: 'modificar-paciente',
    loadComponent: () =>
      import('./features/pacientes/pages/modificar-paciente/modificar-paciente.component')
        .then(c => c.ModificarPacienteComponent)
  },

  // ================================
  //        RUTAS DE PRESTADOR
  // ================================
  { path: 'portal-prestador', component: PortalPrestadorComponent },

  // RUTAS INTERNAS PRESTADOR
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

  // ================================
  //        RUTAS DE TRANSPORTISTA
  // ================================
  { path: 'portal-transportista', component: PortalTransportistaComponent },

  // ================================
  //        PRESTACIONES
  // ================================
  { path: 'buscar-prestadores', component: ProviderListComponent },
  { path: 'prestadores/:id', component: ServiceRequestComponent },
  { path: 'mis-prestaciones', component: MyServicesComponent },

  // ================================
  //        RUTA DE FALLBACK
  // ================================
  { path: '**', redirectTo: 'login' }
];
