import { Component, inject, OnInit } from '@angular/core';
import { FormularioPostulanteComponent } from '../formulario-postulante/formulario-postulante.component';
import { Postulante } from '../../../../models/postulantes/Postulante';
import { PostulantesService } from '../../../../shared/services/postulantes.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-editar-postulante',
  imports: [FormularioPostulanteComponent],
  templateUrl: './editar-postulante.component.html',
  styleUrl: './editar-postulante.component.css'
})
export class EditarPostulanteComponent implements OnInit {
  postulante?: Postulante;

  private postulantesService = inject(PostulantesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.postulantesService.obtenerPorId(id).subscribe({
          next: (postulante) => this.postulante = postulante,
          error: () => {
            Swal.fire({
              title: 'Error',
              text: 'No se pudo cargar el postulante',
              icon: 'error'
            });
            this.router.navigate(['/app/parametrosyconfigs/postulantes']);
          }
        });
      }
    });
  }
 guardar(postulante: Postulante) {
    this.postulantesService.actualizar(postulante).subscribe({
      next: () => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Postulante actualizado correctamente',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500
        });
        this.router.navigate(['/app/parametrosyconfigs/postulantes']);
      },
      error: () => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo actualizar el postulante',
          icon: 'error'
        });
      }
    });
  }

}
