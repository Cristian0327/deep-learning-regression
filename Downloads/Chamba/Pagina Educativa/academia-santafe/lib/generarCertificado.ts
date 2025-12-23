import { jsPDF } from 'jspdf';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export const generarCertificado = async (
  nombreEstudiante: string,
  nombreCurso: string,
  instructor: string,
  fechaCompletado: string,
  plantillaUrl?: string,
  documentoEstudiante?: string
): Promise<Blob> => {
  if (plantillaUrl) {
    // Verificar si es PDF o imagen
    const esPDF = plantillaUrl.startsWith('data:application/pdf') || plantillaUrl.endsWith('.pdf');
    
    try {
      if (esPDF) {
        return await generarCertificadoDesdePDF(nombreEstudiante, nombreCurso, instructor, fechaCompletado, plantillaUrl, documentoEstudiante);
      } else {
        // Es una imagen, convertir a PDF primero
        return await generarCertificadoDesdeImagen(nombreEstudiante, nombreCurso, instructor, fechaCompletado, plantillaUrl, documentoEstudiante);
      }
    } catch (error) {
      console.error('Error al usar plantilla, usando diseño por defecto:', error);
      return generarCertificadoPorDefecto(nombreEstudiante, nombreCurso, instructor, fechaCompletado, documentoEstudiante);
    }
  } else {
    // Usar diseño por defecto con jsPDF
    return generarCertificadoPorDefecto(nombreEstudiante, nombreCurso, instructor, fechaCompletado, documentoEstudiante);
  }
};

async function generarCertificadoDesdePDF(
  nombreEstudiante: string,
  nombreCurso: string,
  instructor: string,
  fechaCompletado: string,
  plantillaUrl: string,
  documentoEstudiante?: string
) {
  let pdfBytes: ArrayBuffer;

  // Verificar si es base64 o URL
  if (plantillaUrl.startsWith('data:application/pdf')) {
    // Es base64
    const base64Data = plantillaUrl.split(',')[1];
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    pdfBytes = bytes.buffer;
  } else {
    // Es URL, descargar
    const response = await fetch(plantillaUrl);
    pdfBytes = await response.arrayBuffer();
  }

  // Cargar el PDF
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const { width, height } = firstPage.getSize();

  // Cargar fuentes
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Agregar texto sobre el PDF (ajusta las posiciones según tu plantilla)
  // Nombre del estudiante (centro, ajusta la posición Y según tu diseño)
  const nombreFontSize = 28;
  const nombreWidth = font.widthOfTextAtSize(nombreEstudiante, nombreFontSize);
  firstPage.drawText(nombreEstudiante, {
    x: (width - nombreWidth) / 2,
    y: height * 0.55, // Ajusta este valor según tu plantilla (55% desde abajo)
    size: nombreFontSize,
    font: font,
    color: rgb(0.12, 0.16, 0.22), // Color gris oscuro
  });

  // Documento del estudiante (justo debajo del nombre)
  if (documentoEstudiante) {
    const documentoTexto = `DOCUMENTO: ${documentoEstudiante}`;
    const documentoFontSize = 16;
    const documentoWidth = fontNormal.widthOfTextAtSize(documentoTexto, documentoFontSize);
    firstPage.drawText(documentoTexto, {
      x: (width - documentoWidth) / 2,
      y: height * 0.48, // Justo debajo del nombre
      size: documentoFontSize,
      font: fontNormal,
      color: rgb(0.12, 0.16, 0.22),
    });
  }

  // Nombre del curso
  const cursoFontSize = 18;
  const cursoWidth = font.widthOfTextAtSize(nombreCurso, cursoFontSize);
  firstPage.drawText(nombreCurso, {
    x: (width - cursoWidth) / 2,
    y: height * 0.40, // 40% desde abajo
    size: cursoFontSize,
    font: font,
    color: rgb(0.15, 0.39, 0.92), // Color azul
  });

  // Fecha
  const fechaTexto = new Date(fechaCompletado).toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const fechaFontSize = 12;
  const fechaWidth = fontNormal.widthOfTextAtSize(fechaTexto, fechaFontSize);
  firstPage.drawText(fechaTexto, {
    x: (width - fechaWidth) / 2,
    y: height * 0.30, // 30% desde abajo
    size: fechaFontSize,
    font: fontNormal,
    color: rgb(0.42, 0.45, 0.5),
  });

  // Instructor
  const instructorTexto = `Instructor: ${instructor}`;
  const instructorWidth = fontNormal.widthOfTextAtSize(instructorTexto, fechaFontSize);
  firstPage.drawText(instructorTexto, {
    x: (width - instructorWidth) / 2,
    y: height * 0.25, // 25% desde abajo
    size: fechaFontSize,
    font: fontNormal,
    color: rgb(0.42, 0.45, 0.5),
  });

  // Guardar el PDF modificado
  const pdfBytesModificado = await pdfDoc.save();
  
  // Retornar blob
  const blob = new Blob([pdfBytesModificado], { type: 'application/pdf' });
  
  // También descargar
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Certificado_${nombreCurso.replace(/\s+/g, '_')}_${nombreEstudiante.replace(/\s+/g, '_')}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
  
  return blob;
}

