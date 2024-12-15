import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TestRavenService } from '../../../../shared/services/test-raven.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Pregunta, Respuesta } from '../../../../models/preguntas/Pregunta';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { animate, style, transition, trigger } from '@angular/animations';

interface RespuestasGuardadas {
  [key: number]: number; // preguntaId: respuestaId
}

@Component({
  selector: 'app-vista-previa-raven',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule
  ],
  templateUrl: './vista-previa-raven.component.html',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class VistaPreviaRavenComponent implements OnInit {
  preguntas: Pregunta[] = [];
  paginaActual = 0;
  registrosPorPagina = 10; // Mostrar una pregunta a la vez
  respuestasSeleccionadas: RespuestasGuardadas = {};
  
  private testService = inject(TestRavenService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  constructor() {
    // Cargar respuestas guardadas si existen
    const respuestasGuardadas = localStorage.getItem('test_raven_respuestas');
    if (respuestasGuardadas) {
      this.respuestasSeleccionadas = JSON.parse(respuestasGuardadas);
    }
  }

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
        this.volverAtras();
      }
    });
  }

  get preguntaActual(): Pregunta | undefined {
    return this.preguntas[this.paginaActual];
  }

  get totalPaginas(): number {
    return this.preguntas.length;
  }

  get esPrimeraPagina(): boolean {
    return this.paginaActual === 0;
  }

  get esUltimaPagina(): boolean {
    return this.paginaActual === this.totalPaginas - 1;
  }

  seleccionarRespuesta(preguntaId: number, respuestaId: number) {
    this.respuestasSeleccionadas[preguntaId] = respuestaId;
    localStorage.setItem('test_raven_respuestas', JSON.stringify(this.respuestasSeleccionadas));
  }

  esRespuestaSeleccionada(preguntaId: number, respuestaId: number): boolean {
    return this.respuestasSeleccionadas[preguntaId] === respuestaId;
  }

  cambiarPagina(direccion: number) {
    const nuevaPagina = this.paginaActual + direccion;
    if (nuevaPagina >= 0 && nuevaPagina < this.totalPaginas) {
      this.paginaActual = nuevaPagina;
    }
  }

  volverAtras() {
    this.router.navigate(['/app/tests/raven']);
  }

  finalizar() {
    // En vista previa, solo limpiamos las respuestas y volvemos
    localStorage.removeItem('test_raven_respuestas');
    this.notificationService.success('Vista previa completada');
    this.volverAtras();
  }
}