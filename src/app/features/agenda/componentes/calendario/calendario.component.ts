import { Component, Input, OnInit, effect, computed, signal, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CitasService } from '../../../../shared/services/citas.service';
import { Cita } from '../../../../models/citas/Cita';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { DetallesCitaComponent } from '../detalles-cita/detalles-cita/detalles-cita.component';
import { MatDialog } from '@angular/material/dialog';
import { CrearEditarCitaComponent } from '../crear-editar-cita/crear-editar-cita.component';
import localeEs from '@angular/common/locales/es';
import { MenuLateralComponent } from "../menu-lateral/menu-lateral/menu-lateral.component";
import { NotificationService } from '../../../../shared/services/notification.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';

registerLocaleData(localeEs);

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatExpansionModule,
    MatSnackBarModule,
  ],
  templateUrl: './calendario.component.html',
  styleUrl: './calendario.component.css',
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class CalendarioComponent implements OnInit {
  private citasService = inject(CitasService);
  private notificationService = inject(NotificationService);
  @Input() vistaActual: 'dia' | 'semana' | 'mes' = 'mes';
  @Output() vistaActualChange = new EventEmitter<'dia' | 'semana' | 'mes'>();
  @Output() nuevaCita = new EventEmitter<void>();
  citasHoy: Cita[] = [];
  citasManana: Cita[] = [];
  citasSemana: Cita[] = [];
  trackByHora(_index: number, hora: number): number {
    return hora;
  }

  trackByDiaString(_index: number, dia: string): string {
    return dia;
  }

  trackByDia(_index: number, dia: Date): string {
    return dia.toISOString();
  }

  trackByCita(_index: number, cita: Cita): number {
    return cita.id;
  }
 // Método para crear cita
 crearNuevaCita() {
  const dialogRef = this.dialog.open(CrearEditarCitaComponent, {
    width: '600px',
    disableClose: true,
    data: null
  });

  const componentInstance = dialogRef.componentInstance;
  const subscription = componentInstance.onSubmit.subscribe((citaData: any) => {
    this.notificationService.showLoading('Creando cita...');
    this.citasService.crearCita(citaData).subscribe({
      next: (response) => {
        this.notificationService.closeLoading();
        if (response.succeded) {
          this.notificationService.success('¡Cita creada correctamente!');
          this.cargarCitas();
          this.cargarCitasMenuLateral();
          dialogRef.close(); // Solo cerramos si fue exitoso
        } else {
          this.notificationService.handleBackendError(response);
        }
      },
      error: (error) => {
        this.notificationService.closeLoading();
        if (error.error) {
          this.notificationService.handleBackendError(error.error);
        } else {
          this.notificationService.showErrorAlert('Error al conectar con el servidor');
        }
      }
    });
  });
  dialogRef.afterClosed().subscribe(() => {
    subscription.unsubscribe();
  });
}
 // Método para editar cita
 editarCita(cita: Cita) {
  const dialogRef = this.dialog.open(CrearEditarCitaComponent, {
    width: '600px',
    data: cita,
    disableClose: true
  });

  const componentInstance = dialogRef.componentInstance;
  const subscription = componentInstance.onSubmit.subscribe((citaData: any) => {
    this.notificationService.showLoading('Actualizando cita...');
    this.citasService.actualizarCita(citaData).subscribe({
      next: (response) => {
        this.notificationService.closeLoading();
        if (response.succeded) {
          this.notificationService.success('¡Cita actualizada correctamente!');
          this.cargarCitas();
          this.cargarCitasMenuLateral();
          dialogRef.close(); // Solo cerramos si fue exitoso
        } else {
          this.notificationService.handleBackendError(response);
        }
      },
      error: (error) => {
        this.notificationService.closeLoading();
        if (error.error) {
          this.notificationService.handleBackendError(error.error);
        } else {
          this.notificationService.showErrorAlert('Error al conectar con el servidor');
        }
      }
    });
  });
  dialogRef.afterClosed().subscribe(() => {
    subscription.unsubscribe();
  });
}
  fechaActual = signal<Date>(new Date());
  citas = signal<Cita[]>([]);
  horasDelDia = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM a 7 PM
  diasDeLaSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  
  semanaActual = computed(() => {
    const fecha = this.fechaActual();
    const primerDia = new Date(fecha);
    primerDia.setDate(fecha.getDate() - fecha.getDay());
    
    return Array.from({ length: 7 }, (_, i) => {
      const dia = new Date(primerDia);
      dia.setDate(primerDia.getDate() + i);
      return dia;
    });
  });
  onVistaChange(event: any) {
    this.vistaActual = event.value;
    this.vistaActualChange.emit(this.vistaActual);
    this.cargarCitasSegunVista();
  }
  cargarCitasSegunVista() {
    const fecha = this.fechaActual();
    
    switch(this.vistaActual) {
      case 'dia':
        // Para la vista de día, cargar las citas del día seleccionado
        this.citasService.obtenerCitas().subscribe({
          next: (response) => {
            if (response.succeded) {
              const citasDelDia = response.data.filter(cita => {
                const fechaCita = new Date(cita.horaInicio);
                return fechaCita.getDate() === fecha.getDate() &&
                       fechaCita.getMonth() === fecha.getMonth() &&
                       fechaCita.getFullYear() === fecha.getFullYear();
              });
              this.citas.set(citasDelDia);
            }
          }
        });
        break;
        
      case 'semana':
        // Para la vista de semana, cargar las citas de la semana seleccionada
        const inicioSemana = this.semanaActual()[0];
        const finSemana = this.semanaActual()[6];
        
        this.citasService.obtenerCitas().subscribe({
          next: (response) => {
            if (response.succeded) {
              const citasSemana = response.data.filter(cita => {
                const fechaCita = new Date(cita.horaInicio);
                return fechaCita >= inicioSemana && fechaCita <= finSemana;
              });
              this.citas.set(citasSemana);
            }
          }
        });
        break;
        
      case 'mes':
        // Para la vista de mes, cargar las citas del mes seleccionado
        this.citasService.obtenerCitasDelMes().subscribe({
          next: (response) => {
            if (response.succeded) {
              this.citas.set(response.data);
            }
          }
        });
        break;
    }
  }

  diasDelMes = computed(() => {
    const fecha = this.fechaActual();
    const primerDia = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
    const ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0);
    
    const diasTotales = [];
    
    // Añadir días del mes anterior para completar la primera semana
    const diasPrevios = primerDia.getDay();
    for (let i = diasPrevios - 1; i >= 0; i--) {
      const dia = new Date(primerDia);
      dia.setDate(dia.getDate() - i);
      diasTotales.push(dia);
    }
    
    // Añadir días del mes actual
    for (let i = 1; i <= ultimoDia.getDate(); i++) {
      diasTotales.push(new Date(fecha.getFullYear(), fecha.getMonth(), i));
    }
    
    // Añadir días del siguiente mes para completar la última semana
    const diasRestantes = 42 - diasTotales.length; // 6 semanas * 7 días
    for (let i = 1; i <= diasRestantes; i++) {
      const dia = new Date(ultimoDia);
      dia.setDate(dia.getDate() + i);
      diasTotales.push(dia);
    }
    
    return diasTotales;
  });

  citasDelDia = computed(() => {
    return this.citas().filter(cita => {
      const fechaCita = new Date(cita.horaInicio);
      const fechaActual = this.fechaActual();
      return fechaCita.getDate() === fechaActual.getDate() &&
             fechaCita.getMonth() === fechaActual.getMonth() &&
             fechaCita.getFullYear() === fechaActual.getFullYear();
    });
  });
  irAHoy() {
    this.fechaActual.set(new Date());
  }
  citasDeLaSemana = computed(() => {
    const primerDia = this.semanaActual()[0];
    const ultimoDia = this.semanaActual()[6];
    
    return this.citas().filter(cita => {
      const fechaCita = new Date(cita.horaInicio);
      return fechaCita >= primerDia && fechaCita <= ultimoDia;
    });
  });

  citasDelMes = computed(() => {
    return this.citas().filter(cita => {
      const fechaCita = new Date(cita.horaInicio);
      const fechaActual = this.fechaActual();
      return fechaCita.getMonth() === fechaActual.getMonth() &&
             fechaCita.getFullYear() === fechaActual.getFullYear();
    });
  });

  constructor(private dialog: MatDialog) {
    // Efecto para cargar las citas según la vista
    effect(() => {
      const fecha = this.fechaActual();
      switch (this.vistaActual) {
        case 'dia':
          this.cargarCitasDelDia();
          break;
        case 'semana':
          this.cargarCitasDeLaSemana();
          break;
        case 'mes':
          this.cargarCitasDelMes();
          break;
      }
    });
    this.cargarCitasMenuLateral();
  }
  cargarCitasMenuLateral() {
    this.citasService.obtenerCitasDeHoy().subscribe({
      next: (response) => {
        if (response.succeded) {
          this.citasHoy = response.data;
        }
      }
    });

    this.citasService.obtenerCitasDeManana().subscribe({
      next: (response) => {
        if (response.succeded) {
          this.citasManana = response.data;
        }
      }
    });

    this.citasService.obtenerCitasDeLaSemana().subscribe({
      next: (response) => {
        if (response.succeded) {
          this.citasSemana = response.data;
        }
      }
    });
  }
  ngOnInit() {
    this.cargarCitas();
  }
   // Métodos para calcular posición y tamaño de las citas
   calcularPosicionTop(horaInicio: string | Date): number {
    const fecha = new Date(horaInicio);
    return (fecha.getMinutes() / 60) * 100;
  }

  calcularAltura(horaInicio: string | Date, horaFin: string | Date): number {
    const inicio = new Date(horaInicio).getTime();
    const fin = new Date(horaFin).getTime();
    return ((fin - inicio) / (1000 * 60 * 60)) * 100;
  }

  cargarCitas() {
    this.citasService.obtenerCitas().subscribe({
      next: (response) => {
        if (response.succeded) {
          this.citas.set(response.data);
        }
      }
    });
  }

  cargarCitasDelDia() {
    this.citasService.obtenerCitasDeHoy().subscribe({
      next: (response) => {
        if (response.succeded) {
          this.citas.set(response.data);
        }
      }
    });
  }

  cargarCitasDeLaSemana() {
    this.citasService.obtenerCitasDeLaSemana().subscribe({
      next: (response) => {
        if (response.succeded) {
          this.citas.set(response.data);
        }
      }
    });
  }
  
  cargarCitasDelMes() {
    this.citasService.obtenerCitasDelMes().subscribe({
      next: (response) => {
        if (response.succeded) {
          this.citas.set(response.data);
        }
      }
    });
  }

  cambiarMes(incremento: number) {
    const nuevaFecha = new Date(this.fechaActual());
    nuevaFecha.setMonth(nuevaFecha.getMonth() + incremento);
    this.fechaActual.set(nuevaFecha);
  }

  cambiarSemana(incremento: number) {
    const nuevaFecha = new Date(this.fechaActual());
    nuevaFecha.setDate(nuevaFecha.getDate() + (incremento * 7));
    this.fechaActual.set(nuevaFecha);
  }

  cambiarDia(incremento: number) {
    const nuevaFecha = new Date(this.fechaActual());
    nuevaFecha.setDate(nuevaFecha.getDate() + incremento);
    this.fechaActual.set(nuevaFecha);
  }

  // Actualizar método para obtener citas por hora
  obtenerCitasParaHora(hora: number, fecha: Date): Cita[] {
    return this.citas().filter(cita => {
      const fechaCita = new Date(cita.horaInicio);
      const horaCita = fechaCita.getHours();
      
      return horaCita === hora &&
             fechaCita.getDate() === fecha.getDate() &&
             fechaCita.getMonth() === fecha.getMonth() &&
             fechaCita.getFullYear() === fecha.getFullYear();
    });
  }

  formatearHora(hora: number): string {
    return `${hora.toString().padStart(2, '0')}:00`;
  }

  esFechaActual(fecha: Date): boolean {
    const hoy = new Date();
    return fecha.getDate() === hoy.getDate() &&
           fecha.getMonth() === hoy.getMonth() &&
           fecha.getFullYear() === hoy.getFullYear();
  }
  navegarADia(fecha: Date) {
    this.fechaActual.set(fecha);
    this.vistaActual = 'dia';
    this.vistaActualChange.emit(this.vistaActual);
    this.cargarCitasSegunVista();
  }
  obtenerCitasDelDia(fecha: Date): Cita[] {
    return this.citas().filter(cita => {
      const fechaCita = new Date(cita.horaInicio);
      return fechaCita.getDate() === fecha.getDate() &&
             fechaCita.getMonth() === fecha.getMonth() &&
             fechaCita.getFullYear() === fecha.getFullYear();
    });
  }
  verDetallesCita(cita: Cita) {
    this.citasService.obtenerCitaPorId(cita.id).subscribe({
      next: (response) => {
        if (response.succeded) {
          const dialogRef = this.dialog.open(DetallesCitaComponent, {
            width: '600px',
            data: response.data,
            panelClass: 'rounded-lg'
          });
  
          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              if (result.action === 'editar') {
                this.editarCita(result.cita);
              } else if (result.action === 'eliminar') {
                this.eliminarCita(result.cita.id);
              }
            }
          });
        }
      },
      error: () => {
        this.notificationService.error('Error al cargar los detalles de la cita');
      }
    });
  }
  private async eliminarCita(id: number) {
    const confirmar = await this.notificationService.confirm(
      '¿Estás seguro?',
      'Esta acción no se puede deshacer'
    );
  
    if (confirmar) {
      this.notificationService.showLoading('Eliminando cita...');
      this.citasService.eliminarCita(id).subscribe({
        next: (response) => {
          this.notificationService.closeLoading();
          if (response.succeded) {
            this.notificationService.success('¡Cita eliminada correctamente!');
            this.cargarCitas();
            this.cargarCitasMenuLateral();
          } else {
            this.notificationService.error(response.message || 'No se pudo eliminar la cita');
          }
        },
        error: () => {
          this.notificationService.closeLoading();
          this.notificationService.error('Error al eliminar la cita');
        }
      });
    }
  }
  formatearFechaCabecera(): string {
    const fecha = this.fechaActual();
    switch (this.vistaActual) {
      case 'dia':
        return `${fecha.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`;
      case 'semana':
        const inicioSemana = this.semanaActual()[0];
        const finSemana = this.semanaActual()[6];
        return `Semana del ${inicioSemana.toLocaleDateString('es', { day: 'numeric' })} al ${finSemana.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}`;
      case 'mes':
        return fecha.toLocaleDateString('es', { month: 'long', year: 'numeric' }).replace(/^\w/, (c) => c.toUpperCase());
      default:
        return '';
    }
  }

}