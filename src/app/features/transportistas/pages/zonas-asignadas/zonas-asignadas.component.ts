import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { ServiceRequestService } from '../../../../services/service-request.service';
import { PatientLocationApiService } from '../../../../services/patient-location-api.service';
import { catchError, of } from 'rxjs';
import { PatientApiService } from '../../../../services/patient-api.service';
type PuntoPaciente = {
  pacienteId: number;
  lat: number;
  lng: number;
  addressText?: string;
  barrio?: string;
};

@Component({
  selector: 'app-zonas-asignadas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './zonas-asignadas.component.html',
  styleUrls: ['./zonas-asignadas.component.css'],
})
export class ZonasAsignadasComponent implements AfterViewInit {
  private map!: L.Map;
  private tiles!: L.TileLayer;
  private markersLayer = L.layerGroup();

  // UI
  barrioFiltro = '';
  barrioSelect = '';
  zonaColor: 'red' | 'yellow' | 'blue' | 'green' = 'red'; // azul por defecto

  // Data
  puntos: PuntoPaciente[] = [];
  puntosFiltrados: PuntoPaciente[] = [];
  barriosDisponibles: string[] = [];

  constructor(
    private srService: ServiceRequestService,
    private locApi: PatientLocationApiService,
    private patientApi: PatientApiService,
  ) {}

  ngAfterViewInit(): void {
    this.map = L.map('map').setView([-31.4167, -64.1833], 12);

    this.tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      updateWhenIdle: true,
      keepBuffer: 2,
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);

    setTimeout(() => {
      this.map.invalidateSize(true);
      this.tiles.redraw();
    }, 500);

    this.cargarPuntos();
  }

  private cargarPuntos() {
    this.srService.getSolicitudesTransportista().subscribe((solicitudes: any[]) => {
      const ids = solicitudes
        .map((s) => Number(s.pacienteId))
        .filter((id: number) => !Number.isNaN(id));

      // evitar duplicados
      const unicos = Array.from(new Set(ids));

      const requests = unicos.map((pacienteId) => this.locApi.getUbicacionPaciente(pacienteId));

      // sin forkJoin por simplicidad (va cargando de a uno)
      unicos.forEach((pacienteId) => {
        this.locApi
          .getUbicacionPaciente(pacienteId)
          .pipe(
            catchError((err) => {
              console.error('Error ubicacion paciente', pacienteId, err);
              return of(null); // no rompe el flujo
            }),
          )
          .subscribe((u: any) => {
            if (!u?.lat || !u?.lng) return;

            const addressText = (u?.addressText ?? '').trim();

            // 👇 si NO viene addressText, buscamos la dirección del paciente
            if (!addressText) {
              this.patientApi
                .getPaciente(pacienteId)
                .pipe(
                  catchError((err) => {
                    console.error('Error paciente', pacienteId, err);
                    return of(null);
                  }),
                )
                .subscribe((pac: any) => {
                  const direccion = (pac?.direccion ?? '').trim();
                  const barrio = this.extraerBarrio(direccion);

                  this.puntos.push({
                    pacienteId,
                    lat: u.lat,
                    lng: u.lng,
                    addressText: direccion, // 👈 domicilio del paciente
                    barrio,
                  });

                  this.actualizarBarrios();
                  this.aplicarFiltro();
                });

              return; // 👈 evita duplicar el push
            }

            // 👇 si SÍ viene addressText, usamos ese
            const barrio = this.extraerBarrio(addressText);

            this.puntos.push({
              pacienteId,
              lat: u.lat,
              lng: u.lng,
              addressText,
              barrio,
            });

            this.actualizarBarrios();
            this.aplicarFiltro();
          });
      });
    });
  }

  // 👇 Ajustá esta función según cómo venga addressText en tu backend
  private extraerBarrio(addressText: string): string {
    // Ejemplos típicos: "Nueva Córdoba, Córdoba" / "Cerro de las Rosas - Córdoba"
    // Lo simple: tomar la primera parte antes de coma o guión
    const txt = (addressText || '').trim();
    if (!txt) return '';
    const splitComma = txt.split(',');
    if (splitComma.length > 1) return splitComma[0].trim();
    const splitDash = txt.split('-');
    if (splitDash.length > 1) return splitDash[0].trim();
    return txt;
  }

  private actualizarBarrios() {
    const set = new Set(
      this.puntos.map((p) => (p.barrio || '').trim()).filter((b) => b.length > 0),
    );
    this.barriosDisponibles = Array.from(set).sort((a, b) => a.localeCompare(b));
  }

  aplicarFiltro() {
    const txt = this.barrioFiltro.trim().toLowerCase();
    const sel = this.barrioSelect.trim().toLowerCase();

    this.puntosFiltrados = this.puntos.filter((p) => {
      const b = (p.barrio || '').toLowerCase();
      const okTxt = txt ? b.includes(txt) : true;
      const okSel = sel ? b === sel : true;
      return okTxt && okSel;
    });

    this.repintarMarkers(true);
  }

  repintarMarkers(ajustarZoom = false) {
    this.markersLayer.clearLayers();

    const icon = this.pinIcon(this.zonaColor);

    this.puntosFiltrados.forEach((p) => {
      L.marker([p.lat, p.lng], { icon }).addTo(this.markersLayer).bindPopup(`
          <b>Paciente ${p.pacienteId}</b><br/>
          ${p.barrio ? `Barrio: ${p.barrio}<br/>` : ''}
          ${p.addressText ? p.addressText : ''}
        `);
    });

    if (ajustarZoom && this.puntosFiltrados.length > 0) {
      const bounds = L.latLngBounds(
        this.puntosFiltrados.map((p) => [p.lat, p.lng] as [number, number]),
      );
      this.map.fitBounds(bounds, { padding: [40, 40] });
    }

    // fuerza repintado tiles por si cambia layout
    setTimeout(() => {
      this.map.invalidateSize(true);
      this.tiles.redraw();
    }, 150);
  }
  private pinIcon(color: 'red' | 'yellow' | 'blue' | 'green'): L.Icon {
    const fill = {
      red: '#dc3545',
      yellow: '#ffc107',
      blue: '#0d6efd',
      green: '#198754',
    }[color];

    const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="34" height="52" viewBox="0 0 34 52">
    <path d="M17 0C8.2 0 1 7.2 1 16c0 11.2 14 35.5 15.2 37.6.4.7 1.3.7 1.7 0C19 51.5 33 27.2 33 16 33 7.2 25.8 0 17 0z"
      fill="${fill}" stroke="white" stroke-width="2"/>
    <circle cx="17" cy="16" r="7" fill="white"/>
  </svg>`;

    return L.icon({
      iconUrl: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
      iconSize: [34, 52],
      iconAnchor: [17, 52],
      popupAnchor: [0, -44],
    });
  }

  private iconoColor(hexColor: string): L.DivIcon {
    return L.divIcon({
      className: '',
      html: `
        <div style="
          width: 18px; height: 18px;
          border-radius: 50%;
          background: ${hexColor};
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,.35);
        "></div>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  }
}
