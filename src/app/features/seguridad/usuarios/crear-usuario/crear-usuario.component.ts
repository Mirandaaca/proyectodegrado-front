import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormularioUsuarioComponent } from '../formulario-usuario/formulario-usuario.component';
import { UsuariosService } from '../../../../shared/services/usuarios.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Usuario } from '../../../../models/usuario/usuario';

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [CommonModule, FormularioUsuarioComponent],
  template: `<app-formulario-usuario (onSubmit)="guardar($event)"></app-formulario-usuario>`
})
export class CrearUsuarioComponent {
  private usuariosService = inject(UsuariosService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  guardar(usuario: Usuario) {
    this.usuariosService.crear(usuario).subscribe({
      next: (response) => {
        if (response.succeded) {
          this.notificationService.success('Usuario creado correctamente');
          this.router.navigate(['/app/seguridad/usuarios']);
        } else {
          this.notificationService.error(response.message || 'Error al crear el usuario');
        }
      },
      error: () => {
        this.notificationService.error('Error al crear el usuario');
      }
    });
  }
}