// detalles-cita/detalles-cita.component.ts
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Cita } from '../../../../../models/citas/Cita';
@Component({
  selector: 'app-detalles-cita',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './detalles-cita.component.html'
})
export class DetallesCitaComponent {
  constructor(
    public dialogRef: MatDialogRef<DetallesCitaComponent>,
    @Inject(MAT_DIALOG_DATA) public cita: Cita
  ) {}

  cerrar() {
    this.dialogRef.close();
  }

  editarCita() {
    this.dialogRef.close({ action: 'editar', cita: this.cita });
  }

  eliminarCita() {
    this.dialogRef.close({ action: 'eliminar', cita: this.cita });
  }
}