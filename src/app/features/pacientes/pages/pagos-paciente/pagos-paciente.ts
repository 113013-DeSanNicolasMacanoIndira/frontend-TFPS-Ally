import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PaymentService } from '../../services/payment.service';
import { ServiceRequestService } from '../../services/service-request.service';

/**
 * COMPONENTE: Pagos del Paciente
 *
 * FUNCIONALIDAD:
 * - Lista solicitudes aceptadas pendientes de pago
 * - Permite seleccionar método de pago (efectivo, transferencia, obra social)
 * - Procesa pagos mediante diferentes métodos
 * - Muestra confirmación y estado de pagos
 */
@Component({
  selector: 'app-pagos-paciente',
  templateUrl: './pagos-paciente.component.html',
  styleUrls: ['./pagos-paciente.component.css']
})
export class PagosPacienteComponent implements OnInit {
  // Formulario de pago
  pagoForm: FormGroup;

  // Datos del usuario
  username: string = '';

  // Listas de datos
  solicitudesAceptadas: any[] = [];
  solicitudSeleccionada: any = null;

  // Estados y controles
  cargando: boolean = true;
  procesandoPago: boolean = false;
  metodoPagoSeleccionado: string = '';

  // Métodos de pago disponibles
  metodosPago = [
    { value: 'EFECTIVO', label: 'Efectivo', icon: 'bi-cash', descripcion: 'Pago en efectivo al momento del servicio' },
    { value: 'TRANSFERENCIA', label: 'Transferencia Bancaria', icon: 'bi-bank', descripcion: 'Transferencia a nuestra cuenta bancaria' },
    { value: 'OBRA_SOCIAL', label: 'Obra Social', icon: 'bi-heart-pulse', descripcion: 'Cobertura a través de tu obra social' }
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

  /**
   * Crea el formulario reactivo para pagos
   */
  private createPagoForm(): FormGroup {
    return this.fb.group({
      solicitudId: ['', Validators.required],
      metodoPago: ['', Validators.required],
      datosTransferencia: this.fb.group({
        numeroCuenta: [''],
        nombreTitular: [''],
        cbu: ['']
      }),
      datosObraSocial: this.fb.group({
        numeroAfiliado: ['', Validators.required],
        plan: ['', Validators.required],
        telefono: ['', Validators.required]
      }),
      confirmacion: [false, Validators.requiredTrue]
    });
  }

  /**
   * Carga los datos del usuario actual
   */
  private loadUserData(): void {
    const user = this.authService.getCurrentUser();
    this.username = user?.email || 'Paciente';
  }

  /**
   * Carga las solicitudes aceptadas pendientes de pago
   */
  private loadSolicitudesAceptadas(): void {
    this.cargando = true;
    this.paymentService.getSolicitudesAceptadasParaPago().subscribe({
      next: (solicitudes) => {
        this.solicitudesAceptadas = solicitudes;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error cargando solicitudes aceptadas:', error);
        this.cargando = false;
        // En caso de error, mostrar array vacío
        this.solicitudesAceptadas = [];
      }
    });
  }

  /**
   * Selecciona una solicitud para pagar
   */
  seleccionarSolicitud(solicitud: any): void {
    this.solicitudSeleccionada = solicitud;
    this.pagoForm.patchValue({
      solicitudId: solicitud.id
    });
  }

  /**
   * Maneja el cambio de método de pago
   */
  onMetodoPagoChange(metodo: string): void {
    this.metodoPagoSeleccionado = metodo;
    this.pagoForm.patchValue({ metodoPago: metodo });

    // Resetear grupos condicionales
    this.pagoForm.get('datosTransferencia')?.reset();
    this.pagoForm.get('datosObraSocial')?.reset();

    // Actualizar validaciones según método seleccionado
    this.updateValidations();
  }

  /**
   * Actualiza las validaciones del formulario según el método de pago
   */
  private updateValidations(): void {
    const datosObraSocial = this.pagoForm.get('datosObraSocial');

    if (this.metodoPagoSeleccionado === 'OBRA_SOCIAL') {
      datosObraSocial?.get('numeroAfiliado')?.setValidators([Validators.required]);
      datosObraSocial?.get('plan')?.setValidators([Validators.required]);
      datosObraSocial?.get('telefono')?.setValidators([Validators.required]);
    } else {
      datosObraSocial?.get('numeroAfiliado')?.clearValidators();
      datosObraSocial?.get('plan')?.clearValidators();
      datosObraSocial?.get('telefono')?.clearValidators();
    }

    datosObraSocial?.get('numeroAfiliado')?.updateValueAndValidity();
    datosObraSocial?.get('plan')?.updateValueAndValidity();
    datosObraSocial?.get('telefono')?.updateValueAndValidity();
  }

  /**
   * Procesa el pago según el método seleccionado
   */
  procesarPago(): void {
    if (this.pagoForm.valid) {
      this.procesandoPago = true;

      const pagoData = {
        ...this.pagoForm.value,
        pacienteId: this.authService.getCurrentUser()?.id,
        monto: this.solicitudSeleccionada.monto || this.calcularMontoDefault(),
        fechaPago: new Date()
      };

      this.paymentService.createPayment(pagoData).subscribe({
        next: (pagoProcesado) => {
          this.procesandoPago = false;
          this.mostrarConfirmacionPago(pagoProcesado);
          this.actualizarListaSolicitudes();
        },
        error: (error) => {
          this.procesandoPago = false;
          console.error('Error procesando pago:', error);
          alert('Error al procesar el pago. Por favor, intente nuevamente.');
        }
      });
    } else {
      this.marcarFormularioComoTocado();
    }
  }

  /**
   * Calcula un monto default para la solicitud
   */
  private calcularMontoDefault(): number {
    // Lógica para calcular monto basado en tipo de servicio, duración, etc.
    const montosPorEspecialidad: { [key: string]: number } = {
      'FISIOTERAPIA': 4500,
      'ENFERMERIA': 3500,
      'TERAPIA_OCUPACIONAL': 5000,
      'PSICOLOGIA': 4000,
      'ASISTENCIA_DOMICILIARIA': 3000
    };

    return montosPorEspecialidad[this.solicitudSeleccionada.especialidad] || 4000;
  }

  /**
   * Muestra confirmación de pago exitoso
   */
  private mostrarConfirmacionPago(pago: any): void {
    const mensaje = `
      ¡Pago procesado exitosamente!

      📋 Detalles del pago:
      • Número de transacción: ${pago.id}
      • Método: ${this.getMetodoPagoLabel(pago.metodoPago)}
      • Monto: $${pago.monto}
      • Fecha: ${new Date(pago.fechaPago).toLocaleDateString()}

      ¡Gracias por su pago!
    `;

    alert(mensaje);
    this.resetFormulario();
  }

  /**
   * Obtiene el label del método de pago
   */
  private getMetodoPagoLabel(metodo: string): string {
    const metodoObj = this.metodosPago.find(m => m.value === metodo);
    return metodoObj ? metodoObj.label : metodo;
  }

  /**
   * Actualiza la lista de solicitudes después del pago
   */
  private actualizarListaSolicitudes(): void {
    this.solicitudesAceptadas = this.solicitudesAceptadas.filter(
      s => s.id !== this.solicitudSeleccionada.id
    );
    this.solicitudSeleccionada = null;
  }

  /**
   * Resetea el formulario después del pago
   */
  private resetFormulario(): void {
    this.pagoForm.reset({
      metodoPago: '',
      confirmacion: false
    });
    this.metodoPagoSeleccionado = '';
  }

  /**
   * Marca todos los campos del formulario como tocados
   */
  private marcarFormularioComoTocado(): void {
    Object.keys(this.pagoForm.controls).forEach(key => {
      const control = this.pagoForm.get(key);
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(subKey => {
          control.get(subKey)?.markAsTouched();
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  /**
   * Verifica si se deben mostrar campos adicionales para transferencia
   */
  get mostrarDatosTransferencia(): boolean {
    return this.metodoPagoSeleccionado === 'TRANSFERENCIA';
  }

  /**
   * Verifica si se deben mostrar campos adicionales para obra social
   */
  get mostrarDatosObraSocial(): boolean {
    return this.metodoPagoSeleccionado === 'OBRA_SOCIAL';
  }

  /**
   * Navega de vuelta a las solicitudes
   */
  volverASolicitudes(): void {
    this.router.navigate(['/mis-solicitudes']);
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * Obtiene la clase CSS para el badge de estado
   */
  getBadgeClass(estado: string): string {
    switch (estado) {
      case 'ACEPTADO': return 'badge-aceptado';
      case 'PENDIENTE': return 'badge-pendiente';
      case 'RECHAZADO': return 'badge-rechazado';
      default: return 'badge-secondary';
    }
  }
}
