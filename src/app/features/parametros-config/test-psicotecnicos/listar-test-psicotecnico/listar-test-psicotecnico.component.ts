// listar-test-psicotecnico.component.ts
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
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TestPsicotecnicoService } from '../../../../shared/services/test-psicotecnico.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { PdfTestPsicotecnicoService } from '../../../../shared/services/pdf-test-psicotecnico.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { debounceTime } from 'rxjs';
import { TestPsicotecnico } from '../../../../models/test-psicotecnicos/TestPsicotecnico';
import { CrearEditarTestPsicotecnicoComponent } from '../crear-editar-test-psicotecnico/crear-editar-test-psicotecnico.component';

@Component({
  selector: 'app-listar-test-psicotecnico',
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
    MatDialogModule,
    ReactiveFormsModule
  ],
  styleUrl: './listar-test-psicotecnico.component.css',
  templateUrl: './listar-test-psicotecnico.component.html',
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
export class ListarTestPsicotecnicoComponent implements OnInit {
  private testService = inject(TestPsicotecnicoService);
  private notificationService = inject(NotificationService);
  private pdfService = inject(PdfTestPsicotecnicoService);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);

  dataSource = new MatTableDataSource<TestPsicotecnico>([]);
  columnasAMostrar = ['id', 'nombre', 'descripcion', 'duracion', 'acciones'];
  totalRegistros = 0;
  registrosPorPagina = 10;
  searchControl = this.fb.control('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit() {
    this.setupBuscador();
    this.cargarTests();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private setupBuscador() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.dataSource.filter = this.searchControl.value?.toLowerCase() ?? '';
      });
  }

  cargarTests() {
    this.testService.obtenerTests(1, this.registrosPorPagina)
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.tests;
          this.totalRegistros = response.totalRecords;
        },
        error: () => {
          this.notificationService.error('Error al cargar los tests psicotécnicos');
        }
      });
  }

  crearTest() {
    const dialogRef = this.dialog.open(CrearEditarTestPsicotecnicoComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.testService.crear(result).subscribe({
          next: (response) => {
            if (response.succeded) {
              this.notificationService.success('Test psicotécnico creado correctamente');
              this.cargarTests();
            } else {
              this.notificationService.error(response.message || 'Error al crear el test');
            }
          },
          error: () => {
            this.notificationService.error('Error al crear el test psicotécnico');
          }
        });
      }
    });
  }

  editarTest(test: TestPsicotecnico) {
    const dialogRef = this.dialog.open(CrearEditarTestPsicotecnicoComponent, {
      width: '500px',
      data: test,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.testService.actualizar(result).subscribe({
          next: (response) => {
            if (response.succeded) {
              this.notificationService.success('Test psicotécnico actualizado correctamente');
              this.cargarTests();
            } else {
              this.notificationService.error(response.message || 'Error al actualizar el test');
            }
          },
          error: () => {
            this.notificationService.error('Error al actualizar el test psicotécnico');
          }
        });
      }
    });
  }

  async eliminarTest(id: number) {
    const confirmacion = await this.notificationService.confirm(
      '¿Estás seguro?',
      'Esta acción no se puede deshacer'
    );

    if (confirmacion) {
      this.testService.eliminar(id).subscribe({
        next: (response) => {
          if (response.succeded) {
            this.notificationService.success('Test psicotécnico eliminado correctamente');
            this.cargarTests();
          } else {
            this.notificationService.error(response.message || 'Error al eliminar el test');
          }
        },
        error: () => {
          this.notificationService.error('Error al eliminar el test psicotécnico');
        }
      });
    }
  }

  async generarReporte() {
    this.notificationService.showLoading('Generando reporte...');
    try {
      await this.pdfService.generarReporteTests(this.dataSource.data);
      this.notificationService.success('Reporte generado correctamente');
    } catch (error) {
      this.notificationService.error('Error al generar el reporte');
    } finally {
      this.notificationService.closeLoading();
    }
  }
}