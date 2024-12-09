import { animate, style, transition, trigger } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import { Postulante } from '../../../../models/postulantes/Postulante';

@Component({
  selector: 'app-formulario-postulante',
  imports: [CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    RouterModule],
  templateUrl: './formulario-postulante.component.html',
  styleUrl: './formulario-postulante.component.css',
  animations:[
    trigger('formAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class FormularioPostulanteComponent implements OnInit{
  @Input() modelo?: Postulante;
  @Output() onSubmit = new EventEmitter<Postulante>();
  form: FormGroup;
  ngOnInit(): void {
    if (this.modelo) {
      this.form.patchValue(this.modelo);
    }
  }
  constructor(private fb: FormBuilder){
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['+591 '],
      direccion: [''],
      fechaDeNacimiento: [null, [Validators.required]],
      gradoDeFormacion: [''],
      habilitado: [true]
    });
  }
  guardarCambios() {
    if (this.form.valid) {
      const postulante: Postulante = {
        ...this.form.value,
        id: this.modelo?.id
      };
      this.onSubmit.emit(postulante);
    }
  }
}
