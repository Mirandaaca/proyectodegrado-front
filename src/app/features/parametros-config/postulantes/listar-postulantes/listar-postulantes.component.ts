import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2';
import { animate, style, transition, trigger } from '@angular/animations';
import { Postulante } from '../../../../models/postulantes/Postulante';
import { PostulantesService } from '../../../../shared/services/postulantes.service';
@Component({
  selector: 'app-listar-postulantes',
  imports: [CommonModule, 
    MatTableModule, 
    MatPaginatorModule, 
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    RouterModule],
  templateUrl: './listar-postulantes.component.html',
  styleUrl: './listar-postulantes.component.css',
  animations:[
    trigger('scaleIn', [
      transition(':enter', [
        style({ transform: 'scale(0.95)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'scale(1)', opacity: 1 }))
      ])
    ]),
    trigger('tableAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ]),
    trigger('rowAnimation', [
      transition(':enter', [
        style({ transform: 'translateY(10px)', opacity: 0 }),
        animate('200ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
      ])
    ])
  ]
})
export class ListarPostulantesComponent implements OnInit {
  dataSource = new MatTableDataSource<Postulante>([]);
  columnasAMostrar = ['nombre', 'email', 'telefono', 'habilitado', 'acciones'];
  totalRegistros = 0;
  paginaActual = 1;
  registrosPorPagina = 10;
  private postulantesService = inject(PostulantesService);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  ngOnInit(): void {
    this.cargarPostulantes();
  }
  ngAfterViewInit() {
    this.paginator.page.subscribe(() => {
      this.paginaActual = this.paginator.pageIndex + 1;
      this.registrosPorPagina = this.paginator.pageSize;
      this.cargarPostulantes();
    });
  }
  cargarPostulantes() {
    this.postulantesService.obtenerPostulantes(this.paginaActual, this.registrosPorPagina)
      .subscribe({
        next: (response) => {
          this.dataSource.data = response.postulantes;
          this.totalRegistros = response.totalRecords;
        },
        error: () => {
          Swal.fire({
            title: 'Error',
            text: 'No se pudieron cargar los postulantes',
            icon: 'error'
          });
        }
      });
  }
  eliminarPostulante(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.postulantesService.eliminar(id).subscribe({
          next: () => {
            Swal.fire(
              '¡Eliminado!',
              'El postulante ha sido eliminado.',
              'success'
            );
            this.cargarPostulantes();
          },
          error: () => {
            Swal.fire(
              'Error',
              'No se pudo eliminar el postulante',
              'error'
            );
          }
        });
      }
    });
  }

}
