import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { animate, style, transition, trigger } from '@angular/animations';
import { Postulante } from '../../../../models/postulantes/Postulante';
import { PostulantesService } from '../../../../shared/services/postulantes.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NotificationService } from '../../../../shared/services/notification.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { PdfPostulantesService } from '../../../../shared/services/pdf-postulantes.service';
@Component({
  selector: 'app-listar-postulantes',
  imports: [ CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    RouterModule,
    ReactiveFormsModule],
  templateUrl: './listar-postulantes.component.html',
  styleUrl: './listar-postulantes.component.css',
  animations:[
    trigger('scaleIn', [
      transition(':enter', [
        style({ transform: 'scale(0.95)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ]),
    trigger('tableAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('rowAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(10px)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class ListarPostulantesComponent implements OnInit {
  dataSource = new MatTableDataSource<Postulante>([]);
  columnasAMostrar = ['nombre', 
    'email', 
    'telefono', 
    'direccion', 
    'gradoDeFormacion',
    'fechaDeNacimiento',
    'habilitado', 
    'acciones'];
  totalRegistros = 0;
  paginaActual = 1;
  registrosPorPagina = 10;
  private postulantesService = inject(PostulantesService);
  private pdfService = inject(PdfPostulantesService);
  private notificationService = inject(NotificationService);
  searchControl = new FormControl('');
  estadoControl = new FormControl<boolean | null>(null);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  ngOnInit(): void {
    this.cargarPostulantes();
    this.setupFiltros();
  }
  private setupFiltros() {
    // Busqueda
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(() => {
      this.paginaActual = 1;
      this.cargarPostulantes();
    });

    // Estado
    this.estadoControl.valueChanges.subscribe(() => {
      this.paginaActual = 1;
      this.cargarPostulantes();
    });
  }

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => {
      this.paginaActual = this.paginator.pageIndex + 1;
      this.registrosPorPagina = this.paginator.pageSize;
      this.cargarPostulantes();
    });
  }
  cargarPostulantes() {
    const filtros = {
      busqueda: this.searchControl.value,
      estado: this.estadoControl.value
    };

    this.postulantesService.obtenerPostulantes(this.paginaActual, this.registrosPorPagina, filtros)
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.postulantes;
          this.totalRegistros = response.totalRecords;
        },
        error: () => {
          this.notificationService.error('Error al cargar los postulantes');
        }
      });
  }
  async cambiarEstado(postulante: Postulante) {
    const confirmacion = await this.notificationService.confirm(
      '¿Cambiar estado del postulante?',
      `¿Estás seguro de que deseas ${postulante.habilitado ? 'desactivar' : 'activar'} este postulante?`
    );

    if (confirmacion) {
      this.postulantesService.cambiarEstado(postulante.id!).subscribe({
        next: () => {
          this.notificationService.success('Estado actualizado correctamente');
          this.cargarPostulantes();
        },
        error: () => {
          this.notificationService.error('Error al cambiar el estado del postulante');
        }
      });
    }
  }
  async generarReporte() {
    this.notificationService.showLoading('Generando reporte...');
    try {
      await this.pdfService.generarReportePostulantes(this.dataSource.data);
      this.notificationService.success('Reporte generado correctamente');
    } catch (error) {
      this.notificationService.error('Error al generar el reporte');
    } finally {
      this.notificationService.closeLoading();
    }
  }
  eliminarPostulante(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.postulantesService.eliminar(id).subscribe({
          next: () => {
            Swal.fire(
              '¡Eliminado!',
              'El postulante ha sido eliminado.',
              'success'
            );
            this.cargarPostulantes();
          },
          error: () => {
            Swal.fire(
              'Error',
              'No se pudo eliminar el postulante',
              'error'
            );
          }
        });
      }
    });
  }

}
