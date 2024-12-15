import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DiagnosticoListado } from '../../../models/diagnosticos/diagnostico';
import { DiagnosticosService } from '../../../shared/services/diagnosticos.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { DetalleDiagnosticoPersonalidadComponent } from '../detalle-diagnostico-personalidad/detalle-diagnostico-personalidad.component';


@Component({
  selector: 'app-diagnostico-personalidad',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    ReactiveFormsModule
  ],
  templateUrl: './diagnostico-personalidad.component.html',
  styles: [`
    .filtros-container {
      @apply bg-white p-4 rounded-lg shadow mb-4;
    }
    .table-container {
      @apply bg-white rounded-lg shadow;
    }
  `]
})
export class DiagnosticoPersonalidadComponent implements OnInit {
  readonly TEST_ID = 1; // ID para Test de Personalidad
  diagnosticos: DiagnosticoListado[] = [];
  filtrosForm: FormGroup;

  private diagnosticosService = inject(DiagnosticosService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);

  constructor() {
    this.filtrosForm = this.fb.group({
      busqueda: [''],
      fechaInicio: [null],
      fechaFin: [null]
    });
  }

  ngOnInit() {
    this.cargarDiagnosticos();
    this.setupFiltros();
  }

  private setupFiltros() {
    this.filtrosForm.valueChanges.subscribe(() => {
      this.cargarDiagnosticos();
    });
  }

  cargarDiagnosticos() {
    const filtros = this.filtrosForm.value;
    this.diagnosticosService.obtenerDiagnosticos(this.TEST_ID, filtros).subscribe({
      next: (diagnosticos) => {
        this.diagnosticos = diagnosticos;
      },
      error: () => {
        this.notificationService.error('Error al cargar los diagnósticos');
      }
    });
  }

  verDetalle(idDiagnostico: number) {
    this.diagnosticosService.obtenerDetalleDiagnosticoPersonalidad(idDiagnostico).subscribe({
      next: (detalle) => {
        this.dialog.open(DetalleDiagnosticoPersonalidadComponent, {
          width: '800px',
          data: detalle
        });
      },
      error: () => {
        this.notificationService.error('Error al cargar el detalle del diagnóstico');
      }
    });
  }

  generarReporte() {
    const filtros = this.filtrosForm.value;
    this.notificationService.showLoading('Generando reporte...');
    
    this.diagnosticosService.generarReportePDF(
      this.diagnosticos,
      filtros,
      'Test de Personalidad'
    ).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_diagnosticos_personalidad_${new Date().getTime()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.notificationService.success('Reporte generado correctamente');
      },
      error: () => {
        this.notificationService.error('Error al generar el reporte');
      },
      complete: () => {
        this.notificationService.closeLoading();
      }
    });
  }

  limpiarFiltros() {
    this.filtrosForm.reset();
  }
}