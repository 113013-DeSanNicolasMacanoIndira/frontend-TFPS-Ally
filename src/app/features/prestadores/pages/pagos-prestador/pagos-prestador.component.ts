import { Component } from '@angular/core';

@Component({
  selector: 'app-pagos-prestador',
  standalone: true,
  template: `
    <div class="container mt-4">
      <h2>Pagos pendientes</h2>
      <p>Aquí verás tus pagos, liquidaciones y estado de cobros.</p>
    </div>
  `,
})
export class PagosPrestadorComponent {}
