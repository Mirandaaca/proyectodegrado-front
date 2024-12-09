import { trigger, transition, style, animate, state } from '@angular/animations';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-login',
  imports: [CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatButtonModule,
    MatIconModule,
    RouterModule, MatProgressSpinnerModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  animations:[
    trigger('fadeInUp', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('400ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('buttonState', [
      state('idle', style({ transform: 'scale(1)' })),
      state('loading', style({ transform: 'scale(0.95)' })),
      transition('* <=> *', animate('200ms ease-out'))
    ])
  ]
})
export class LoginComponent {
  form: FormGroup;
 hidePassword = true;
 isLoading = false;

 constructor(
   private fb: FormBuilder,
   private authService: AuthService,
   private router: Router
 ) {
   this.form = this.fb.group({
     email: ['', [Validators.required, Validators.email]],
     password: ['', Validators.required]
   });
 }

 onSubmit() {
  if (this.form.valid) {
    this.isLoading = true;
    this.authService.login(
      this.form.get('email')!.value,
      this.form.get('password')!.value
    ).subscribe({
      next: (response) => {
        if (!response.succeded) {
          Swal.fire({
            title: 'Error',
            text: response.message,
            icon: 'error'
          });
          this.isLoading = false; // Reset loading state on error
        }
      },
      error: (err) => {
        Swal.fire({
          title: 'Error',
          text: "Email o contraseña incorrectos, vuelva a intentarlo",   //err.error,
          icon: 'error'
        });
        this.isLoading = false; // Reset loading state on error
      }
    });
  }
 }
}
