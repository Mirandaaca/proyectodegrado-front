import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { animate, style, transition, trigger } from '@angular/animations';
import { DiagnosticoRaven } from '../../../models/diagnosticos/diagnostico';
import { PdfDiagnosticosService } from '../../../shared/services/pdf-diagnosticos.service';

@Component({
  selector: 'app-detalle-diagnostico-raven',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatTooltipModule
  ],
  template: `
    <div class="p-6">
      <!-- Encabezado -->
      <div class="flex justify-between items-start mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Detalle del Diagnóstico</h2>
          <p class="text-gray-600">Test de Raven</p>
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

      <!-- Resultados generales -->
      <div class="grid grid-cols-4 gap-4 mb-6">
        <div class="bg-indigo-50 p-4 rounded-lg">
          <p class="text-sm text-gray-600">Puntaje Directo</p>
          <p class="text-2xl font-bold text-indigo-600">{{data.puntajeDirecto}}</p>
        </div>
        <div class="bg-green-50 p-4 rounded-lg">
          <p class="text-sm text-gray-600">Percentil</p>
          <p class="text-2xl font-bold text-green-600">{{data.percentil}}</p>
        </div>
        <div class="bg-blue-50 p-4 rounded-lg">
          <p class="text-sm text-gray-600">Rango</p>
          <p class="text-2xl font-bold text-blue-600">{{data.rango}}</p>
        </div>
        <div class="bg-purple-50 p-4 rounded-lg">
          <p class="text-sm text-gray-600">Diagnóstico</p>
          <p class="text-2xl font-bold text-purple-600">{{data.diagnostico}}</p>
        </div>
      </div>

      <!-- Respuestas -->
      <div class="space-y-6">
        <h3 class="font-semibold text-lg">Respuestas Seleccionadas</h3>
        
        <div class="grid grid-cols-1 gap-6">
          <div 
            *ngFor="let respuesta of data.respuestasSeleccionadas; let i = index" 
            class="bg-gray-50 p-4 rounded-lg">
            <div class="flex items-center justify-between mb-4">
              <h4 class="font-medium">Pregunta {{i + 1}}</h4>
              <div 
                [class.text-green-600]="respuesta.esCorrecta"
                [class.text-red-600]="!respuesta.esCorrecta"
                class="flex items-center gap-2">
                <mat-icon>{{respuesta.esCorrecta ? 'check_circle' : 'cancel'}}</mat-icon>
                {{respuesta.puntaje}} punto{{respuesta.puntaje !== 1 ? 's' : ''}}
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600 mb-2">Pregunta:</p>
                <img 
                  [src]="respuesta.preguntaImagen" 
                  alt="Pregunta"
                  class="w-full h-auto rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  (click)="expandirImagen(respuesta.preguntaImagen)">
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-2">Respuesta seleccionada:</p>
                <img 
                  [src]="respuesta.respuestaSeleccionadaImagen" 
                  alt="Respuesta"
                  class="w-full h-auto rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                  (click)="expandirImagen(respuesta.respuestaSeleccionadaImagen)">
              </div>
            </div>
          </div>
        </div>
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

    img {
      max-height: 200px;
      object-fit: contain;
    }

    .mat-expansion-panel {
      @apply shadow-none border rounded-lg mb-4;
    }
  `],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms ease-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class DetalleDiagnosticoRavenComponent {
  private pdfService = inject(PdfDiagnosticosService);
  constructor(
    public dialogRef: MatDialogRef<DetalleDiagnosticoRavenComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DiagnosticoRaven,
    private dialog: MatDialog
  ) {}
generarReporte() {
  this.pdfService.generarReporteDetalleDiagnosticoRaven(this.data);
}
  cerrar() {
    this.dialogRef.close();
  }

  expandirImagen(imageUrl: string) {
    this.dialog.open(ImagenExpandidaComponent, {
      data: imageUrl,
      maxWidth: '90vw',
      maxHeight: '90vh',
      panelClass: 'imagen-expandida-dialog'
    });
  }
}

// Componente para mostrar imagen expandida
@Component({
  selector: 'app-imagen-expandida',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
  template: `
    <div class="relative">
      <button 
        mat-icon-button 
        class="absolute top-2 right-2 bg-white shadow-md"
        (click)="dialogRef.close()">
        <mat-icon>close</mat-icon>
      </button>
      <img [src]="data" class="w-auto h-auto max-w-full max-h-[80vh]" alt="Imagen expandida">
    </div>
  `,
  styles: [`
    :host {
      display: block;
      padding: 16px;
    }
  `]
})
export class ImagenExpandidaComponent {
  constructor(
    public dialogRef: MatDialogRef<ImagenExpandidaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: string
  ) {}
}