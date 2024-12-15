import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { TestRavenService } from '../../../../shared/services/test-raven.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Pregunta, Respuesta } from '../../../../models/preguntas/Pregunta';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CrearEditarPreguntaRavenDialogComponent } from '../crear-editar-pregunta-raven-dialog/crear-editar-pregunta-raven-dialog.component';
import { CrearEditarRespuestaRavenDialogComponent } from '../crear-editar-respuesta-raven-dialog/crear-editar-respuesta-raven-dialog.component';
import { EnviarTestRavenDialogComponent } from '../enviar-test-raven-dialog/enviar-test-raven-dialog.component';

@Component({
  selector: 'app-test-raven',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatMenuModule,
    DragDropModule,
    FormsModule
  ],
  templateUrl: './test-raven.component.html',
  styles: [`
    .pregunta-container {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .pregunta-container.cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .respuesta-container {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .respuesta-container.cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .cdk-drag-preview {
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
    }
    .cdk-drag-placeholder {
      opacity: 0;
    }
    .raven-question-image {
    @apply max-w-xl mx-auto rounded-lg shadow-md;
    max-height: 500px; /* altura máxima fija */
    width: auto;
    object-fit: contain;
  }

  .raven-answer-image {
    @apply w-full rounded-lg shadow-sm hover:shadow-md transition-shadow;
    max-height: 150px; /* altura máxima para respuestas */
    object-fit: contain;
  }
  `]
})
export class TestRavenComponent implements OnInit {
  preguntas: Pregunta[] = [];
  private testService = inject(TestRavenService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private router = inject(Router);

  ngOnInit() {
    this.cargarPreguntas();
  }

  cargarPreguntas() {
    this.testService.obtenerPreguntas().subscribe({
      next: (preguntas) => {
        this.preguntas = preguntas;
      },
      error: () => {
        this.notificationService.error('Error al cargar las preguntas');
      }
    });
  }

  async dropPregunta(event: CdkDragDrop<Pregunta[]>) {
    if (event.previousIndex === event.currentIndex) return;

    const preguntasAActualizar = [];
    const start = Math.min(event.previousIndex, event.currentIndex);
    const end = Math.max(event.previousIndex, event.currentIndex);

    for (let i = start; i <= end; i++) {
      const pregunta = this.preguntas[i];
      preguntasAActualizar.push({
        id: pregunta.id!,
        orden: i + 1
      });
    }

    try {
      this.notificationService.showLoading('Actualizando orden...');
      await this.testService.actualizarOrdenPreguntas(preguntasAActualizar).toPromise();
      
      moveItemInArray(this.preguntas, event.previousIndex, event.currentIndex);
      
      this.preguntas = this.preguntas.map((pregunta, index) => ({
        ...pregunta,
        orden: index + 1
      }));

      this.notificationService.success('Orden actualizado correctamente');
    } catch {
      this.notificationService.error('Error al actualizar el orden');
      this.cargarPreguntas();
    } finally {
      this.notificationService.closeLoading();
    }
  }

  async dropRespuesta(event: CdkDragDrop<Respuesta[]>, pregunta: Pregunta) {
    if (event.previousIndex === event.currentIndex) return;

    const respuestasAActualizar = [];
    const start = Math.min(event.previousIndex, event.currentIndex);
    const end = Math.max(event.previousIndex, event.currentIndex);

    for (let i = start; i <= end; i++) {
      const respuesta = pregunta.respuestas[i];
      respuestasAActualizar.push({
        id: respuesta.id!,
        orden: i + 1
      });
    }

    try {
      this.notificationService.showLoading('Actualizando orden...');
      await this.testService.actualizarOrdenRespuestas(respuestasAActualizar).toPromise();
      
      moveItemInArray(pregunta.respuestas, event.previousIndex, event.currentIndex);
      
      pregunta.respuestas = pregunta.respuestas.map((respuesta, index) => ({
        ...respuesta,
        orden: index + 1
      }));

      this.notificationService.success('Orden actualizado correctamente');
    } catch {
      this.notificationService.error('Error al actualizar el orden');
      this.cargarPreguntas();
    } finally {
      this.notificationService.closeLoading();
    }
  }

  // TO-DO: Implementar métodos para agregar, editar y eliminar preguntas y respuestas
  agregarPregunta() {
    const dialogRef = this.dialog.open(CrearEditarPreguntaRavenDialogComponent, {
      width: '600px',
      disableClose: true
    });
  
    dialogRef.afterClosed().subscribe(formData => {
      if (formData) {
        this.testService.crearPregunta(formData).subscribe({
          next: () => {
            this.notificationService.success('Pregunta creada correctamente');
            this.cargarPreguntas();
          },
          error: () => {
            this.notificationService.error('Error al crear la pregunta');
          }
        });
      }
    });
  }

  editarPregunta(pregunta: Pregunta) {
    const dialogRef = this.dialog.open(CrearEditarPreguntaRavenDialogComponent, {
      width: '600px',
      data: pregunta,
      disableClose: true
    });
  
    dialogRef.afterClosed().subscribe(formData => {
      if (formData) {
        this.testService.actualizarPregunta(formData).subscribe({
          next: () => {
            this.notificationService.success('Pregunta actualizada correctamente');
            this.cargarPreguntas();
          },
          error: () => {
            this.notificationService.error('Error al actualizar la pregunta');
          }
        });
      }
    });
  }
  

  agregarRespuesta(pregunta: Pregunta) {
    const dialogRef = this.dialog.open(CrearEditarRespuestaRavenDialogComponent, {
      width: '600px',
      data: { idPregunta: pregunta.id },
      disableClose: true
    });
  
    dialogRef.afterClosed().subscribe(formData => {
      if (formData) {
        this.testService.crearRespuesta(formData).subscribe({
          next: () => {
            this.notificationService.success('Respuesta creada correctamente');
            this.cargarPreguntas();
          },
          error: () => {
            this.notificationService.error('Error al crear la respuesta');
          }
        });
      }
    });
  }

  editarRespuesta(pregunta: Pregunta, respuesta: Respuesta) {
    const dialogRef = this.dialog.open(CrearEditarRespuestaRavenDialogComponent, {
      width: '600px',
      data: { 
        respuesta,
        idPregunta: pregunta.id 
      },
      disableClose: true
    });
  
    dialogRef.afterClosed().subscribe(formData => {
      if (formData) {
        this.testService.actualizarRespuesta(formData).subscribe({
          next: () => {
            this.notificationService.success('Respuesta actualizada correctamente');
            this.cargarPreguntas();
          },
          error: () => {
            this.notificationService.error('Error al actualizar la respuesta');
          }
        });
      }
    });
  }

  async eliminarPregunta(pregunta: Pregunta) {
    const confirmar = await this.notificationService.confirm(
      '¿Eliminar pregunta?',
      'Esta acción no se puede deshacer'
    );

    if (confirmar) {
      this.testService.eliminarPregunta(pregunta.id!).subscribe({
        next: () => {
          this.notificationService.success('Pregunta eliminada correctamente');
          this.cargarPreguntas();
        },
        error: () => {
          this.notificationService.error('Error al eliminar la pregunta');
        }
      });
    }
  }

  async eliminarRespuesta(pregunta: Pregunta, respuesta: Respuesta) {
    const confirmar = await this.notificationService.confirm(
      '¿Eliminar respuesta?',
      'Esta acción no se puede deshacer'
    );

    if (confirmar) {
      this.testService.eliminarRespuesta(respuesta.id!).subscribe({
        next: () => {
          this.notificationService.success('Respuesta eliminada correctamente');
          this.cargarPreguntas();
        },
        error: () => {
          this.notificationService.error('Error al eliminar la respuesta');
        }
      });
    }
  }

  abrirVistaPrevia() {
    this.router.navigate(['/app/tests/raven/vista-previa']);
  }

  enviarTest() {
    const dialogRef = this.dialog.open(EnviarTestRavenDialogComponent, {
      width: '500px',
      disableClose: true
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarPreguntas(); // Recargar para actualizar estados si es necesario
      }
    });
  }
}