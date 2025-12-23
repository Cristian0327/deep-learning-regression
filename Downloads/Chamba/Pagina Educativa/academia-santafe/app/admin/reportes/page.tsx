'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FileSpreadsheet, Download, Users, BookOpen, Mail, Send, Calendar } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function ReportesPage() {
  const searchParams = useSearchParams();
  const cursoParam = searchParams.get('curso');
  
  const [inscripciones, setInscripciones] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(cursoParam || 'todos');
  const [emailDestino, setEmailDestino] = useState('');
  const [enviandoReporte, setEnviandoReporte] = useState(false);
  const [fechaFiltro, setFechaFiltro] = useState(new Date().toISOString().split('T')[0]);
  const [cursosData, setCursosData] = useState<any[]>([]);

  useEffect(() => {
    cargarDatos();
    cargarCursos();
  }, []);

  useEffect(() => {
    // Si viene curso por URL, seleccionarlo
    if (cursoParam && cursosData.length > 0) {
      setCursoSeleccionado(cursoParam);
    }
  }, [cursoParam, cursosData]);

  useEffect(() => {
    // Cuando cambia el curso seleccionado, cargar su email
    if (cursoSeleccionado !== 'todos') {
      const cursoActual = cursosData.find(c => c.id === cursoSeleccionado);
      if (cursoActual?.emailReporte) {
        setEmailDestino(cursoActual.emailReporte);
      }
    }
  }, [cursoSeleccionado, cursosData]);

  const cargarCursos = async () => {
    try {
      const data = await apiClient.listarCursos();
      setCursosData(data);
    } catch (error) {
      console.error('Error al cargar cursos:', error);
    }
  };

  const cargarDatos = async () => {
    try {
      // Intentar cargar desde backend primero
      const inscripcionesBackend = await apiClient.listarTodasInscripciones();
      setInscripciones(inscripcionesBackend);
      
      // Obtener cursos únicos
      const cursosUnicos = [...new Set(inscripcionesBackend.map((i: any) => i.cursoId))];
      setCursos(cursosUnicos);
      
      console.log(`✅ ${inscripcionesBackend.length} inscripciones cargadas desde servidor`);
    } catch (error) {
      console.warn('⚠️ No se pudo cargar desde servidor, usando localStorage:', error);
      
      // Fallback: cargar desde localStorage
      const inscripcionesData: any[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('inscripcion_')) {
          try {
            const data = JSON.parse(localStorage.getItem(key) || '{}');
            inscripcionesData.push(data);
          } catch (error) {
            console.error('Error al parsear inscripción:', error);
          }
        }
      }

      setInscripciones(inscripcionesData);

      // Obtener cursos únicos
      const cursosUnicos = [...new Set(inscripcionesData.map(i => i.cursoId))];
      setCursos(cursosUnicos);
    }
  };

  const exportarCSV = () => {
    const inscripcionesFiltradas = cursoSeleccionado === 'todos' 
      ? inscripciones 
      : inscripciones.filter(i => i.cursoId === cursoSeleccionado);

    if (inscripcionesFiltradas.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const headers = [
      'Nombre',
      'Documento',
      'Cargo',
      'Empresa',
      'Curso ID',
      'Progreso (%)',
      'Completado',
      'Fecha Inscripción',
      'Estado'
    ];

    const rows = inscripcionesFiltradas.map(i => [
      i.nombre || '',
      i.documento || '',
      i.cargo || 'No especificado',
      i.empresa || 'No especificado',
      i.cursoId || '',
      i.progreso || 0,
      i.completado ? 'Sí' : 'No',
      i.fechaInscripcion ? new Date(i.fechaInscripcion).toLocaleDateString('es-ES') : '',
      i.activo ? 'Activo' : 'Inactivo'
    ]);

    let csvContent = '\uFEFF';
    csvContent += headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_estudiantes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('✅ Reporte exportado exitosamente');
  };

  const enviarReportePorCorreo = async () => {
    if (!emailDestino || !emailDestino.includes('@')) {
      alert('❌ Por favor ingresa un correo electrónico válido');
      return;
    }

    if (cursoSeleccionado === 'todos') {
      alert('❌ Por favor selecciona un curso específico para el reporte');
      return;
    }

    const inscripcionesCurso = inscripciones.filter(i => i.cursoId === cursoSeleccionado);
    
    // Filtrar por fecha si está seleccionada
    const inscripcionesFecha = fechaFiltro 
      ? inscripcionesCurso.filter(i => {
          const fechaInsc = i.fechaInscripcion ? new Date(i.fechaInscripcion).toISOString().split('T')[0] : null;
          return fechaInsc === fechaFiltro;
        })
      : inscripcionesCurso;

    if (inscripcionesFecha.length === 0) {
      alert('❌ No hay inscripciones para este curso en la fecha seleccionada');
      return;
    }

    setEnviandoReporte(true);

    try {
      // Preparar datos de participantes
      const participantes = inscripcionesFecha.map(insc => ({
        nombre: insc.nombre,
        documento: insc.documento,
        cargo: insc.cargo,
        empresa: insc.empresa,
        progreso: insc.progreso || 0,
        aprobado: insc.completado && insc.progreso === 100,
        reprobado: insc.progreso > 0 && insc.progreso < 100 && !insc.completado,
        fechaInscripcion: insc.fechaInscripcion
      }));

      // Obtener título del curso
      const cursoActual = cursosData.find(c => c.id === cursoSeleccionado);
      const tituloCurso = cursoActual?.titulo || `Curso ${cursoSeleccionado}`;

      const response = await fetch('/api/reportes-diarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cursoId: cursoSeleccionado,
          cursoTitulo: tituloCurso,
          fechaInicio: fechaFiltro,
          emailDestino: emailDestino,
          participantes: participantes
        })
      });

      const resultado = await response.json();

      if (resultado.success) {
        alert(`✅ Reporte enviado exitosamente a ${emailDestino}\n\nParticipantes incluidos: ${resultado.participantes}`);
        setEmailDestino('');
      } else {
        alert(`❌ Error al enviar reporte: ${resultado.error || 'Error desconocido'}`);
      }
    } catch (error: any) {
      console.error('Error:', error);
      alert(`❌ Error al enviar reporte: ${error.message}`);
    } finally {
      setEnviandoReporte(false);
    }
  };

  const inscripcionesFiltradas = cursoSeleccionado === 'todos' 
    ? inscripciones 
    : inscripciones.filter(i => i.cursoId === cursoSeleccionado);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Panel de Administración - Reportes</h1>
              <p className="text-gray-600">Visualiza y envía reportes de inscripciones y progreso</p>
              {cursoParam && cursosData.find(c => c.id === cursoParam) && (
                <div className="mt-2 inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                  <span>📊 Viendo:</span>
                  <span>{cursosData.find(c => c.id === cursoParam)?.titulo}</span>
                </div>
              )}
            </div>
            <FileSpreadsheet className="h-16 w-16 text-primary-600" />
          </div>

          {/* Estadísticas */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-primary-50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-primary-700 font-semibold mb-1">Total Inscripciones</p>
                  <p className="text-3xl font-bold text-primary-900">{inscripciones.length}</p>
                </div>
                <Users className="h-12 w-12 text-primary-600" />
              </div>
            </div>

            <div className="bg-green-50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-semibold mb-1">Cursos Completados</p>
                  <p className="text-3xl font-bold text-green-900">
                    {inscripciones.filter(i => i.completado).length}
                  </p>
                </div>
                <BookOpen className="h-12 w-12 text-green-600" />
              </div>
            </div>

            <div className="bg-orange-50 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-700 font-semibold mb-1">En Progreso</p>
                  <p className="text-3xl font-bold text-orange-900">
                    {inscripciones.filter(i => !i.completado && i.progreso > 0).length}
                  </p>
                </div>
                <BookOpen className="h-12 w-12 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Panel de Envío de Reportes por Correo */}
          <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-xl p-6 mb-6 border-2 border-primary-200">
            <div className="flex items-center gap-3 mb-4">
              <Mail className="h-6 w-6 text-primary-600" />
              <h3 className="text-xl font-bold text-gray-900">Envío Automático de Reportes</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Configura el envío automático del reporte diario por correo electrónico
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Curso *
                </label>
                <select
                  value={cursoSeleccionado}
                  onChange={(e) => setCursoSeleccionado(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="todos">Selecciona un curso</option>
                  {cursosData.map(curso => (
                    <option key={curso.id} value={curso.id}>
                      {curso.titulo}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Fecha
                </label>
                <input
                  type="date"
                  value={fechaFiltro}
                  onChange={(e) => setFechaFiltro(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Correo Destino *
                </label>
                <input
                  type="email"
                  value={emailDestino}
                  onChange={(e) => setEmailDestino(e.target.value)}
                  placeholder={cursosData.find(c => c.id === cursoSeleccionado)?.emailReporte || "ejemplo@empresa.com"}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {cursosData.find(c => c.id === cursoSeleccionado)?.emailReporte 
                    ? '✅ Email configurado en el curso' 
                    : 'Ingresa manualmente el correo'}
                </p>
              </div>
            </div>

            <button
              onClick={enviarReportePorCorreo}
              disabled={enviandoReporte || cursoSeleccionado === 'todos' || !emailDestino}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enviandoReporte ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  Enviar Reporte por Correo
                </>
              )}
            </button>
          </div>

          {/* Exportar CSV */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <label className="text-sm font-semibold text-gray-700">Ver datos del curso:</label>
              <select
                value={cursoSeleccionado}
                onChange={(e) => setCursoSeleccionado(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              >
                <option value="todos">Todos los cursos</option>
                {cursosData.map(curso => (
                  <option key={curso.id} value={curso.id}>
                    {curso.titulo}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={exportarCSV}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg"
            >
              <Download className="h-5 w-5" />
              Exportar a CSV
            </button>
          </div>

          {/* Tabla de Datos */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Documento</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Cargo</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Empresa</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Progreso</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inscripcionesFiltradas.map((insc, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{insc.nombre}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{insc.documento}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{insc.cargo || 'No especificado'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{insc.empresa || 'No especificado'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full" 
                            style={{width: `${insc.progreso}%`}}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{insc.progreso}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        insc.completado 
                          ? 'bg-green-100 text-green-700' 
                          : insc.progreso > 0 
                            ? 'bg-orange-100 text-orange-700' 
                            : 'bg-gray-100 text-gray-700'
                      }`}>
                        {insc.completado ? '✓ Aprobado' : insc.progreso > 0 ? '⏳ En Progreso' : 'Sin iniciar'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {insc.fechaInscripcion ? new Date(insc.fechaInscripcion).toLocaleDateString('es-ES') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {inscripcionesFiltradas.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No hay inscripciones registradas</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
