import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  try {
    const { cursoId, cursoTitulo, fechaInicio, fechaFin, emailDestino } = await req.json();

    // Obtener todas las inscripciones del día desde localStorage
    // Como esto es server-side, necesitamos recibir los datos del cliente
    const { participantes } = await req.json();

    if (!participantes || participantes.length === 0) {
      return NextResponse.json({ 
        mensaje: 'No hay actividad registrada para este curso en el período seleccionado' 
      }, { status: 200 });
    }

    // Configurar transporter de nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Generar HTML del reporte
    const htmlReporte = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 800px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1226aa 0%, #0e1f88 100%); color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 10px 0 0 0; opacity: 0.9; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          th { background: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; color: #1f2937; border-bottom: 2px solid #e5e7eb; }
          td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
          .aprobado { color: #059669; font-weight: 600; }
          .reprobado { color: #dc2626; font-weight: 600; }
          .en-progreso { color: #f59e0b; font-weight: 600; }
          .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 14px; }
          .stats { display: flex; gap: 20px; margin: 20px 0; }
          .stat-card { flex: 1; background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center; }
          .stat-number { font-size: 32px; font-weight: bold; color: #1226aa; }
          .stat-label { color: #6b7280; font-size: 14px; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Reporte Diario de Curso</h1>
            <p>Academia Santafé - Sistema de Gestión de Aprendizaje</p>
          </div>

          <div style="background: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #1226aa; margin-top: 0;">Curso: ${cursoTitulo || 'Sin título'}</h2>
            <p><strong>Período:</strong> ${fechaInicio || 'Hoy'} ${fechaFin ? `hasta ${fechaFin}` : ''}</p>
            <p><strong>Total de Participantes:</strong> ${participantes.length}</p>
          </div>

          <div class="stats">
            <div class="stat-card">
              <div class="stat-number" style="color: #059669;">${participantes.filter((p: any) => p.aprobado).length}</div>
              <div class="stat-label">Aprobados</div>
            </div>
            <div class="stat-card">
              <div class="stat-number" style="color: #dc2626;">${participantes.filter((p: any) => p.reprobado).length}</div>
              <div class="stat-label">Reprobados</div>
            </div>
            <div class="stat-card">
              <div class="stat-number" style="color: #f59e0b;">${participantes.filter((p: any) => !p.aprobado && !p.reprobado).length}</div>
              <div class="stat-label">En Progreso</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Nombre Completo</th>
                <th>Documento</th>
                <th>Cargo</th>
                <th>Empresa</th>
                <th>Progreso</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${participantes.map((p: any) => `
                <tr>
                  <td>${p.nombre}</td>
                  <td>${p.documento}</td>
                  <td>${p.cargo || 'No especificado'}</td>
                  <td>${p.empresa || 'No especificado'}</td>
                  <td>${p.progreso || 0}%</td>
                  <td class="${p.aprobado ? 'aprobado' : p.reprobado ? 'reprobado' : 'en-progreso'}">
                    ${p.aprobado ? '✓ APROBADO' : p.reprobado ? '✗ REPROBADO' : '⏳ En Progreso'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p><strong>Academia Santafé</strong></p>
            <p>Este es un reporte automático generado el ${new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Enviar correo
    const info = await transporter.sendMail({
      from: `"Academia Santafé" <${process.env.SMTP_USER}>`,
      to: emailDestino,
      subject: `📊 Reporte Diario - ${cursoTitulo} - ${new Date().toLocaleDateString('es-ES')}`,
      html: htmlReporte
    });

    console.log('✅ Reporte enviado:', info.messageId);

    return NextResponse.json({ 
      success: true, 
      mensaje: 'Reporte enviado exitosamente',
      messageId: info.messageId,
      participantes: participantes.length
    });

  } catch (error: any) {
    console.error('❌ Error al enviar reporte:', error);
    return NextResponse.json({ 
      error: 'Error al enviar el reporte', 
      detalles: error.message 
    }, { status: 500 });
  }
}
