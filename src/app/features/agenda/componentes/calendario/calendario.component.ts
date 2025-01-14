import { Component, Input, OnInit, effect, computed, signal, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { animate, style, transition, trigger } from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CitasService } from '../../../../shared/services/citas.service';
import { Cita } from '../../../../models/citas/Cita';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { DetallesCitaComponent } from '../detalles-cita/detalles-cita/detalles-cita.component';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CrearEditarCitaComponent } from '../crear-editar-cita/crear-editar-cita.component';
import localeEs from '@angular/common/locales/es';
import { MenuLateralComponent } from "../menu-lateral/menu-lateral/menu-lateral.component";
import { NotificationService } from '../../../../shared/services/notification.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PdfCalendarioService } from '../../../../shared/services/pdf-calendario.service';
registerLocaleData(localeEs);

@Component({
  selector: 'app-calendario',
  standalone: true,
  imports: [CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
    DragDropModule,
    RouterModule
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
  private pdfService = inject(PdfCalendarioService)
  private fb = inject(FormBuilder);
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
    this.setupFiltros();
    
  }
  filtrosForm = this.fb.group({
    busqueda: [''],
    modalidad: [''],
    estado: [''],
    fechaInicio: [null],
    fechaFin: [null]
  });
  tipoVista: 'calendario' | 'lista' = 'calendario';
  dataSource = new MatTableDataSource<Cita>([]);
  totalRegistros = 0;
  paginaActual = 1;
  registrosPorPagina = 10;
  
  columnasMostradas = [
    'fecha',
    'asunto',
    'postulante',
    'modalidad',
    'estado',
    'acciones'
  ];
  private citasService = inject(CitasService);
  
  private notificationService = inject(NotificationService);
  @Input() vistaActual: 'dia' | 'semana' | 'mes' = 'mes';
  
  @Output() vistaActualChange = new EventEmitter<'dia' | 'semana' | 'mes'>();
  
  @Output() nuevaCita = new EventEmitter<void>();

  citasHoy: Cita[] = [];
  
  citasManana: Cita[] = [];

  citasSemana: Cita[] = [];
  onPageChange(event: PageEvent) {
    this.paginaActual = event.pageIndex + 1;
    this.registrosPorPagina = event.pageSize;
    this.cargarCitasPaginadas();
  }
  
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
  cambiarTipoVista(vista: 'calendario' | 'lista') {
    this.tipoVista = vista;
    if (vista === 'lista') {
      this.cargarCitasPaginadas();
    } else {
      this.cargarCitasSegunVista();
    }
  }
  cargarTodasLasCitas() {
    this.citasService.obtenerCitas().subscribe({
      next: (response) => {
        if (response.succeded) {
          this.citas.set(response.data);
        }
      }
    });
  }
  async generarReporte() {
    this.notificationService.showLoading('Generando reporte...');
    try {
      let citas: Cita[] = [];
      
      // Si hay filtros aplicados, usar los datos filtrados
      if (this.dataSource.filteredData.length > 0) {
        citas = this.dataSource.filteredData;
      } else {
        // Si no hay filtros, obtener todas las citas
        const response = await this.citasService.obtenerCitas().toPromise();
        if (response?.succeded) {
          citas = response.data;
        }
      }

      await this.pdfService.generarReporteCitas(citas, this.filtrosForm.value);
      this.notificationService.success('Reporte generado correctamente');
    } catch (error) {
      this.notificationService.error('Error al generar el reporte');
    } finally {
      this.notificationService.closeLoading();
    }
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
          this.cargarCitasPaginadas();
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
    setTimeout(() => {  // Agregamos un timeout para asegurar la animación
      this.citasService.actualizarCita(citaData).subscribe({
        next: () => { // Cambiamos response por () ya que es NoContent
          this.notificationService.closeLoading();
          this.notificationService.success('¡Cita actualizada correctamente!');
          this.cargarCitas();
          this.cargarCitasMenuLateral();
          dialogRef.close();
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
    }, 200);
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
    if (this.tipoVista === 'calendario') {
      this.vistaActual = event.value;
      this.vistaActualChange.emit(this.vistaActual);
      this.cargarCitasSegunVista();
    }
  }
  cargarCitasSegunVista() {
    switch(this.vistaActual) {
      case 'dia':
        this.citasService.obtenerCitasDeHoy().subscribe({
          next: (response) => {
            if (response.succeded) {
              this.citas.set(response.data);
            }
          }
        });
        break;
        
      case 'semana':
        const inicioSemana = this.semanaActual()[0];
        const finSemana = this.semanaActual()[6];
        
        this.citasService.obtenerCitasDeLaSemana().subscribe({
          next: (response) => {
            if (response.succeded) {
              this.citas.set(response.data);
            }
          }
        });
        break;
        
      case 'mes':
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
  onDrop(event: CdkDragDrop<Cita[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      const cita = event.previousContainer.data[event.previousIndex];
      // Calcular nueva hora basada en donde se soltó
      const nuevaHora = this.calcularNuevaHora(event);
      
      const citaActualizada = {
        ...cita,
        horaInicio: nuevaHora
      };
  
      this.citasService.actualizarCita(citaActualizada).subscribe({
        next: () => {
          this.notificationService.success('Cita replanificada correctamente');
          this.cargarCitas();
          this.cargarCitasMenuLateral();
        },
        error: () => {
          this.notificationService.error('Error al replanificar la cita');
        }
      });
    }
  }
  
  calcularNuevaHora(event: CdkDragDrop<any[]>): Date {
    // Implementar lógica para calcular nueva hora basada en posición
    // Este es un ejemplo básico
    const elementoDestino = event.container.element.nativeElement;
    const rect = elementoDestino.getBoundingClientRect();
    const offsetY = event.dropPoint.y - rect.top;
    const hora = Math.floor(offsetY / 60); // Asumiendo que cada hora ocupa 60px
    
    const nuevaHora = new Date();
    nuevaHora.setHours(8 + hora); // 8 es la hora de inicio
    nuevaHora.setMinutes(0);
    
    return nuevaHora;
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

  
  private setupFiltros() {
    this.filtrosForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.paginaActual = 1;
      this.cargarCitasFiltradas();
    });
  }
  limpiarFiltros() {
    this.filtrosForm.reset({
      busqueda: '',
      modalidad: '',
      estado: '',
      fechaInicio: null,
      fechaFin: null
    });
    this.cargarCitasPaginadas();
  }
  cargarCitasFiltradas() {
    const filtros = this.filtrosForm.value;
    
    if (filtros.fechaInicio && filtros.fechaFin) {
      this.citasService.obtenerCitasEnRango(filtros.fechaInicio, filtros.fechaFin)
        .subscribe(response => {
          if (response.succeded) {
            this.dataSource.data = response.data;
            this.totalRegistros = response.data.length;
            this.aplicarFiltrosAdicionales();
          }
        });
    } else {
      this.cargarCitasPaginadas();
    }
  }
  cargarCitasPaginadas() {
    this.citasService.obtenerCitasPaginadas(this.paginaActual, this.registrosPorPagina)
      .subscribe(response => {
        this.dataSource.data = response.citas;
        this.totalRegistros = response.totalRecords;
        this.aplicarFiltrosAdicionales();
      });
  }
  private aplicarFiltrosAdicionales() {
    const filtros = this.filtrosForm.value;
    
    this.dataSource.filterPredicate = (cita: Cita, _: string) => {
      // Filtro por búsqueda
      const searchTerm = filtros.busqueda?.toLowerCase() || '';
      const matchBusqueda = !searchTerm || 
        cita.nombrePostulante?.toLowerCase().includes(searchTerm) ||
        cita.asunto.toLowerCase().includes(searchTerm);
  
      // Filtro por modalidad
      const matchModalidad = !filtros.modalidad || cita.modalidad === filtros.modalidad;
  
      // Filtro por estado
      const matchEstado = !filtros.estado || cita.estado === filtros.estado;
  
      return matchBusqueda && matchModalidad && matchEstado;
    };
  
    // Trigger del filtro
    this.dataSource.filter = 'trigger';
  }
  cargarCitasMenuLateral()  {
    this.citasService.obtenerCitasDeHoy().subscribe({
      next: (response) => {
        if (response && response.data) {
          this.citasHoy = response.data;
        }
      }
    });

    this.citasService.obtenerCitasDeManana().subscribe({
      next: (response) => {
        if (response && response.data) {
          this.citasManana = response.data;
        }
      }
    });

    this.citasService.obtenerCitasDeLaSemana().subscribe({
      next: (response) => {
        if (response && response.data) {
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
    const minutos = fecha.getMinutes();
    const porcentaje = (minutos / 60) * 100;
    return porcentaje;
  }

  calcularAltura(horaInicio: string | Date, horaFin: string | Date): number {
    const inicio = new Date(horaInicio);
    const fin = new Date(horaFin);
    const duracionMinutos = (fin.getTime() - inicio.getTime()) / (1000 * 60);
    const porcentaje = (duracionMinutos / 60) * 100;
    return porcentaje;
  }

  cargarCitas() {
    this.citasService.obtenerCitas().subscribe({
      next: (response) => {
        if (response && response.data) {
          this.citas.set(response.data);
        }
      }
    });
  }

  cargarCitasDelDia() {
    const fecha = this.fechaActual();
    this.citasService.obtenerCitas().subscribe({
      next: (response) => {
        if (response.succeded) {
          // Filtrar las citas para el día específico
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
    this.cargarCitasDeLaSemana();
  }

  cambiarDia(incremento: number) {
    const nuevaFecha = new Date(this.fechaActual());
    nuevaFecha.setDate(nuevaFecha.getDate() + incremento);
    this.fechaActual.set(nuevaFecha);
    this.cargarCitasDelDia();
  }

  // Actualizar método para obtener citas por hora
  obtenerCitasParaHora(hora: number, fecha: Date): Cita[] {
    return this.citas().filter(cita => {
      const fechaCita = new Date(cita.horaInicio);
      const horaCita = fechaCita.getHours();
      
      // Comparar fecha completa
      const mismoAnio = fechaCita.getFullYear() === fecha.getFullYear();
      const mismoMes = fechaCita.getMonth() === fecha.getMonth();
      const mismoDia = fechaCita.getDate() === fecha.getDate();
      
      return horaCita === hora && mismoAnio && mismoMes && mismoDia;
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

  public async eliminarCita(id: number) {
    const confirmar = await this.notificationService.confirm(
      '¿Estás seguro?',
      'Esta acción no se puede deshacer'
    );
  
    if (confirmar) {
      this.notificationService.showLoading('Eliminando cita...');
      setTimeout(() => { // Agregamos timeout para la animación
        this.citasService.eliminarCita(id).subscribe({
          next: () => { // Removemos la verificación de response.succeded
            this.notificationService.closeLoading();
            this.notificationService.success('¡Cita eliminada correctamente!');
            this.cargarCitas();
            this.cargarCitasMenuLateral();
            this.cargarCitasPaginadas();
          },
          error: () => {
            this.notificationService.closeLoading();
            this.notificationService.error('Error al eliminar la cita');
          }
        });
      }, 200);
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

  manejarNavegacion(incremento: number) {
    switch (this.vistaActual) {
      case 'dia':
        this.cambiarDia(incremento);
        break;
      case 'semana':
        this.cambiarSemana(incremento);
        break;
      case 'mes':
        this.cambiarMes(incremento);
        break;
    }
  }

}