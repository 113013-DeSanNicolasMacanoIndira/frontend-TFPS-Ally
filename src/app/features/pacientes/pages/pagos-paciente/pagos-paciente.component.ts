import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Importaciones
import { AuthService, User } from '../../../../services/auth.service';
import { PaymentService } from '../../../../services/payment.service';
import { PaymentRequestDTO } from '../../../../models/pago.model';
import { MenuPacienteComponent } from '../../../../components/menu-paciente/menu-paciente.component';


@Component({
  selector: 'app-pagos-paciente',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule,MenuPacienteComponent],
  templateUrl: './pagos-paciente.component.html',
  styleUrls: ['./pagos-paciente.component.scss'],
})
export class PagosPacienteComponent implements OnInit {
  pagoForm: FormGroup;
  username: string = '';
  nombrePagador: string = '';
  solicitudesAceptadas: any[] = [];
  solicitudSeleccionada: any = null;
  cargando: boolean = true;
  procesandoPago: boolean = false;
  metodoPagoSeleccionado: string = '';
  importeAPagar: number = 0;

  // Métodos de pago que coinciden con el backend
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
    private router: Router
  ) {
    this.pagoForm = this.createPagoForm();
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadSolicitudesAceptadas();

    // Suscribirse a cambios en el método de pago
    this.pagoForm.get('metodoPago')?.valueChanges.subscribe((metodo) => {
      this.onMetodoPagoChange(metodo);
      this.ajustarValidaciones(metodo);
    });
  }

  private createPagoForm(): FormGroup {
    return this.fb.group({
      metodoPago: ['', Validators.required],
      importeAPagar: [{ value: 0, disabled: true }],
      datosTransferencia: this.fb.group({
        cbu: [''],
        numeroCuenta: [''],
        nombreTitular: [''],
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

  private ajustarValidaciones(metodo: string): void {
    const datosTransferencia = this.pagoForm.get('datosTransferencia');
    const datosObraSocial = this.pagoForm.get('datosObraSocial');
    const datosMercadoPago = this.pagoForm.get('datosMercadoPago');

    // Resetear todas las validaciones
    datosTransferencia?.get('cbu')?.clearValidators();
    datosTransferencia?.get('cbu')?.updateValueAndValidity();

    datosObraSocial?.get('numeroAfiliado')?.clearValidators();
    datosObraSocial?.get('plan')?.clearValidators();
    datosObraSocial?.get('telefono')?.clearValidators();
    datosObraSocial?.updateValueAndValidity();

    datosMercadoPago?.get('email')?.clearValidators();
    datosMercadoPago?.updateValueAndValidity();

    // Aplicar validaciones según el método
    switch (metodo) {
      case 'TRANSFERENCIA_BANCARIA':
        datosTransferencia?.get('cbu')?.setValidators([
          Validators.required,
          Validators.minLength(22),
          Validators.maxLength(22)
        ]);
        datosTransferencia?.get('cbu')?.updateValueAndValidity();
        break;

      case 'OBRA_SOCIAL':
        datosObraSocial?.get('numeroAfiliado')?.setValidators([Validators.required]);
        datosObraSocial?.get('plan')?.setValidators([Validators.required]);
        datosObraSocial?.get('telefono')?.setValidators([Validators.required]);
        datosObraSocial?.updateValueAndValidity();
        break;

      case 'MERCADO_PAGO':
        // Email es opcional para Mercado Pago
        datosMercadoPago?.get('email')?.setValidators([Validators.email]);
        datosMercadoPago?.updateValueAndValidity();
        break;
    }
  }

  private loadUserData(): void {
    const user = this.authService.getUser();

    this.username = user?.email || user?.username || 'Paciente';

    if (user) {
      this.nombrePagador = user.username ||
        user.email?.split('@')[0] ||
        'Paciente';
    } else {
      this.nombrePagador = 'Paciente';
    }
  }

  private loadSolicitudesAceptadas(): void {
    this.cargando = true;
    this.paymentService.getSolicitudesAceptadasParaPago().subscribe({
      next: (solicitudes: any[]) => {
        this.solicitudesAceptadas = solicitudes;
        this.cargando = false;

        if (solicitudes.length === 1) {
          this.seleccionarSolicitud(solicitudes[0]);
        }
      },
      error: (error: any) => {
        console.error('Error cargando solicitudes:', error);
        this.cargando = false;
        this.solicitudesAceptadas = this.getDatosPrueba();

        if (this.solicitudesAceptadas.length > 0) {
          this.seleccionarSolicitud(this.solicitudesAceptadas[0]);
        }
      },
    });
  }

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

  getMontoSolicitud(solicitud: any): number {
    return solicitud?.montoApagar || solicitud?.monto || this.calcularMontoDefault();
  }

  calcularMontoDefault(): number {
    return 4000;
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
    this.importeAPagar = this.getMontoSolicitud(solicitud);

    this.pagoForm.patchValue({
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

      const montoAPagar = this.getMontoSolicitud(this.solicitudSeleccionada);

      const pagoRequest: PaymentRequestDTO = {
        servicioId: this.solicitudSeleccionada.id,
        metodoPago: this.metodoPagoSeleccionado as any,
        monto: montoAPagar,
        emailPagador: this.username,
        nombrePagador: this.nombrePagador,
      };

      if (this.metodoPagoSeleccionado === 'TRANSFERENCIA_BANCARIA') {
        pagoRequest.cbuDestino = this.pagoForm.value.datosTransferencia.cbu;
        pagoRequest.datosAdicionales = {
          numeroCuenta: this.pagoForm.value.datosTransferencia.numeroCuenta,
          nombreTitular: this.pagoForm.value.datosTransferencia.nombreTitular
        };
      }

      if (this.metodoPagoSeleccionado === 'OBRA_SOCIAL') {
        pagoRequest.numeroAfiliado = this.pagoForm.value.datosObraSocial.numeroAfiliado;
        pagoRequest.codigoObraSocial = this.pagoForm.value.datosObraSocial.plan;
        pagoRequest.datosAdicionales = {
          telefono: this.pagoForm.value.datosObraSocial.telefono
        };
      }

      if (this.metodoPagoSeleccionado === 'MERCADO_PAGO') {
        pagoRequest.emailPagador = this.pagoForm.value.datosMercadoPago.email || this.username;
        pagoRequest.datosAdicionales = {
          telefono: this.pagoForm.value.datosMercadoPago.telefono
        };
        pagoRequest.returnUrl = `${window.location.origin}/pago-exitoso`;
        pagoRequest.cancelUrl = `${window.location.origin}/pago-cancelado`;

        this.procesarPagoMercadoPago(pagoRequest);
        return;
      }

      console.log('Enviando pago:', pagoRequest);

      this.paymentService.createPayment(pagoRequest).subscribe({
        next: (pagoProcesado: any) => {
          this.procesandoPago = false;
          console.log('Pago exitoso:', pagoProcesado);

          this.solicitudesAceptadas = this.solicitudesAceptadas.filter(
            s => s.id !== this.solicitudSeleccionada.id
          );

          this.resetearFormulario();
          alert('¡Pago procesado exitosamente!');
        },
        error: (error: any) => {
          this.procesandoPago = false;
          console.error('Error en pago:', error);
          alert(this.obtenerMensajeError(error));
        },
      });
    } else {
      alert('Por favor, complete todos los campos requeridos.');
    }
  }

  procesarPagoMercadoPago(pagoRequest: PaymentRequestDTO): void {
    console.log('Iniciando Mercado Pago:', pagoRequest);

    this.paymentService.crearPreferenciaMercadoPago(pagoRequest).subscribe({
      next: (response: any) => {
        console.log('Respuesta Mercado Pago:', response);

        // Verificar si hay URL de redirección
        if (response.init_point || response.sandbox_init_point) {
          const redirectUrl = response.init_point || response.sandbox_init_point;
          console.log('Redirigiendo a:', redirectUrl);
          window.location.href = redirectUrl;
        }
        // Si el backend está en modo simulación
        else if (response.estado === 'PREFERENCE_CREATED') {
          this.procesandoPago = false;
          console.log('Preferencia creada pero sin URL de redirección');

          // Mostrar mensaje informativo
          alert('✅ Preferencia de Mercado Pago creada exitosamente.\n\n' +
            'Actualmente el sistema está en modo de simulación.\n' +
            'Para producción, configure las credenciales de Mercado Pago en el backend.');

          // Simular pago exitoso
          this.simularPagoMercadoPagoExitoso(pagoRequest);
        }
        else {
          this.procesandoPago = false;
          throw new Error('No se pudo obtener el enlace de pago de Mercado Pago');
        }
      },
      error: (error: any) => {
        this.procesandoPago = false;
        console.error('Error Mercado Pago:', error);
        alert('Error al iniciar Mercado Pago. Intente con otro método.');
      },
    });
  }

  private simularPagoMercadoPagoExitoso(pagoRequest: PaymentRequestDTO): void {
    console.log('Simulando pago exitoso con Mercado Pago');

    // Simular respuesta de pago exitoso
    const pagoProcesado = {
      ...pagoRequest,
      id: Math.floor(Math.random() * 10000),
      estadoPago: 'COMPLETADO',
      numeroTransaccion: 'MP-' + Date.now(),
      metodoPago: 'MERCADO_PAGO',
      fechaPago: new Date(),
      mensaje: 'Pago con Mercado Pago simulado exitosamente'
    };

    // Actualizar la lista de solicitudes
    this.solicitudesAceptadas = this.solicitudesAceptadas.filter(
      s => s.id !== this.solicitudSeleccionada.id
    );

    this.resetearFormulario();

    alert('¡Pago con Mercado Pago simulado exitosamente!\n\n' +
      'En producción, el usuario sería redirigido a Mercado Pago para completar el pago.');
  }

  private obtenerMensajeError(error: any): string {
    if (error.error?.message) {
      return `Error: ${error.error.message}`;
    }
    if (error.status === 400) {
      return 'Error en los datos enviados. Verifique la información.';
    }
    if (error.status === 404) {
      return 'Servicio no encontrado.';
    }
    if (error.status === 500) {
      return 'Error interno del servidor. Intente nuevamente más tarde.';
    }
    return 'Error al procesar el pago. Intente nuevamente.';
  }

  private resetearFormulario(): void {
    this.solicitudSeleccionada = null;
    this.importeAPagar = 0;
    this.pagoForm.reset({
      importeAPagar: 0,
      confirmacion: false
    });
    this.metodoPagoSeleccionado = '';
  }

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
