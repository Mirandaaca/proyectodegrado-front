import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { Usuario } from '../../../../models/usuario/usuario';

@Component({
  selector: 'app-formulario-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatSelectModule,
    RouterModule
  ],
  templateUrl: './formulario-usuario.component.html'
})
export class FormularioUsuarioComponent implements OnInit {
  @Input() modelo?: Usuario;
  @Output() onSubmit = new EventEmitter<Usuario>();
  form: FormGroup;
  mostrarPassword = false;
  roles = ['Administrador', 'Usuario'];

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre: ['', [Validators.required]],
      apellido: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[*$@#]).{8,}$/)
      ]],
      direccion: ['', [Validators.required]],
      telefono: [''],
      fechaDeNacimiento: [null, [Validators.required]],
      role: ['Usuario', [Validators.required]]
    });
  }

  ngOnInit() {
    if (this.modelo) {
      // Si estamos editando, el password no es requerido
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
      
      this.form.patchValue(this.modelo);
    }
  }

  guardarCambios() {
    if (this.form.valid) {
      const usuario: Usuario = {
        ...this.form.value,
        id: this.modelo?.id
      };
      this.onSubmit.emit(usuario);
    }
  }

  togglePassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }
}