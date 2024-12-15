import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Respuesta } from '../../../../models/preguntas/Pregunta';

@Component({
  selector: 'app-crear-editar-respuesta-raven-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule
  ],
  templateUrl: './crear-editar-respuesta-raven-dialog.component.html'
})
export class CrearEditarRespuestaRavenDialogComponent {
  form: FormGroup;
  imagenPreview?: string;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CrearEditarRespuestaRavenDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: { respuesta?: Respuesta, idPregunta: number }
  ) {
    this.form = this.fb.group({
      idPregunta: [data?.idPregunta],
      puntaje: [0, [Validators.required, Validators.min(0)]],
      esCorrecta: [false],
      imagen: [null, [Validators.required]],
      orden: [data?.respuesta?.orden || null]
    });

    if (data?.respuesta) {
      this.form.patchValue(data.respuesta);
      this.imagenPreview = data.respuesta.rutaImagen;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.form.patchValue({ imagen: file });
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenPreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  guardar() {
    if (this.form.valid) {
      const formData = new FormData();
      const { imagen, ...data } = this.form.value;
      
      if (imagen instanceof File) {
        formData.append('imagen', imagen);
      }
      
      // Agregar el ID si estamos editando
      if (this.data?.respuesta?.id) {
        data.id = this.data.respuesta.id;
      }
      
      formData.append('data', JSON.stringify(data));
      
      this.dialogRef.close(formData);
    }
  }

  cerrar() {
    this.dialogRef.close();
  }
}