async function generarCertificadoDesdeImagen(
  nombreEstudiante: string,
  nombreCurso: string,
  instructor: string,
  fechaCompletado: string,
  imagenUrl: string,
  documentoEstudiante?: string
) {
  // Crear un nuevo PDF
  const pdfDoc = await PDFDocument.create();
  
  // Determinar el tipo de imagen
  let imagen;
  const esJPG = imagenUrl.includes('jpeg') || imagenUrl.includes('jpg');
  const esPNG = imagenUrl.includes('png');
  
  if (imagenUrl.startsWith('data:')) {
    // Es base64
    const base64Data = imagenUrl.split(',')[1];
    const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    if (esJPG) {
      imagen = await pdfDoc.embedJpg(imageBytes);
    } else if (esPNG) {
      imagen = await pdfDoc.embedPng(imageBytes);
    } else {
      throw new Error('Formato de imagen no soportado');
    }
  } else {
    // Es URL
    const response = await fetch(imagenUrl);
    const imageBytes = await response.arrayBuffer();
    
    if (esJPG) {
      imagen = await pdfDoc.embedJpg(imageBytes);
    } else if (esPNG) {
      imagen = await pdfDoc.embedPng(imageBytes);
    } else {
      throw new Error('Formato de imagen no soportado');
    }
  }
  
  // Crear página con el tamaño de la imagen (formato landscape A4)
  const page = pdfDoc.addPage([841.89, 595.28]); // A4 landscape en puntos
  const { width, height } = page.getSize();
  
  // Dibujar la imagen de fondo
  page.drawImage(imagen, {
    x: 0,
    y: 0,
    width: width,
    height: height,
  });
  
  // Cargar fuentes
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const fontNormal = await pdfDoc.embedFont(StandardFonts.Helvetica);
  
  // Agregar texto sobre la imagen
  // Nombre del estudiante
  const nombreFontSize = 28;
  const nombreWidth = font.widthOfTextAtSize(nombreEstudiante, nombreFontSize);
  page.drawText(nombreEstudiante, {
    x: (width - nombreWidth) / 2,
    y: height * 0.55,
    size: nombreFontSize,
    font: font,
    color: rgb(0.12, 0.16, 0.22),
  });

  // Documento del estudiante (justo debajo del nombre)
  if (documentoEstudiante) {
    const documentoTexto = `DOCUMENTO: ${documentoEstudiante}`;
    const documentoFontSize = 16;
    const documentoWidth = fontNormal.widthOfTextAtSize(documentoTexto, documentoFontSize);
    page.drawText(documentoTexto, {
      x: (width - documentoWidth) / 2,
      y: height * 0.48, // Justo debajo del nombre
      size: documentoFontSize,
      font: fontNormal,
      color: rgb(0.12, 0.16, 0.22),
    });
  }
  
  // Nombre del curso
  const cursoFontSize = 18;
  const cursoWidth = font.widthOfTextAtSize(nombreCurso, cursoFontSize);
  page.drawText(nombreCurso, {
    x: (width - cursoWidth) / 2,
    y: height * 0.40,
    size: cursoFontSize,
    font: font,
    color: rgb(0.15, 0.39, 0.92),
  });
  
  // Fecha
  const fechaTexto = new Date(fechaCompletado).toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  const fechaFontSize = 12;
  const fechaWidth = fontNormal.widthOfTextAtSize(fechaTexto, fechaFontSize);
  page.drawText(fechaTexto, {
    x: (width - fechaWidth) / 2,
    y: height * 0.30,
    size: fechaFontSize,
    font: fontNormal,
    color: rgb(0.42, 0.45, 0.5),
  });
  
  // Instructor
  const instructorTexto = `Instructor: ${instructor}`;
  const instructorWidth = fontNormal.widthOfTextAtSize(instructorTexto, fechaFontSize);
  page.drawText(instructorTexto, {
    x: (width - instructorWidth) / 2,
    y: height * 0.25,
    size: fechaFontSize,
    font: fontNormal,
    color: rgb(0.42, 0.45, 0.5),
  });
  
  // Guardar el PDF
  const pdfBytes = await pdfDoc.save();
  
  // Retornar blob
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  
  // También descargar
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Certificado_${nombreCurso.replace(/\s+/g, '_')}_${nombreEstudiante.replace(/\s+/g, '_')}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
  
  return blob;
}

