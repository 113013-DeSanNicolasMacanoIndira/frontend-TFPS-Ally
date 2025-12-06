import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Importaciones corregidas
import { AuthService } from '../../../../services/auth.service';
import { PaymentService } from '../../../../services/payment.service';
import { ServiceRequestService } from '../../../../services/service-request.service';

@Component({
  selector: 'app-pagos-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './pagos-paciente.component.html',
  styleUrls: ['./pagos-paciente.component.scss'],
})
export class PagosPacienteComponent implements OnInit {
  pagoForm: FormGroup;
  username: string = '';
  solicitudesAceptadas: any[] = [];
  solicitudSeleccionada: any = null;
  cargando: boolean = true;
  procesandoPago: boolean = false;
  metodoPagoSeleccionado: string = '';

  // AGREGAR DESCRIPCIÓN A LOS MÉTODOS DE PAGO
  metodosPago = [
    {
      value: 'CONTADO',
      label: 'Efectivo',
      icon: 'bi-cash',
      descripcion: 'Pago en efectivo al momento del servicio',
    },
    {
      value: 'TRANSFERENCIA_BANCARIA',
      label: 'Transferencia Bancaria',
      icon: 'bi-bank',
      descripcion: 'Transferencia a nuestra cuenta bancaria',
    },
    {
      value: 'OBRA_SOCIAL',
      label: 'Obra Social',
      icon: 'bi-heart-pulse',
      descripcion: 'Cobertura a través de tu obra social',
    },
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private paymentService: PaymentService,
    private serviceRequestService: ServiceRequestService,
    private router: Router
  ) {
    this.pagoForm = this.createPagoForm();
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadSolicitudesAceptadas();
  }

  private createPagoForm(): FormGroup {
    return this.fb.group({
      metodoPago: ['', Validators.required],
      datosTransferencia: this.fb.group({
        numeroCuenta: [''],
        nombreTitular: [''],
        cbu: [''],
      }),
      datosObraSocial: this.fb.group({
        numeroAfiliado: [''],
        plan: [''],
        telefono: [''],
      }),
      confirmacion: [false, Validators.requiredTrue],
    });
  }

  private loadUserData(): void {
    const user = this.authService.getUser();
    this.username = user?.email || user?.username || 'Paciente';
  }

  private loadSolicitudesAceptadas(): void {
    this.cargando = true;
    this.paymentService.getSolicitudesAceptadasParaPago().subscribe({
      next: (solicitudes: any[]) => {
        this.solicitudesAceptadas = solicitudes;
        this.cargando = false;
      },
      error: (error: any) => {
        console.error('Error cargando solicitudes:', error);
        this.cargando = false;
        this.solicitudesAceptadas = this.getDatosPrueba();
      },
    });
  }

  // AGREGAR MÉTODO PARA BADGES
  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'ACEPTADO':
        return 'badge-aceptado';
      case 'PENDIENTE':
        return 'badge-pendiente';
      case 'RECHAZADO':
        return 'badge-rechazado';
      case 'COMPLETADO':
        return 'badge-completado';
      default:
        return 'badge-secondary';
    }
  }

  // AGREGAR MÉTODO PARA CALCULAR MONTO
  calcularMontoDefault(): number {
    return 4000; // Monto por defecto
  }

  private getDatosPrueba(): any[] {
    return [
      {
        id: 1,
        especialidad: 'Fisioterapia',
        descripcion: 'Sesión de rehabilitación muscular',
        prestadorNombre: 'Dr. Juan Pérez',
        monto: 4500,
        fechaSolicitud: new Date(),
        estado: 'ACEPTADO',
      },
      {
        id: 2,
        especialidad: 'Enfermería',
        descripcion: 'Cuidados domiciliarios post-operatorios',
        prestadorNombre: 'Lic. María García',
        monto: 3500,
        fechaSolicitud: new Date(),
        estado: 'ACEPTADO',
      },
    ];
  }

  seleccionarSolicitud(solicitud: any): void {
    this.solicitudSeleccionada = solicitud;
    this.pagoForm.patchValue({
      servicioId: solicitud.id,
    });
  }

  onMetodoPagoChange(metodo: string): void {
    this.metodoPagoSeleccionado = metodo;
    this.pagoForm.patchValue({ metodoPago: metodo });
  }

  procesarPago(): void {
    if (this.pagoForm.valid) {
      this.procesandoPago = true;

      const user = this.authService.getUser();
      const pagoData: any = {
        servicioId: this.solicitudSeleccionada.id,
        metodoPago: this.metodoPagoSeleccionado,
        monto: this.solicitudSeleccionada.monto || this.calcularMontoDefault(),
        emailPagador: this.username,
      };

      // Si es transferencia -> agregar lo que backend espera
      if (this.metodoPagoSeleccionado === 'TRANSFERENCIA_BANCARIA') {
        pagoData.cbuDestino = this.pagoForm.value.datosTransferencia.cbu;
      }

      // Si es obra social -> agregar formato backend
      if (this.metodoPagoSeleccionado === 'OBRA_SOCIAL') {
        pagoData.numeroAfiliado = this.pagoForm.value.datosObraSocial.numeroAfiliado;
        pagoData.codigoObraSocial = this.pagoForm.value.datosObraSocial.plan;
      }

      console.log('➡ Payload enviado:', pagoData);

      this.paymentService.createPayment(pagoData).subscribe({
        next: (pagoProcesado: any) => {
          this.procesandoPago = false;
          alert('¡Pago procesado exitosamente!');
          this.solicitudesAceptadas = this.solicitudesAceptadas.filter(
            (s) => s.id !== this.solicitudSeleccionada.id
          );
          this.solicitudSeleccionada = null;
          this.pagoForm.reset();
        },
        error: (error: any) => {
          this.procesandoPago = false;
          console.error('Error procesando pago:', error);
          alert('Error al procesar el pago');
        },
      });
    }
  }

  get mostrarDatosTransferencia(): boolean {
    return this.metodoPagoSeleccionado === 'TRANSFERENCIA_BANCARIA';
  }

  get mostrarDatosObraSocial(): boolean {
    return this.metodoPagoSeleccionado === 'OBRA_SOCIAL';
  }

  logout(): void {
    this.authService.logout();
  }
}
