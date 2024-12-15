import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Pregunta } from '../../../../models/preguntas/Pregunta';

@Component({
  selector: 'app-crear-editar-pregunta-raven-dialog',
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
  templateUrl: './crear-editar-pregunta-raven-dialog.component.html'
})
export class CrearEditarPreguntaRavenDialogComponent {
  form: FormGroup;
  imagenPreview?: string;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CrearEditarPreguntaRavenDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: Pregunta
  ) {
    this.form = this.fb.group({
      idTestPsicotecnico: [3], // ID fijo para Test Raven
      enunciado: ['', [Validators.required]],
      imagen: [null, [Validators.required]],
      orden: [data?.orden || null]
    });

    if (data) {
      this.form.patchValue(data);
      this.imagenPreview = data.rutaImagen;
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
      
      formData.append('data', JSON.stringify(data));
      
      this.dialogRef.close(formData);
    }
  }

  cerrar() {
    this.dialogRef.close();
  }
}