function generarCertificadoPorDefecto(
  nombreEstudiante: string,
  nombreCurso: string,
  instructor: string,
  fechaCompletado: string,
  documentoEstudiante?: string
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  // Fondo blanco
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 297, 210, 'F');
  
  // Borde exterior azul (más grueso)
  doc.setLineWidth(4);
  doc.setDrawColor(22, 78, 160); // Azul empresarial
  doc.rect(10, 10, 277, 190);
  
  // Borde interior naranja (más delgado)
  doc.setLineWidth(2);
  doc.setDrawColor(249, 115, 22); // Naranja empresarial
  doc.rect(16, 16, 265, 178);

  // Título principal
  doc.setFontSize(40);
  doc.setTextColor(22, 78, 160); // Azul empresarial
  doc.setFont('helvetica', 'bold');
  doc.text('CERTIFICADO DE FINALIZACIÓN', 148.5, 50, { align: 'center' });

  // Línea decorativa naranja
  doc.setLineWidth(1);
  doc.setDrawColor(249, 115, 22); // Naranja empresarial
  doc.line(60, 58, 237, 58);

  // Texto "Se otorga a"
  doc.setFontSize(16);
  doc.setTextColor(75, 85, 99);
  doc.setFont('helvetica', 'normal');
  doc.text('Se otorga el presente certificado a', 148.5, 75, { align: 'center' });

  // Nombre del estudiante
  doc.setFontSize(32);
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  doc.text(nombreEstudiante, 148.5, 95, { align: 'center' });

  // Línea bajo el nombre
  doc.setLineWidth(0.3);
  doc.setDrawColor(209, 213, 219);
  const nombreWidth = doc.getTextWidth(nombreEstudiante);
  doc.line(148.5 - nombreWidth/2 - 10, 98, 148.5 + nombreWidth/2 + 10, 98);

  // Documento del estudiante (si existe)
  if (documentoEstudiante) {
    doc.setFontSize(14);
    doc.setTextColor(75, 85, 99);
    doc.setFont('helvetica', 'normal');
    doc.text(`DOCUMENTO: ${documentoEstudiante}`, 148.5, 105, { align: 'center' });
  }

  // Texto descriptivo
  doc.setFontSize(14);
  doc.setTextColor(75, 85, 99);
  doc.setFont('helvetica', 'normal');
  doc.text('Por haber completado satisfactoriamente el curso', 148.5, documentoEstudiante ? 115 : 110, { align: 'center' });

  // Nombre del curso
  doc.setFontSize(20);
  doc.setTextColor(22, 78, 160); // Azul empresarial
  doc.setFont('helvetica', 'bold');
  doc.text(nombreCurso, 148.5, documentoEstudiante ? 130 : 125, { align: 'center' });

  // Información adicional
  doc.setFontSize(12);
  doc.setTextColor(107, 114, 128);
  doc.setFont('helvetica', 'normal');
  doc.text(`Instructor: ${instructor}`, 148.5, documentoEstudiante ? 150 : 145, { align: 'center' });
  doc.text(`Fecha de completado: ${new Date(fechaCompletado).toLocaleDateString('es-ES', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, 148.5, documentoEstudiante ? 160 : 155, { align: 'center' });

  // Firma del instructor
  doc.setLineWidth(0.5);
  doc.setDrawColor(156, 163, 175);
  doc.line(60, 180, 120, 180);
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(instructor, 90, 188, { align: 'center' });
  doc.text('Instructor', 90, 193, { align: 'center' });

  // Logo de la empresa
  const logoX = 195;
  const logoY = 160;
  const logoWidth = 60;
  const logoHeight = 20;
  
  // Cargar logo desde public
  const logoImg = new Image();
  logoImg.src = '/logo-certificado.png';
  
  // Agregar logo al PDF
  doc.addImage(logoImg, 'PNG', logoX, logoY, logoWidth, logoHeight);

  // Guardar y retornar blob
  const pdfBlob = doc.output('blob');
  
  // También descargar
  doc.save(`Certificado_${nombreCurso.replace(/\s+/g, '_')}_${nombreEstudiante.replace(/\s+/g, '_')}.pdf`);
  
  return pdfBlob;
}
