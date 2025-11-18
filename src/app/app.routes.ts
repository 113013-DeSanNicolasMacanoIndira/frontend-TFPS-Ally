import { Routes } from '@angular/router';

//  Páginas del módulo pacientes
import { LoginComponent } from './features/pacientes/pages/login/login.component';
import { PortalPacienteComponent } from './features/pacientes/pages/portal-paciente/portal-paciente.component';
import { PortalPacientesDetalleComponent } from './features/pacientes/pages/portal-pacientes-detalle/portal-pacientes-detalle.component';
import { RegistrarPacienteComponent } from './features/pacientes/pages/registrar-paciente/registrar-paciente.component';
import { RegisterComponent } from './features/pacientes/pages/register/register.component';

// Portal PRESTADOR y TRANSPORTISTA 
import { PortalPrestadorComponent } from './features/prestadores/portal-prestador/portal-prestador.component';
import { PortalTransportistaComponent } from './features/transportistas/portal-transportista/portal-transportista.component';

//  Nuevos componentes de prestaciones
import { ProviderListComponent } from './components/provider-list/provider-list.component';
import { ServiceRequestComponent } from './components/service-request/service-request.component';
import { MyServicesComponent } from './components/my-services/my-services.component';

export const routes: Routes = [
  // Rutas base
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'registrar', component: RegistrarPacienteComponent },
  { path: 'register', component: RegisterComponent },

  // PACIENTE
  { path: 'portal-paciente', component: PortalPacienteComponent },
  { path: 'portal-pacientes', component: PortalPacientesDetalleComponent },

  // PRESTADOR 
  { path: 'portal-prestador', component: PortalPrestadorComponent },

  // TRANSPORTISTA 
  { path: 'portal-transportista', component: PortalTransportistaComponent },

  // PRESTACIONES
  { path: 'buscar-prestadores', component: ProviderListComponent },
  { path: 'prestadores/:id', component: ServiceRequestComponent },
  { path: 'mis-prestaciones', component: MyServicesComponent },

  // Fallback
  { path: '**', redirectTo: 'login' }
];
