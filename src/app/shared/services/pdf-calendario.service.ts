import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AuthData } from '../../models/auth/auth';

@Injectable({
  providedIn: 'root'
})
export class PdfCalendarioService {
  private obtenerUsuarioActual(): {nombre: string, apellido: string} {
    const authDataString = localStorage.getItem('auth_data');
    if (authDataString) {
      try {
        const authData: AuthData = JSON.parse(authDataString);
        return {
          nombre: authData.datosUsuario.nombre,
          apellido: authData.datosUsuario.apellido
        };
      } catch (e) {
        return { nombre: '', apellido: '' };
      }
    }
    return { nombre: '', apellido: '' };
  }

  async generarReporteCitas(citas: any[], filtros?: any) {
    const doc = new jsPDF();
    const usuario = this.obtenerUsuarioActual();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;

    // Configuración de fuentes
    doc.setFont('helvetica');

    // Encabezado
    doc.setFontSize(20);
    doc.text('Reporte de Citas', margin, margin);

    // Información del reporte
    doc.setFontSize(10);
    const fecha = new Date().toLocaleDateString('es-ES');
    doc.text(`Fecha de Emisión: ${fecha}`, margin, margin + 15);
    doc.text(`Cantidad de Registros: ${citas.length}`, margin, margin + 20);
    doc.text(`Emitido por: ${usuario.nombre} ${usuario.apellido}`, margin, margin + 25);

    // Filtros aplicados si existen
    if (filtros) {
      let filtrosTexto = 'Filtros aplicados: ';
      if (filtros.modalidad) filtrosTexto += `Modalidad: ${filtros.modalidad}, `;
      if (filtros.estado) filtrosTexto += `Estado: ${filtros.estado}, `;
      if (filtros.fechaInicio) filtrosTexto += `Desde: ${new Date(filtros.fechaInicio).toLocaleDateString()}, `;
      if (filtros.fechaFin) filtrosTexto += `Hasta: ${new Date(filtros.fechaFin).toLocaleDateString()}`;
      
      doc.text(filtrosTexto, margin, margin + 30);
    }

    // Tabla de citas
    const headers = ['Fecha', 'Hora', 'Asunto', 'Postulante', 'Modalidad', 'Estado'];
    const data = citas.map(cita => [
      new Date(cita.horaInicio).toLocaleDateString(),
      `${new Date(cita.horaInicio).toLocaleTimeString()} - ${new Date(cita.horaFin).toLocaleTimeString()}`,
      cita.asunto,
      cita.nombrePostulante,
      cita.modalidad,
      cita.estado
    ]);

    let paginaActual = 1;
    
    // Configuración de la tabla usando autoTable
    (doc as any).autoTable({
      head: [headers],
      body: data,
      startY: margin + 40,
      margin: { left: margin },
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      didDrawPage: () => {
        // Pie de página en cada página
        doc.setFontSize(8);
        const pageCount = (doc as any).internal.pages.length - 1;
        doc.text(
          `Página ${paginaActual} de ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        paginaActual++;
      }
    });

    try {
      const logoImg = new Image();
      logoImg.src = 'logoueb.jpeg';
      doc.addImage(logoImg, 'PNG', pageWidth - 60, margin - 10, 40, 20);
    } catch (error) {
      console.error('Error al cargar el logo:', error);
    }

    // Guardar el PDF
    doc.save(`reporte-citas-${fecha}.pdf`);
  }
}