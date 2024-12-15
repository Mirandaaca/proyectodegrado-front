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
import { animate, style, transition, trigger } from '@angular/animations';
import { DiagnosticoListado } from '../../../models/diagnosticos/diagnostico';
import { DiagnosticosService } from '../../../shared/services/diagnosticos.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { DetalleDiagnosticoRavenComponent } from '../detalle-diagnostico-raven/detalle-diagnostico-raven.component';

@Component({
  selector: 'app-diagnostico-raven',
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
  templateUrl: './diagnostico-raven.component.html',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class DiagnosticoRavenComponent implements OnInit {
  readonly TEST_ID = 3; // ID para Test de Raven
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
    this.diagnosticosService.obtenerDetalleDiagnosticoRaven(idDiagnostico).subscribe({
      next: (detalle) => {
        this.dialog.open(DetalleDiagnosticoRavenComponent, {
          width: '900px',
          data: detalle,
          panelClass: 'diagnostico-raven-dialog'
        });
      },
      error: () => {
        this.notificationService.error('Error al cargar el detalle del diagnóstico');
      }
    });
  }

  async generarReporte() {
    try {
      this.notificationService.showLoading('Generando reporte...');
      const filtros = this.filtrosForm.value;

      await this.diagnosticosService.generarReportePDF(
        this.diagnosticos,
        filtros,
        'Test de Raven'
      ).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `reporte_diagnosticos_raven_${new Date().getTime()}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          this.notificationService.success('Reporte generado correctamente');
        },
        error: () => {
          this.notificationService.error('Error al generar el reporte');
        }
      });
    } finally {
      this.notificationService.closeLoading();
    }
  }

  limpiarFiltros() {
    this.filtrosForm.reset();
    this.cargarDiagnosticos();
  }
}