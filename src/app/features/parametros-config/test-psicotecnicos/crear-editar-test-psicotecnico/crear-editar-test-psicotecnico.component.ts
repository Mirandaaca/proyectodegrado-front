// crear-editar-test-psicotecnico.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { animate, style, transition, trigger } from '@angular/animations';
import { TestPsicotecnico } from '../../../../models/test-psicotecnicos/TestPsicotecnico';

@Component({
  selector: 'app-crear-editar-test-psicotecnico',
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
  styleUrl: './crear-editar-test-psicotecnico.component.css',
  templateUrl: './crear-editar-test-psicotecnico.component.html',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class CrearEditarTestPsicotecnicoComponent implements OnInit {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CrearEditarTestPsicotecnicoComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: TestPsicotecnico
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]],
      duracion: [60, [Validators.required, Validators.min(1), Validators.max(999)]]
    });
  }

  ngOnInit() {
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  guardar() {
    if (this.form.valid) {
      const test: TestPsicotecnico = {
        ...this.form.value,
        id: this.data?.id
      };
      this.dialogRef.close(test);
    }
  }

  cerrar() {
    this.dialogRef.close();
  }
}