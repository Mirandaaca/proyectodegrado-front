import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormularioUsuarioComponent } from '../formulario-usuario/formulario-usuario.component';
import { UsuariosService } from '../../../../shared/services/usuarios.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Usuario } from '../../../../models/usuario/usuario';

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [CommonModule, FormularioUsuarioComponent],
  template: `
    <app-formulario-usuario 
      *ngIf="usuario" 
      [modelo]="usuario" 
      (onSubmit)="guardar($event)">
    </app-formulario-usuario>`
})
export class EditarUsuarioComponent implements OnInit {
  usuario?: Usuario;
  
  private usuariosService = inject(UsuariosService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.cargarUsuario(id);
      }
    });
  }

  cargarUsuario(id: string) {
    this.usuariosService.obtenerPorId(id).subscribe({
      next: (response) => {
        if (response.succeded) {
          this.usuario = response.data;
        } else {
          this.notificationService.error('No se pudo cargar el usuario');
          this.router.navigate(['/app/seguridad/usuarios']);
        }
      },
      error: () => {
        this.notificationService.error('Error al cargar el usuario');
        this.router.navigate(['/app/seguridad/usuarios']);
      }
    });
  }

  guardar(usuario: Usuario) {
    if (!this.usuario?.id) return;

    this.usuariosService.actualizar(this.usuario.id, usuario).subscribe({
      next: () => {
        this.notificationService.success('Usuario actualizado correctamente');
        this.router.navigate(['/app/seguridad/usuarios']);
      },
      error: () => {
        this.notificationService.error('Error al actualizar el usuario');
      }
    });
  }
}