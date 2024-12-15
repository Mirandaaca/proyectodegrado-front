// tomar-test-personalidad.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Pregunta, Respuesta } from '../../../../models/preguntas/Pregunta';
import { TestPersonalidadService } from '../../../../shared/services/testpersonalidad.service';
import { RespuestaSeleccionada } from '../../../../models/preguntas/PreguntasPaginadas';

interface RespuestasGuardadas {
  [key: number]: RespuestaSeleccionada;
}
@Component({
  selector: 'app-tomar-test-personalidad',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatPaginatorModule,
    FormsModule
  ],
  templateUrl: './tomar-test-personalidad.component.html',
  styles: [`
    .animate-fadeIn {
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class TomarTestPersonalidadComponent implements OnInit {
  preguntas: Pregunta[] = [];
  paginaActual = 0;
  registrosPorPagina = 10;
  totalRegistros = 0;
  totalPaginas = 0;
  esVistaPrevia = false;
  citaId?: number;
  testId: number = 1; // Test de Personalidad
  private testService = inject(TestPersonalidadService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router); 

  private respuestasStorage = 'test_personalidad_respuestas';

  constructor(
    
  ) {
     // Determinar si estamos en vista previa o tomando el test
     const url = this.router.url;
     this.esVistaPrevia = url.includes('vista-previa');
     
     // Si no es vista previa, obtener parámetros de la URL
     if (!this.esVistaPrevia) {
       this.route.queryParams.subscribe(params => {
         this.citaId = Number(params['citaId']);
         this.testId = Number(params['testPsicotecnicoId']);
         
         // Validar que tengamos los parámetros necesarios
         if (!this.citaId || !this.testId) {
           this.notificationService.error('URL inválida');
           // Redirigir a una página de error o al inicio
         }
       });
     }
  }
  volverAtras() {
    this.router.navigate(['/app/tests/personalidad']);
  }
  esUltimaPagina(): boolean {
    return this.paginaActual === this.totalPaginas - 1;
  }
  ngOnInit() {
    // Obtener parámetros de la URL
    this.route.queryParams.subscribe(params => {
      this.citaId = params['citaId'];
      this.esVistaPrevia = !this.citaId;
      this.cargarPreguntas();
    });

    // Cargar respuestas guardadas
    this.cargarRespuestasGuardadas();
  }

  cargarPreguntas() {
    this.testService.obtenerPreguntasPaginadas(
      this.testId,
      this.paginaActual + 1,
      this.registrosPorPagina
    ).subscribe({
      next: (response) => {
        if (response.succeded) {
          this.preguntas = response.data || []; // Inicializar como arreglo vacío si no hay datos
          this.totalRegistros = response.totalRecords || 0;
          this.totalPaginas = Math.ceil(this.totalRegistros / this.registrosPorPagina);
        } else {
          // Manejar el error de carga de preguntas
          console.error('Error al cargar preguntas:', response);
          this.preguntas = []; // Inicializar como arreglo vacío en caso de error
          this.notificationService.error('Error al cargar las preguntas');
        }
      },
      error: (err) => {
        console.error('Error al cargar preguntas:', err);
        this.preguntas = []; // Inicializar como arreglo vacío en caso de error
        this.notificationService.error('Error al cargar las preguntas');
      }
    });
  }
  

  private cargarRespuestasGuardadas(): RespuestasGuardadas {
    const respuestasGuardadas = localStorage.getItem(this.respuestasStorage);
    if (respuestasGuardadas) {
      return JSON.parse(respuestasGuardadas) as RespuestasGuardadas;
    }
    return {};
  }

  private guardarRespuesta(idPregunta: number, respuesta: RespuestaSeleccionada) {
    const respuestas = this.cargarRespuestasGuardadas();
    respuestas[idPregunta] = respuesta;
    localStorage.setItem(this.respuestasStorage, JSON.stringify(respuestas));
  }

  esRespuestaSeleccionada(preguntaId: number | undefined, respuestaId: number | undefined): boolean {
    if (!preguntaId || !respuestaId) return false;
    
    const respuestas = this.cargarRespuestasGuardadas();
    return respuestas[preguntaId]?.idRespuesta === respuestaId;
  }

  seleccionarRespuesta(preguntaId: number | undefined, respuesta: Respuesta) {
    if (!preguntaId || !respuesta.id) return;
    
    const respuestaSeleccionada: RespuestaSeleccionada = {
      idRespuesta: respuesta.id,
      puntaje: respuesta.puntaje
    };
    this.guardarRespuesta(preguntaId, respuestaSeleccionada);
  }

 todasPreguntasRespondidas(): boolean {
    const respuestas = this.cargarRespuestasGuardadas();
    return this.preguntas.every(pregunta => 
      pregunta.id !== undefined && 
      respuestas[pregunta.id] !== undefined
    );
  }

  onPageChange(event: PageEvent) {
    this.paginaActual = event.pageIndex;
    this.cargarPreguntas();
  }

  cambiarPagina(direccion: number) {
    this.paginaActual += direccion;
    this.cargarPreguntas();
  }

  async enviarTest() {
    if (!this.todasPreguntasRespondidas) {
      this.notificationService.error('Por favor, responda todas las preguntas');
      return;
    }

    if (this.esVistaPrevia) {
      this.notificationService.info('Vista previa completada');
      localStorage.removeItem(this.respuestasStorage);
      this.router.navigate(['/app/tests/personalidad']);
      return;
    }

    const respuestas = this.cargarRespuestasGuardadas();
    // Convertimos explícitamente el objeto a array de RespuestaSeleccionada
    const respuestasSeleccionadas: RespuestaSeleccionada[] = Object.values(respuestas).map(respuesta => ({
      idRespuesta: respuesta.idRespuesta,
      puntaje: respuesta.puntaje
    }));

    const confirmacion = await this.notificationService.confirm(
      '¿Enviar test?',
      'Una vez enviado, no podrá modificar sus respuestas'
    );

    if (confirmacion) {
      this.testService.resolverTest({
        idCita: this.citaId!,
        idTestPsicotecnico: this.testId,
        respuestasSeleccionadas
      }).subscribe({
        next: () => {
          this.notificationService.success('Test enviado correctamente');
          localStorage.removeItem(this.respuestasStorage);
          this.router.navigate(['/app']); // O donde corresponda
        },
        error: () => {
          this.notificationService.error('Error al enviar el test');
        }
      });
    }
  }
}