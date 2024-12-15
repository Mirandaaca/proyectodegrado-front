import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AuthData } from '../../models/auth/auth';
import { Postulante } from '../../models/postulantes/Postulante';

@Injectable({
  providedIn: 'root'
})
export class PdfPostulantesService {
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

  async generarReportePostulantes(postulantes: Postulante[]) {
    const doc = new jsPDF();
    const usuario = this.obtenerUsuarioActual();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;

    // Configuración de fuentes
    doc.setFont('helvetica');

    // Encabezado
    doc.setFontSize(20);
    doc.text('Reporte de Postulantes', margin, margin);

    // Información del reporte
    doc.setFontSize(10);
    const fecha = new Date().toLocaleDateString('es-ES');
    doc.text(`Fecha de Emisión: ${fecha}`, margin, margin + 15);
    doc.text(`Cantidad de Registros: ${postulantes.length}`, margin, margin + 20);
    doc.text(`Emitido por: ${usuario.nombre} ${usuario.apellido}`, margin, margin + 25);

    // Estadísticas básicas
    const activos = postulantes.filter(p => p.habilitado).length;
    const inactivos = postulantes.length - activos;
    doc.text(`Postulantes Activos: ${activos}`, margin, margin + 30);
    doc.text(`Postulantes Inactivos: ${inactivos}`, margin, margin + 35);

    // Configuración de la tabla
    const headers = [
      'Nombre Completo',
      'Email',
      'Teléfono',
      'Dirección',
      'Grado de Formación',
      'Estado'
    ];

    const data = postulantes.map(postulante => [
      `${postulante.nombre} ${postulante.apellido}`,
      postulante.email,
      postulante.telefono || 'No especificado',
      postulante.direccion || 'No especificada',
      postulante.gradoDeFormacion || 'No especificado',
      postulante.habilitado ? 'Activo' : 'Inactivo'
    ]);

    let paginaActual = 1;

    // Configuración de la tabla usando autoTable
    (doc as any).autoTable({
      head: [headers],
      body: data,
      startY: margin + 45,
      margin: { left: margin },
      styles: { 
        fontSize: 8,
        cellPadding: 2 
      },
      headStyles: { 
        fillColor: [66, 139, 202],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { fontStyle: 'bold' },  // Nombre Completo en negrita
        5: { // Estilo para la columna de Estado
          fontStyle: 'bold',
          halign: 'center'
        }
      },
      alternateRowStyles: { 
        fillColor: [245, 245, 245] 
      },
      didDrawCell: (data: any) => {
        // Colorear la celda de estado según el valor
        if (data.column.index === 5 && data.cell.section === 'body') {
          const estado = data.cell.raw;
          if (estado === 'Activo') {
            data.cell.styles.textColor = [46, 125, 50]; // Verde para activos
          } else {
            data.cell.styles.textColor = [198, 40, 40]; // Rojo para inactivos
          }
        }
      },
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
        
        // Agregar una nota de confidencialidad al pie de página
        doc.setFontSize(7);
        doc.setTextColor(128);
        doc.text(
          'CONFIDENCIAL - Solo para uso interno',
          margin,
          pageHeight - 10
        );
      }
    });

    try {
      // Agregar logo
      const logoImg = new Image();
      logoImg.src = 'logoueb.jpeg';
      doc.addImage(logoImg, 'PNG', pageWidth - 60, margin - 10, 40, 20);
    } catch (error) {
      console.error('Error al cargar el logo:', error);
    }

    // Guardar el PDF
    doc.save(`reporte-postulantes-${fecha}.pdf`);
  }
}