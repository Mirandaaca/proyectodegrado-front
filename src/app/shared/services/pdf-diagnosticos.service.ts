import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { DiagnosticoPersonalidad, DiagnosticoRaven } from '../../models/diagnosticos/diagnostico';
import { AuthData } from '../../models/auth/auth';

@Injectable({
  providedIn: 'root'
})
export class PdfDiagnosticosService {
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

  generarReporteListadoDiagnosticos(diagnosticos: any[], filtros: any, tipoTest: string) {
    const doc = new jsPDF();
    const usuario = this.obtenerUsuarioActual();
    
    // Encabezado
    doc.setFontSize(20);
    doc.text(`Reporte de Diagnósticos - ${tipoTest}`, 20, 20);
    
    // Información del reporte
    doc.setFontSize(12);
    doc.text(`Fecha de Emisión: ${new Date().toLocaleDateString()}`, 20, 35);
    doc.text(`Generado por: ${usuario.nombre} ${usuario.apellido}`, 20, 45);
    
    // Filtros aplicados
    if (filtros) {
      let filtrosTexto = 'Filtros aplicados: ';
      if (filtros.fechaInicio) filtrosTexto += `Desde: ${new Date(filtros.fechaInicio).toLocaleDateString()}, `;
      if (filtros.fechaFin) filtrosTexto += `Hasta: ${new Date(filtros.fechaFin).toLocaleDateString()}`;
      doc.text(filtrosTexto, 20, 55);
    }

    // Tabla de diagnósticos
    const headers = ['Postulante', 'Fecha', 'Estado'];
    const data = diagnosticos.map(d => [
      d.nombrePostulante,
      new Date(d.fechaCita).toLocaleDateString(),
      d.estado
    ]);

    (doc as any).autoTable({
      head: [headers],
      body: data,
      startY: 65,
      styles: { fontSize: 10 }
    });

    doc.save(`diagnosticos_${tipoTest.toLowerCase()}_${new Date().getTime()}.pdf`);
  }

  generarReporteDetalleDiagnosticoPersonalidad(diagnostico: DiagnosticoPersonalidad) {
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(20);
    doc.text('Diagnóstico Test de Personalidad', 20, 20);
    
    // Información del postulante
    doc.setFontSize(14);
    doc.text('Información del Postulante', 20, 35);
    doc.setFontSize(12);
    doc.text(`Nombre: ${diagnostico.nombrePostulante}`, 20, 45);
    doc.text(`Edad: ${diagnostico.edad} años`, 20, 55);
    doc.text(`Carrera: ${diagnostico.carrera}`, 20, 65);
    doc.text(`Fecha: ${new Date(diagnostico.fechaCita).toLocaleDateString()}`, 20, 75);

    let yPos = 95;
    
    // Resultados por factor
    diagnostico.respuestasPorFactor.forEach(factor => {
      doc.setFontSize(14);
      doc.text(`Factor: ${factor.nombreFactor}`, 20, yPos);
      yPos += 10;

      const headers = ['Pregunta', 'Respuesta', 'Puntaje', 'Calificación Final'];
      const data = factor.respuestas.map(r => [
        r.pregunta,
        r.respuesta,
        r.puntaje.toString(),
        r.calificacionFinal
      ]);

      (doc as any).autoTable({
        head: [headers],
        body: data,
        startY: yPos,
        styles: { fontSize: 10 }
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
      
      // Si nos quedamos sin espacio, crear nueva página
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
    });

    doc.save(`diagnostico_personalidad_${diagnostico.nombrePostulante.replace(/\s+/g, '_')}.pdf`);
  }

  generarReporteDetalleDiagnosticoRaven(diagnostico: DiagnosticoRaven) {
    const doc = new jsPDF();
    
    // Encabezado
    doc.setFontSize(20);
    doc.text('Diagnóstico Test de Raven', 20, 20);
    
    // Información del postulante
    doc.setFontSize(14);
    doc.text('Información del Postulante', 20, 35);
    doc.setFontSize(12);
    doc.text(`Nombre: ${diagnostico.nombrePostulante}`, 20, 45);
    doc.text(`Edad: ${diagnostico.edad} años`, 20, 55);
    doc.text(`Carrera: ${diagnostico.carrera}`, 20, 65);
    doc.text(`Fecha: ${new Date(diagnostico.fechaCita).toLocaleDateString()}`, 20, 75);

    // Resultados generales
    doc.setFontSize(14);
    doc.text('Resultados', 20, 95);
    doc.setFontSize(12);
    doc.text(`Puntaje Directo: ${diagnostico.puntajeDirecto}`, 20, 105);
    doc.text(`Percentil: ${diagnostico.percentil}`, 20, 115);
    doc.text(`Rango: ${diagnostico.rango}`, 20, 125);
    doc.text(`Diagnóstico: ${diagnostico.diagnostico}`, 20, 135);

    // Tabla de respuestas
    const headers = ['Pregunta', 'Correcta', 'Puntaje'];
    const data = diagnostico.respuestasSeleccionadas.map((r, i) => [
      `Pregunta ${i + 1}`,
      r.esCorrecta ? 'Sí' : 'No',
      r.puntaje.toString()
    ]);

    (doc as any).autoTable({
      head: [headers],
      body: data,
      startY: 150,
      styles: { fontSize: 10 }
    });

    doc.save(`diagnostico_raven_${diagnostico.nombrePostulante.replace(/\s+/g, '_')}.pdf`);
  }
}