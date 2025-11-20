import { Component } from '@angular/core';

@Component({
  selector: 'app-turnos-prestador',
  standalone: true,
  template: `
    <div class="container mt-4">
      <h2>Mis turnos</h2>
      <p>Aquí aparecerán los turnos confirmados y programados.</p>
    </div>
  `,
})
export class TurnosPrestadorComponent {}
