// test-personalidad.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { PreguntasService } from '../../../../shared/services/preguntas.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Pregunta, Respuesta } from '../../../../models/preguntas/Pregunta';
import { CrearEditarPreguntaDialogComponent } from '../crear-editar-pregunta-dialog/crear-editar-pregunta-dialog.component';
import { CrearEditarRespuestaDialogComponent } from '../crear-editar-respuesta-dialog/crear-editar-respuesta-dialog.component';
import { EnviarTestDialogComponent } from '../enviar-test-dialog/enviar-test-dialog.component';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-test-personalidad',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatMenuModule,
    DragDropModule,
    FormsModule
  ],
  styleUrl: './test-personalidad.component.css',
  templateUrl: './test-personalidad.component.html'
})
export class TestPersonalidadComponent implements OnInit {
  readonly TEST_ID = 1; // ID fijo para el Test de Personalidad
  preguntas: Pregunta[] = [];
  private router = inject(Router);
  constructor(
    private preguntasService: PreguntasService,
    private notificationService: NotificationService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.cargarPreguntas();
  }

  cargarPreguntas() {
    this.preguntasService.obtenerPreguntasConRespuestas(this.TEST_ID)
      .subscribe({
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
  
    // Obtener todas las preguntas que necesitan actualización
    const preguntasAActualizar = [];
    const start = Math.min(event.previousIndex, event.currentIndex);
    const end = Math.max(event.previousIndex, event.currentIndex);
  
    // Preparar las actualizaciones de orden
    for (let i = start; i <= end; i++) {
      const pregunta = this.preguntas[i];
      preguntasAActualizar.push({
        id: pregunta.id!,
        orden: i + 1 // Los órdenes empiezan en 1
      });
    }
  
    try {
      this.notificationService.showLoading('Actualizando orden...');
      await this.preguntasService.actualizarOrdenPreguntas(preguntasAActualizar).toPromise();
      
      // Actualizar la UI
      moveItemInArray(this.preguntas, event.previousIndex, event.currentIndex);
      
      // Actualizar los órdenes en el array local
      this.preguntas = this.preguntas.map((pregunta, index) => ({
        ...pregunta,
        orden: index + 1
      }));
  
      this.notificationService.success('Orden actualizado correctamente');
    } catch {
      this.notificationService.error('Error al actualizar el orden');
      // Recargar las preguntas para asegurar sincronización
      this.cargarPreguntas();
    } finally {
      this.notificationService.closeLoading();
    }
  }
  
  async dropRespuesta(event: CdkDragDrop<Respuesta[]>, pregunta: Pregunta) {
    if (event.previousIndex === event.currentIndex) return;
  
    // Obtener todas las respuestas que necesitan actualización
    const respuestasAActualizar = [];
    const start = Math.min(event.previousIndex, event.currentIndex);
    const end = Math.max(event.previousIndex, event.currentIndex);
  
    // Preparar las actualizaciones de orden
    for (let i = start; i <= end; i++) {
      const respuesta = pregunta.respuestas[i];
      respuestasAActualizar.push({
        id: respuesta.id!,
        orden: i + 1 // Los órdenes empiezan en 1
      });
    }
  
    try {
      this.notificationService.showLoading('Actualizando orden...');
      await this.preguntasService.actualizarOrdenRespuestas(respuestasAActualizar).toPromise();
      
      // Actualizar la UI
      moveItemInArray(pregunta.respuestas, event.previousIndex, event.currentIndex);
      
      // Actualizar los órdenes en el array local
      pregunta.respuestas = pregunta.respuestas.map((respuesta, index) => ({
        ...respuesta,
        orden: index + 1
      }));
  
      this.notificationService.success('Orden actualizado correctamente');
    } catch {
      this.notificationService.error('Error al actualizar el orden');
      // Recargar las preguntas para asegurar sincronización
      this.cargarPreguntas();
    } finally {
      this.notificationService.closeLoading();
    }
  }

  // TO-DO: Implementar los diálogos
  agregarPregunta() {
    const dialogRef = this.dialog.open(CrearEditarPreguntaDialogComponent, {
      width: '500px',
      disableClose: true
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const nuevaPregunta = {
          idTestPsicotecnico: this.TEST_ID,
          enunciado: result.enunciado,
          idFactor: result.idFactor || null,
          imagen: null // o la imagen si se proporciona una
        };
  
        this.preguntasService.crearPregunta(nuevaPregunta).subscribe({
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
    const dialogRef = this.dialog.open(CrearEditarPreguntaDialogComponent, {
      width: '500px',
      data: pregunta,
      disableClose: true
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const preguntaActualizada = {
          id: pregunta.id,
          enunciado: result.enunciado,
          idFactor: result.idFactor || null,
          orden: pregunta.orden,
          nuevaImagen: null // o la nueva imagen si se proporciona una
        };
  
        this.preguntasService.actualizarPregunta(preguntaActualizada).subscribe({
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
    const dialogRef = this.dialog.open(CrearEditarRespuestaDialogComponent, {
      width: '500px',
      data: { 
        idPregunta: pregunta.id 
      },
      disableClose: true
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const nuevaRespuesta = {
          IdPregunta: pregunta.id,
          Descripcion: result.descripcion,
          Opcion: result.opcion,
          Puntaje: result.puntaje,
          EsCorrecta: '',  // o el valor que corresponda
          imagen: ''  // o la imagen si se proporciona una
        };
  
        this.preguntasService.crearRespuesta(nuevaRespuesta).subscribe({
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
    const dialogRef = this.dialog.open(CrearEditarRespuestaDialogComponent, {
      width: '500px',
      data: { 
        respuesta,
        idPregunta: pregunta.id 
      },
      disableClose: true
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const respuestaActualizada = {
          Id: respuesta.id,
          Descripcion: result.descripcion,
          Opcion: result.opcion,
          Puntaje: result.puntaje,
          EsCorrecta: '',
          IndiceRaven: '',
          nuevaImagen: ''
        };
  
        this.preguntasService.actualizarRespuesta(respuestaActualizada).subscribe({
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
    const confirmacion = await this.notificationService.confirm(
      '¿Eliminar pregunta?',
      'Esta acción no se puede deshacer'
    );

    if (confirmacion) {
      this.preguntasService.eliminarPregunta(pregunta.id!).subscribe({
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
    const confirmacion = await this.notificationService.confirm(
      '¿Eliminar respuesta?',
      'Esta acción no se puede deshacer'
    );

    if (confirmacion) {
      this.preguntasService.eliminarRespuesta(respuesta.id!).subscribe({
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
    this.router.navigate(['/app/tests/personalidad/vista-previa']);
  }
  
  enviarTest() {
    const dialogRef = this.dialog.open(EnviarTestDialogComponent, {
      width: '500px',
      disableClose: true
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.cargarPreguntas(); // Por si necesitamos actualizar algo
      }
    });
  }
}