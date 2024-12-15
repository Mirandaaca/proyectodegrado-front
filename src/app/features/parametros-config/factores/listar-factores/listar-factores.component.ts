// listar-factores.component.ts
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Factor } from '../../../../models/factores/Factor';
import { FactoresService } from '../../../../shared/services/factores.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { PdfFactoresService } from '../../../../shared/services/pdf-factores.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs';
import { CrearEditarFactorComponent } from '../crear-editar-factor/crear-editar-factor.component';


@Component({
  selector: 'app-listar-factores',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDialogModule
  ],
  styleUrl: './listar-factores.component.css',
  templateUrl: './listar-factores.component.html',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
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
export class ListarFactoresComponent implements OnInit {
  private factoresService = inject(FactoresService);
  private notificationService = inject(NotificationService);
  private pdfService = inject(PdfFactoresService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog); // Añade esta línea

  dataSource = new MatTableDataSource<Factor>([]);
  columnasAMostrar = ['id', 'nombre', 'descripcion', 'acciones'];
  totalRegistros = 0;
  registrosPorPagina = 10;
  searchControl = this.fb.control('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.cargarFactores();
    this.setupSearch();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private setupSearch() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(value => {
        this.dataSource.filter = (value || '').trim().toLowerCase();
      });
  }

  cargarFactores() {
    this.factoresService.obtenerFactores(1, this.registrosPorPagina)
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.factores;
          this.totalRegistros = response.totalRecords;
        },
        error: () => {
          this.notificationService.error('Error al cargar los factores');
        }
      });
  }

  async eliminarFactor(id: number) {
    const confirmacion = await this.notificationService.confirm(
      '¿Estás seguro?',
      'Esta acción no se puede deshacer'
    );

    if (confirmacion) {
      this.factoresService.eliminar(id).subscribe({
        next: (response) => {
          if (response.succeded) {
            this.notificationService.success('Factor eliminado correctamente');
            this.cargarFactores();
          } else {
            this.notificationService.error(response.message || 'Error al eliminar el factor');
          }
        },
        error: () => {
          this.notificationService.error('Error al eliminar el factor');
        }
      });
    }
  }

  async generarReporte() {
    this.notificationService.showLoading('Generando reporte...');
    try {
      await this.pdfService.generarReporteFactores(this.dataSource.data);
      this.notificationService.success('Reporte generado correctamente');
    } catch (error) {
      this.notificationService.error('Error al generar el reporte');
    } finally {
      this.notificationService.closeLoading();
    }
  }
  crearFactor() {
    const dialogRef = this.dialog.open(CrearEditarFactorComponent, {
      width: '500px',
      disableClose: true
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.factoresService.crear(result).subscribe({
          next: (response) => {
            if (response.succeded) {
              this.notificationService.success('Factor creado correctamente');
              this.cargarFactores();
            } else {
              this.notificationService.error(response.message || 'Error al crear el factor');
            }
          },
          error: () => {
            this.notificationService.error('Error al crear el factor');
          }
        });
      }
    });
  }
  
  editarFactor(factor: Factor) {
    const dialogRef = this.dialog.open(CrearEditarFactorComponent, {
      width: '500px',
      data: factor,
      disableClose: true
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.factoresService.actualizar(result).subscribe({
          next: (response) => {
            if (response.succeded) {
              this.notificationService.success('Factor actualizado correctamente');
              this.cargarFactores();
            } else {
              this.notificationService.error(response.message || 'Error al actualizar el factor');
            }
          },
          error: () => {
            this.notificationService.error('Error al actualizar el factor');
          }
        });
      }
    });
  }
}