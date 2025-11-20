import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Importá los componentes usados en las rutas
import { ProviderListComponent } from './components/provider-list/provider-list.component';
import { ServiceRequestComponent } from './components/service-request/service-request.component';
import { MyServicesComponent } from './components/my-services/my-services.component';

const routes: Routes = [
  { path: 'buscar-prestadores', component: ProviderListComponent },
  { path: 'prestadores/:id', component: ServiceRequestComponent },
  { path: 'mis-prestaciones', component: MyServicesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
