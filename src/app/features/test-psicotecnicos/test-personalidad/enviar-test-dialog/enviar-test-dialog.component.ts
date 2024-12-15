import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { PostulanteCita } from '../../../../models/postulantes/PostulantCita';
import { TestPersonalidadService } from '../../../../shared/services/testpersonalidad.service';
import { NotificationService } from '../../../../shared/services/notification.service';

@Component({
  selector: 'app-enviar-test-dialog',
  imports: [CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatDialogModule,
    FormsModule
  ],
  templateUrl: './enviar-test-dialog.component.html',
  styleUrl: './enviar-test-dialog.component.css'
})
export class EnviarTestDialogComponent implements OnInit {
  postulantes: PostulanteCita[] = [];
  postulanteSeleccionado?: PostulanteCita;
  readonly TEST_ID = 1;

  constructor(
    private testService: TestPersonalidadService,
    private notificationService: NotificationService,
    public dialogRef: MatDialogRef<EnviarTestDialogComponent>
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
        this.notificationService.success('Correo enviado correctamente');
        this.dialogRef.close(true);
      },
      error: () => {
        this.notificationService.error('Error al enviar el correo');
      }
    });
  }

  cerrar() {
    this.dialogRef.close();
  }
}
