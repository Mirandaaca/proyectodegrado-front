// crear-editar-respuesta-dialog.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Respuesta } from '../../../../models/preguntas/Pregunta';

@Component({
  selector: 'app-crear-editar-respuesta-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  styleUrl: './crear-editar-respuesta-dialog.component.css',
  templateUrl: './crear-editar-respuesta-dialog.component.html'
})
export class CrearEditarRespuestaDialogComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CrearEditarRespuestaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: {respuesta?: Respuesta, idPregunta: number}
  ) {
    this.form = this.fb.group({
      idPregunta: [data?.idPregunta],
      descripcion: ['', [Validators.required]],
      opcion: ['', [Validators.required]],
      puntaje: [0, [Validators.required, Validators.min(0)]]
    });

    if (data?.respuesta) {
      this.form.patchValue(data.respuesta);
    }
  }

  guardar() {
    if (this.form.valid) {
      const respuesta = {
        ...this.form.value,
        id: this.data?.respuesta?.id
      };
      this.dialogRef.close(respuesta);
    }
  }

  cerrar() {
    this.dialogRef.close();
  }
}