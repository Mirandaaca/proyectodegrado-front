// componentes/menu-lateral/menu-lateral.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { animate, style, transition, trigger } from '@angular/animations';
import { Cita } from '../../../../../models/citas/Cita';
import { CitasService } from '../../../../../shared/services/citas.service';

@Component({
  selector: 'app-menu-lateral',
  standalone: true,
  imports: [CommonModule, MatExpansionModule, MatButtonModule, MatIconModule],
  templateUrl: './menu-lateral.component.html',
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class MenuLateralComponent {
  private citasService = inject(CitasService);
  
  citasHoy: Cita[] = [];
  citasManana: Cita[] = [];
  citasSemana: Cita[] = [];

  constructor() {
    this.cargarCitas();
  }

  cargarCitas() {
    this.citasService.obtenerCitasDeHoy().subscribe({
      next: (response) => {
        if (response.succeded) {
          this.citasHoy = response.data;
        }
      }
    });

    this.citasService.obtenerCitasDeManana().subscribe({
      next: (response) => {
        if (response.succeded) {
          this.citasManana = response.data;
        }
      }
    });

    this.citasService.obtenerCitasDeLaSemana().subscribe({
      next: (response) => {
        if (response.succeded) {
          this.citasSemana = response.data;
        }
      }
    });
  }

  verDetallesCita(cita: Cita) {
    // Implementaremos esto después con el diálogo de detalles
  }

  formatearHoraCita(cita: Cita): string {
    return `${new Date(cita.horaInicio).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })} - ${new Date(cita.horaFin).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}`;
  }
}