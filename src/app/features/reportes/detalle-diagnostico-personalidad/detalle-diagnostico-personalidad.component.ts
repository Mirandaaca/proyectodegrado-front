import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { DiagnosticoPersonalidad } from '../../../models/diagnosticos/diagnostico';
import { PdfDiagnosticosService } from '../../../shared/services/pdf-diagnosticos.service';

@Component({
  selector: 'app-detalle-diagnostico-personalidad',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule
  ],
  template: `
    <div class="p-6">
      <!-- Encabezado -->
      <div class="flex justify-between items-start mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Detalle del Diagnóstico</h2>
          <p class="text-gray-600">Test de Personalidad</p>
        </div>
        <button mat-icon-button (click)="cerrar()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <!-- Información del postulante -->
      <div class="bg-blue-50 p-4 rounded-lg mb-6">
        <h3 class="font-semibold text-lg mb-2">Información del Postulante</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600">Nombre:</p>
            <p class="font-medium">{{data.nombrePostulante}}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Edad:</p>
            <p class="font-medium">{{data.edad}} años</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Carrera/Ocupación:</p>
            <p class="font-medium">{{data.carrera}}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Fecha de evaluación:</p>
            <p class="font-medium">{{data.fechaCita | date:'dd/MM/yyyy HH:mm'}}</p>
          </div>
        </div>
      </div>

      <!-- Resultados por Factor -->
      <div class="space-y-4">
        <mat-accordion>
          <mat-expansion-panel *ngFor="let factor of data.respuestasPorFactor">
            <mat-expansion-panel-header>
              <mat-panel-title>
                {{factor.nombreFactor}}
              </mat-panel-title>
            </mat-expansion-panel-header>

            <div class="space-y-4 mt-4">
              <div *ngFor="let respuesta of factor.respuestas" 
                   class="p-4 bg-gray-50 rounded-lg">
                <p class="font-medium mb-2">{{respuesta.pregunta}}</p>
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="text-gray-600">Respuesta:</span>
                    <span class="ml-2">{{respuesta.respuesta}}</span>
                  </div>
                  <div>
                    <span class="text-gray-600">Puntaje:</span>
                    <span class="ml-2">{{respuesta.puntaje}}</span>
                  </div>
                  <div>
                    <span class="text-gray-600">Calificación Previa:</span>
                    <span class="ml-2">{{respuesta.calificacionPrevia}}</span>
                  </div>
                  <div>
                    <span class="text-gray-600">Calificación Final:</span>
                    <span class="ml-2 font-medium">{{respuesta.calificacionFinal}}</span>
                  </div>
                </div>
              </div>
            </div>
          </mat-expansion-panel>
        </mat-accordion>
      </div>

      <!-- Botón Cerrar -->
      <div class="flex justify-end mt-6">
        <button mat-button color="primary" (click)="cerrar()">
          Cerrar
        </button>
        <button 
  mat-raised-button 
  color="primary" 
  (click)="generarReporte()" 
  class="ml-2">
  <mat-icon>picture_as_pdf</mat-icon>
  Generar Reporte
</button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      max-height: 90vh;
      overflow-y: auto;
    }
  `]
})
export class DetalleDiagnosticoPersonalidadComponent {
  private pdfService = inject(PdfDiagnosticosService);
  constructor(
    public dialogRef: MatDialogRef<DetalleDiagnosticoPersonalidadComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DiagnosticoPersonalidad
  ) {}
  generarReporte() {
    this.pdfService.generarReporteDetalleDiagnosticoPersonalidad(this.data);
  }
  cerrar() {
    this.dialogRef.close();
  }
}