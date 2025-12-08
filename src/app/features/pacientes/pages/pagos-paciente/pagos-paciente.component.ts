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
  importeAPagar: number = 0;

  // AGREGAR DESCRIPCIÓN A LOS MÉTODOS DE PAGO - Incluyendo MERCADO_PAGO
  metodosPago = [
    {
      value: 'EFECTIVO',
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
    {
      value: 'MERCADO_PAGO',
      label: 'Mercado Pago',
      icon: 'bi-credit-card-2-front',
      descripcion: 'Pago seguro online con tarjeta de crédito/débito',
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
     importeApagar: [{ value: 0, disabled: true }, Validators.required],
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
      datosMercadoPago: this.fb.group({
        email: ['', [Validators.email]],
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

        // Si solo hay una solicitud, seleccionarla automáticamente
        if (solicitudes.length === 1) {
          this.seleccionarSolicitud(solicitudes[0]);
        }
      },
      error: (error: any) => {
        console.error('Error cargando solicitudes:', error);
        this.cargando = false;
        this.solicitudesAceptadas = this.getDatosPrueba();

        // Si hay datos de prueba, seleccionar el primero
        if (this.solicitudesAceptadas.length > 0) {
          this.seleccionarSolicitud(this.solicitudesAceptadas[0]);
        }
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

  // MÉTODO MODIFICADO PARA OBTENER EL MONTO DE LA SOLICITUD
  getMontoSolicitud(solicitud: any): number {
    // Prioridad: montoApagar -> monto -> valor por defecto
    return solicitud?.montoApagar || solicitud?.monto || this.calcularMontoDefault();
  }

  // MÉTODO MODIFICADO PARA CALCULAR MONTO POR DEFECTO (solo si no hay monto en la solicitud)
  calcularMontoDefault(): number {
    return 4000; // Monto por defecto si no hay información
  }

  private getDatosPrueba(): any[] {
    return [
      {
        id: 1,
        especialidad: 'Fisioterapia',
        descripcion: 'Sesión de rehabilitación muscular',
        prestadorNombre: 'Dr. Juan Pérez',
        montoApagar: 4500,
        monto: 4500,
        fechaSolicitud: new Date(),
        estado: 'ACEPTADO',
      },
      {
        id: 2,
        especialidad: 'Enfermería',
        descripcion: 'Cuidados domiciliarios post-operatorios',
        prestadorNombre: 'Lic. María García',
        montoApagar: 3500,
        monto: 3500,
        fechaSolicitud: new Date(),
        estado: 'ACEPTADO',
      },
    ];
  }

  seleccionarSolicitud(solicitud: any): void {
    this.solicitudSeleccionada = solicitud;

    // Obtener el monto a pagar de la solicitud
    this.importeAPagar = this.getMontoSolicitud(solicitud);

    // Actualizar el formulario con el monto
    this.pagoForm.patchValue({
      servicioId: solicitud.id,
      importeAPagar: this.importeAPagar
    });
  }

  onMetodoPagoChange(metodo: string): void {
    this.metodoPagoSeleccionado = metodo;
    this.pagoForm.patchValue({ metodoPago: metodo });
  }

  procesarPago(): void {
    if (this.pagoForm.valid && this.solicitudSeleccionada) {
      this.procesandoPago = true;

      const user = this.authService.getUser();

      // Obtener el monto actualizado antes de enviar
      const montoAPagar = this.getMontoSolicitud(this.solicitudSeleccionada);

      const pagoData: any = {
        servicioId: this.solicitudSeleccionada.id,
        metodoPago: this.metodoPagoSeleccionado,
        monto: montoAPagar,
        emailPagador: this.username,
        montoApagar: montoAPagar
      };

      // Si es transferencia -> agregar lo que backend espera
      if (this.metodoPagoSeleccionado === 'TRANSFERENCIA_BANCARIA') {
        pagoData.cbuDestino = this.pagoForm.value.datosTransferencia.cbu;
        pagoData.numeroCuenta = this.pagoForm.value.datosTransferencia.numeroCuenta;
        pagoData.nombreTitular = this.pagoForm.value.datosTransferencia.nombreTitular;
      }

      // Si es obra social -> agregar formato backend
      if (this.metodoPagoSeleccionado === 'OBRA_SOCIAL') {
        pagoData.numeroAfiliado = this.pagoForm.value.datosObraSocial.numeroAfiliado;
        pagoData.codigoObraSocial = this.pagoForm.value.datosObraSocial.plan;
        pagoData.telefonoObraSocial = this.pagoForm.value.datosObraSocial.telefono;

      }

      // Si es Mercado Pago -> agregar datos
      if (this.metodoPagoSeleccionado === 'MERCADO_PAGO') {
        pagoData.emailMercadoPago = this.pagoForm.value.datosMercadoPago.email || this.username;
        pagoData.telefonoMercadoPago = this.pagoForm.value.datosMercadoPago.telefono;

        // Redirigir a Mercado Pago
        this.procesarPagoMercadoPago(pagoData);
        return; // Salir del método porque Mercado Pago maneja su propio flujo
      }

      console.log('➡ Payload enviado:', pagoData);

      this.paymentService.createPayment(pagoData).subscribe({
        next: (pagoProcesado: any) => {
          this.procesandoPago = false;
          alert('¡Pago procesado exitosamente!');

          // Actualizar la lista de solicitudes
          this.solicitudesAceptadas = this.solicitudesAceptadas.filter(
            (s) => s.id !== this.solicitudSeleccionada.id
          );

          this.solicitudSeleccionada = null;
          this.importeAPagar = 0;
          this.pagoForm.reset();
          this.pagoForm.patchValue({ importeAPagar: 0 });
        },
        error: (error: any) => {
          this.procesandoPago = false;
          console.error('Error procesando pago:', error);
          alert('Error al procesar el pago');
        },
      });
    } else {
      alert('Por favor, complete todos los campos requeridos y seleccione una solicitud.');
    }
  }

  // MÉTODO PARA PROCESAR PAGO CON MERCADO PAGO
  procesarPagoMercadoPago(pagoData: any): void {
    // Integración con la API de Mercado Pago
    console.log('Iniciando pago con Mercado Pago:', pagoData);

    // Opción temporal: simular pago de Mercado Pago
    // TODO: Descomentar cuando tengas implementado el backend
    // this.paymentService.crearPreferenciaMercadoPago(pagoData).subscribe({
    //   next: (response: any) => {
    //     // Redirigir al checkout de Mercado Pago
    //     if (response.init_point) {
    //       window.location.href = response.init_point;
    //     } else if (response.sandbox_init_point) {
    //       window.location.href = response.sandbox_init_point;
    //     } else {
    //       throw new Error('No se pudo obtener el enlace de pago');
    //     }
    //   },
    //   error: (error: any) => {
    //     this.procesandoPago = false;
    //     console.error('Error creando preferencia de Mercado Pago:', error);
    //     alert('Error al iniciar el pago con Mercado Pago. Por favor, intente con otro método.');
    //   },
    // });

    // TEMPORAL: Simulación mientras se implementa el backend
    setTimeout(() => {
      this.procesandoPago = false;
      alert('Mercado Pago está en desarrollo. Por ahora, usa otro método de pago.');
      // O podrías simular un pago exitoso:
      // this.simularPagoMercadoPagoExitoso(pagoData);
    }, 1000);
  }

  // MÉTODO PARA SIMULAR PAGO EXITOSO CON MERCADO PAGO (temporal)
  private simularPagoMercadoPagoExitoso(pagoData: any): void {
    console.log('Simulando pago exitoso con Mercado Pago');

    // Simular respuesta de pago exitoso
    const pagoProcesado = {
      ...pagoData,
      id: Math.floor(Math.random() * 10000),
      estadoPago: 'COMPLETADO',
      numeroTransaccion: 'MP-' + Date.now(),
      metodoPago: 'MERCADO_PAGO',
      fechaPago: new Date(),
      mensaje: 'Pago con Mercado Pago procesado exitosamente'
    };

    // Actualizar la lista de solicitudes
    this.solicitudesAceptadas = this.solicitudesAceptadas.filter(
      (s) => s.id !== this.solicitudSeleccionada.id
    );

    this.solicitudSeleccionada = null;
    this.importeAPagar = 0;
    this.pagoForm.reset();
    this.pagoForm.patchValue({ importeAPagar: 0 });

    alert('¡Pago con Mercado Pago simulado exitosamente!\n\nNota: Esto es una simulación. Para producción, implementa la integración real con Mercado Pago.');
  }

  // MÉTODO PARA FORMATEAR MONTO CON SEPARADORES DE MILES
  formatMonto(monto: number): string {
    return monto ? monto.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) : '0.00';
  }

  get mostrarDatosTransferencia(): boolean {
    return this.metodoPagoSeleccionado === 'TRANSFERENCIA_BANCARIA';
  }

  get mostrarDatosObraSocial(): boolean {
    return this.metodoPagoSeleccionado === 'OBRA_SOCIAL';
  }

  get mostrarDatosMercadoPago(): boolean {
    return this.metodoPagoSeleccionado === 'MERCADO_PAGO';
  }

  logout(): void {
    this.authService.logout();
  }
}
