export interface Cita {
  id: number;
  idUsuario: string;
  nombreUsuario: string;
  idPostulante: number;
  nombrePostulante: string;
  horaInicio: Date;
  horaFin: Date;
  asunto: string;
  modalidad: 'Virtual' | 'Presencial';
  estado: string;
  lugar: string;
  color: string;
}