import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TestRavenService } from '../../../../shared/services/test-raven.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { PostulanteCita } from '../../../../models/postulantes/PostulantCita';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-enviar-test-raven-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './enviar-test-raven-dialog.component.html',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(20px)' }))
      ])
    ]),
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(-100%)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
      ])
    ]),
    trigger('expandCollapse', [
      transition(':enter', [
        style({ height: '0', opacity: 0 }),
        animate('300ms ease-out', style({ height: '*', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ height: '0', opacity: 0 }))
      ])
    ])
  ],
  styles: [`
    .pregunta-container {
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .pregunta-container:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 
                 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }

    .respuesta-container {
      transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .respuesta-container:hover {
      transform: scale(1.02);
    }

    .cdk-drag-preview {
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
      @apply bg-white rounded-lg;
    }

    .cdk-drag-placeholder {
      opacity: 0;
    }

    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }

    .drag-handle {
      cursor: move;
      transition: opacity 200ms ease;
    }

    .drag-handle:hover {
      opacity: 1 !important;
    }

    .image-preview {
      transition: transform 300ms ease;
    }

    .image-preview:hover {
      transform: scale(1.05);
    }
  `]
})
export class EnviarTestRavenDialogComponent implements OnInit {
  postulantes: PostulanteCita[] = [];
  postulanteSeleccionado?: PostulanteCita;
  readonly TEST_ID = 3; // ID para Test Raven

  constructor(
    private testService: TestRavenService,
    private notificationService: NotificationService,
    public dialogRef: MatDialogRef<EnviarTestRavenDialogComponent>
  ) {}

  ngOnInit() {
    this.cargarPostulantes();
  }

  cargarPostulantes() {
    this.testService.obtenerPostulantesDisponibles().subscribe({
      next: (postulantes) => {
        this.postulantes = postulantes;
      },
      error: () => {
        this.notificationService.error('Error al cargar los postulantes');
        this.cerrar();
      }
    });
  }

  enviar() {
    if (!this.postulanteSeleccionado) return;

    this.testService.enviarCorreoTest(
      this.postulanteSeleccionado.idCita,
      this.TEST_ID
    ).subscribe({
      next: () => {
        this.notificationService.success('Test enviado correctamente');
        this.dialogRef.close(true);
      },
      error: () => {
        this.notificationService.error('Error al enviar el test');
      }
    });
  }

  cerrar() {
    this.dialogRef.close();
  }
}