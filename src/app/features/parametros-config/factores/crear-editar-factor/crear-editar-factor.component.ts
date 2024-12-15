// dialog/crear-editar-factor.component.ts
import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { animate, style, transition, trigger } from '@angular/animations';
import { Factor } from '../../../../models/factores/Factor';

@Component({
  selector: 'app-crear-editar-factor',
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
  styleUrl: './crear-editar-factor.component.css',
  templateUrl:'./crear-editar-factor.component.html',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class CrearEditarFactorComponent implements OnInit {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<CrearEditarFactorComponent>,
    @Inject(MAT_DIALOG_DATA) public data?: Factor
  ) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
      descripcion: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }

  guardar() {
    if (this.form.valid) {
      const factor: Factor = {
        ...this.form.value,
        id: this.data?.id
      };
      this.dialogRef.close(factor);
    }
  }

  cerrar() {
    this.dialogRef.close();
  }
}