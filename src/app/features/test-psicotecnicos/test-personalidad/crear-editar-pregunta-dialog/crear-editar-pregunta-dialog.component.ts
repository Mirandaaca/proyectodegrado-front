// crear-editar-pregunta-dialog.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { FactoresService } from '../../../../shared/services/factores.service';
import { Pregunta } from '../../../../models/preguntas/Pregunta';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-crear-editar-pregunta-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule
  ],
  styleUrl: './crear-editar-pregunta-dialog.component.css',
  templateUrl: './crear-editar-pregunta-dialog.component.html'
})
export class CrearEditarPreguntaDialogComponent implements OnInit {
  form: FormGroup;
  factores$ = new Observable<any[]>();

  constructor(
    private fb: FormBuilder,
    private factoresService: FactoresService,
    public dialogRef: MatDialogRef<CrearEditarPreguntaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: Pregunta
  ) {
    this.form = this.fb.group({
      idTestPsicotecnico: [1], // ID fijo para Test de Personalidad
      enunciado: ['', [Validators.required]],
      idFactor: [null],
      orden: [data?.orden || null]
    });
  }

  ngOnInit() {
    if (this.data) {
      this.form.patchValue(this.data);
    }

    // Configurar autocompletado de factores
    this.factores$ = this.form.get('idFactor')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (typeof value === 'string') {
          return this.factoresService.obtenerFactoresPorNombre(value);
        }
        return of([]);
      })
    );
  }

  displayFactor(factorId: any): string {
    // Implementar lógica para mostrar el nombre del factor
    return factorId ? `Factor ${factorId}` : '';
  }

  guardar() {
    if (this.form.valid) {
      const pregunta = {
        ...this.form.value,
        id: this.data?.id
      };
      this.dialogRef.close(pregunta);
    }
  }

  cerrar() {
    this.dialogRef.close();
  }
}