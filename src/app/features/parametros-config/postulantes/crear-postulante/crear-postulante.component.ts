import { Component, inject } from '@angular/core';
import { FormularioPostulanteComponent } from '../formulario-postulante/formulario-postulante.component';
import { PostulantesService } from '../../../../shared/services/postulantes.service';
import { Router } from '@angular/router';
import { Postulante } from '../../../../models/postulantes/Postulante';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-postulante',
  imports: [FormularioPostulanteComponent],
  templateUrl: './crear-postulante.component.html',
  styleUrl: './crear-postulante.component.css'
})
export class CrearPostulanteComponent {
  private postulantesService = inject(PostulantesService);
  private router = inject(Router);
  guardar(postulante: Postulante) {
    this.postulantesService.crear(postulante).subscribe({
      next: () => {
        Swal.fire({
          title: '¡Éxito!',
          text: 'Postulante creado correctamente',
          icon: 'success',
          showConfirmButton: false,
          timer: 1500
        });
        this.router.navigate(['/app/parametrosyconfigs/postulantes']);
      },
      error: () => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo crear el postulante',
          icon: 'error'
        });
      }
    });
  }
}
