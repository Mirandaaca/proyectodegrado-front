import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UsuariosService } from '../../../../shared/services/usuarios.service';
import { NotificationService } from '../../../../shared/services/notification.service';
import { Usuario } from '../../../../models/usuario/usuario';

@Component({
  selector: 'app-listar-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './listar-usuarios.component.html'
})
export class ListarUsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  columnas = ['nombre', 'email', 'role', 'acciones'];
  busquedaControl = new FormControl('');

  private usuariosService = inject(UsuariosService);
  private notificationService = inject(NotificationService);

  ngOnInit() {
    this.cargarUsuarios();
    this.setupBusqueda();
  }

  private setupBusqueda() {
    this.busquedaControl.valueChanges.subscribe(valor => {
      if (valor) {
        this.usuarios = this.usuarios.filter(usuario => 
          usuario.nombre.toLowerCase().includes(valor.toLowerCase()) ||
          usuario.email.toLowerCase().includes(valor.toLowerCase())
        );
      } else {
        this.cargarUsuarios();
      }
    });
  }

  cargarUsuarios() {
    this.usuariosService.obtenerUsuarios().subscribe({
      next: (response) => {
        if (response.succeded) {
          this.usuarios = response.data;
        }
      },
      error: () => {
        this.notificationService.error('Error al cargar los usuarios');
      }
    });
  }

  async eliminarUsuario(id: string) {
    const confirmacion = await this.notificationService.confirm(
      '¿Eliminar usuario?',
      'Esta acción no se puede deshacer'
    );

    if (confirmacion) {
      this.usuariosService.eliminar(id).subscribe({
        next: () => {
          this.notificationService.success('Usuario eliminado correctamente');
          this.cargarUsuarios();
        },
        error: () => {
          this.notificationService.error('Error al eliminar el usuario');
        }
      });
    }
  }

  generarReporte() {
    this.notificationService.showLoading('Generando reporte...');
    this.usuariosService.generarReportePDF(this.usuarios).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_usuarios_${new Date().getTime()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.notificationService.success('Reporte generado correctamente');
      },
      error: () => {
        this.notificationService.error('Error al generar el reporte');
      },
      complete: () => {
        this.notificationService.closeLoading();
      }
    });
  }
}