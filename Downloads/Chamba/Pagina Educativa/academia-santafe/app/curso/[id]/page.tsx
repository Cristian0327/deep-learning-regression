'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import apiClient from '@/lib/api-client';
import { BookOpen, Clock, User, CheckCircle, XCircle, Award, PlayCircle, MessageSquare, FileText, Video, ClipboardCheck, File, ChevronDown } from 'lucide-react';
import { generarCertificado } from '@/lib/generarCertificado';
import TranscripcionVideo from '@/components/TranscripcionVideo';
import CalificacionLadrillos from '@/components/CalificacionLadrillos';
import VisorBloques from '@/components/VisorBloques';

export default function CursoPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const esPreview = searchParams.get('preview') === 'true';
  const [curso, setCurso] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [inscrito, setInscrito] = useState(false);
  const [claveInput, setClaveInput] = useState('');
  
  // Estados para datos del usuario (sin login)
  const [mostrarModalDatos, setMostrarModalDatos] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [documentoUsuario, setDocumentoUsuario] = useState('');
  const [cargoUsuario, setCargoUsuario] = useState('');
  const [empresaUsuario, setEmpresaUsuario] = useState('');
  const [datosUsuario, setDatosUsuario] = useState<{nombre: string, documento: string, cargo?: string, empresa?: string} | null>(null);
  
  const [mostrarEvaluacion, setMostrarEvaluacion] = useState(false);
  const [evaluacionActual, setEvaluacionActual] = useState(0);
  const [respuestas, setRespuestas] = useState<any>({});
  const [evaluacionCompletada, setEvaluacionCompletada] = useState(false);
  const [calificacion, setCalificacion] = useState(0);
  const [progreso, setProgreso] = useState(0);
  
  // Estados para aleatorización de preguntas
  const [preguntasAleatorias, setPreguntasAleatorias] = useState<any[]>([]);
  const [respuestasIncorrectas, setRespuestasIncorrectas] = useState<any[]>([]);
  
  const [videoRef, setVideoRef] = useState<any>(null);
  const [miCalificacion, setMiCalificacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [mostrarModalCalificacion, setMostrarModalCalificacion] = useState(false);
  const [calificaciones, setCalificaciones] = useState<any[]>([]);
  const [videoId, setVideoId] = useState('');
  const [mostrarModalDiploma, setMostrarModalDiploma] = useState(false);
  const [leccionActiva, setLeccionActiva] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [mostrarModalPdf, setMostrarModalPdf] = useState(false);

  // Verificar si debe mostrar el diploma al cargar (si tiene 100% de progreso)
  useEffect(() => {
    if (progreso === 100 && (inscrito || esPreview)) {
      const yaVistoDiploma = sessionStorage.getItem(`diploma_visto_${params.id}`);
      if (!yaVistoDiploma) {
        setMostrarModalDiploma(true);
      }
    }
  }, [progreso, inscrito, esPreview, params.id]);

  useEffect(() => {
    cargarCurso();
    // Cargar datos del usuario desde LocalStorage
    const datosGuardados = localStorage.getItem('datosUsuarioActual');
    if (datosGuardados) {
      setDatosUsuario(JSON.parse(datosGuardados));
    }
  }, [params.id]);

  // Inicializar con la primera lección ordenada cuando se carga el curso
  useEffect(() => {
    if (curso?.bloques) {
      try {
        const bloquesData = JSON.parse(curso.bloques);
        const bloquesOrdenados = bloquesData.sort((a: any, b: any) => a.orden - b.orden);
        if (bloquesOrdenados.length > 0 && !leccionActiva) {
          setLeccionActiva(bloquesOrdenados[0].id);
          console.log('Primera lección establecida:', bloquesOrdenados[0].id, 'Orden:', bloquesOrdenados[0].orden);
        }
      } catch (error) {
        console.error('Error al parsear bloques:', error);
      }
    }
  }, [curso]);

  useEffect(() => {
    if (datosUsuario && curso) {
      verificarInscripcion();
      cargarCalificaciones();
    }
    // Si es preview desde AdminCursos, simular que está inscrito
    if (esPreview && curso) {
      setInscrito(true);
    }
  }, [datosUsuario, curso, esPreview]);

  useEffect(() => {
    if (curso?.videoUrl) {
      const extractedId = curso.videoUrl.split('v=')[1]?.split('&')[0] || '';
      setVideoId(extractedId);
    }
  }, [curso]);

  const cargarCurso = async () => {
    try {
      const cursoData = await apiClient.obtenerCurso(params.id as string);
      setCurso(cursoData);
    } catch (error) {
      console.error('Error al cargar curso:', error);
    } finally {
      setCargando(false);
    }
  };

  const verificarInscripcion = async () => {
    if (!datosUsuario?.documento) return;
    
    try {
      // Usar LocalStorage para verificar inscripción
      const inscripcionKey = `inscripcion_${datosUsuario.documento}_${params.id}`;
      const inscripcionData = localStorage.getItem(inscripcionKey);
      
      if (inscripcionData) {
        const data = JSON.parse(inscripcionData);
        setInscrito(true);
        setProgreso(data.progreso || 0);
      }
    } catch (error) {
      setInscrito(false);
    }
  };

  const verificarClaveYMostrarModal = () => {
    if (claveInput !== curso.claveInscripcion) {
      alert('❌ Clave incorrecta. Solicita la clave a tu instructor.');
      return;
    }
    
    // Clave correcta, mostrar modal para capturar datos
    setMostrarModalDatos(true);
  };

  const inscribirseCurso = async () => {
    // Validar que haya ingresado nombre y documento
    if (!nombreUsuario.trim() || !documentoUsuario.trim()) {
      alert('Por favor ingresa tu nombre completo y documento');
      return;
    }

    try {
      // Guardar datos del usuario en LocalStorage global
      const datos = { 
        nombre: nombreUsuario, 
        documento: documentoUsuario,
        cargo: cargoUsuario,
        empresa: empresaUsuario
      };
      localStorage.setItem('datosUsuarioActual', JSON.stringify(datos));
      setDatosUsuario(datos);
      
      // Datos de la inscripción
      const inscripcionData = {
        nombre: nombreUsuario,
        documento: documentoUsuario,
        cargo: cargoUsuario,
        empresa: empresaUsuario,
        cursoId: params.id,
        cursoTitulo: curso.titulo,
        progreso: 0,
        completado: false,
        activo: true,
        fechaInscripcion: new Date().toISOString()
      };
      
      // Guardar en LocalStorage (para que funcione sin conexión)
      const inscripcionKey = `inscripcion_${documentoUsuario}_${params.id}`;
      localStorage.setItem(inscripcionKey, JSON.stringify(inscripcionData));
      
      // Guardar también en backend (para que admin vea todas las inscripciones)
      try {
        await apiClient.guardarInscripcion(inscripcionData);
        console.log('✅ Inscripción guardada en servidor');
      } catch (errorBackend) {
        console.warn('⚠️ No se pudo guardar en servidor, pero funciona con localStorage:', errorBackend);
        // No bloqueamos la inscripción si falla el backend
      }
      
      setInscrito(true);
      setClaveInput('');
      setMostrarModalDatos(false);
      setNombreUsuario('');
      setDocumentoUsuario('');
      setCargoUsuario('');
      setEmpresaUsuario('');
      alert('🎉 ¡Inscripción exitosa! Ya puedes comenzar el curso.');
    } catch (error) {
      console.error('Error al inscribirse:', error);
      alert('❌ Error al inscribirse. Intenta nuevamente.');
    }
  };

  const iniciarEvaluacion = () => {
    // Aleatorizar el orden de las preguntas
    const preguntasOriginales = [...curso.evaluaciones];
    const preguntasShuffled = preguntasOriginales.sort(() => Math.random() - 0.5);
    
    // Para cada pregunta, aleatorizar el orden de las respuestas
    const preguntasConRespuestasAleatorias = preguntasShuffled.map(pregunta => {
      if (pregunta.tipo === 'multiple' && pregunta.opciones) {
        // Crear un array de opciones con sus índices originales
        const opcionesConIndice = pregunta.opciones.map((opcion: string, idx: number) => ({
          texto: opcion,
          indiceOriginal: idx
        }));
        
        // Aleatorizar las opciones
        const opcionesAleatorias = opcionesConIndice.sort(() => Math.random() - 0.5);
        
        // Encontrar el nuevo índice de la respuesta correcta
        const nuevaRespuestaCorrecta = opcionesAleatorias.findIndex(
          (op: any) => op.indiceOriginal === pregunta.respuestaCorrecta
        );
        
        return {
          ...pregunta,
          opciones: opcionesAleatorias.map((op: any) => op.texto),
          opcionesOriginales: pregunta.opciones, // guardar originales
          respuestaCorrecta: nuevaRespuestaCorrecta, // nuevo índice
          respuestaCorrectaOriginal: pregunta.respuestaCorrecta // guardar original
        };
      }
      return pregunta;
    });
    
    setPreguntasAleatorias(preguntasConRespuestasAleatorias);
    setRespuestasIncorrectas([]);
    setMostrarEvaluacion(true);
    setEvaluacionActual(0);
    setRespuestas({});
    setEvaluacionCompletada(false);
  };

  const responderPregunta = (preguntaId: string, respuesta: any) => {
    setRespuestas({
      ...respuestas,
      [preguntaId]: respuesta
    });
  };

  const siguientePregunta = () => {
    // Verificar si la respuesta actual fue incorrecta
    const preguntaActual = preguntasAleatorias[evaluacionActual];
    const respuestaUsuario = respuestas[preguntaActual.id];
    
    if (preguntaActual.tipo === 'multiple' && respuestaUsuario !== preguntaActual.respuestaCorrecta) {
      // Guardar información de respuesta incorrecta
      setRespuestasIncorrectas(prev => [...prev, {
        pregunta: preguntaActual.pregunta,
        respuestaCorrecta: preguntaActual.opciones[preguntaActual.respuestaCorrecta],
        respuestaUsuario: preguntaActual.opciones[respuestaUsuario],
        retroalimentacion: preguntaActual.retroalimentacion || 'La respuesta correcta es: ' + preguntaActual.opciones[preguntaActual.respuestaCorrecta]
      }]);
    }
    
    if (evaluacionActual < preguntasAleatorias.length - 1) {
      setEvaluacionActual(evaluacionActual + 1);
    } else {
      enviarEvaluacion();
    }
  };

  const enviarEvaluacion = async () => {
    let correctas = 0;
    const total = preguntasAleatorias.length;

    preguntasAleatorias.forEach((pregunta: any) => {
      if (pregunta.tipo === 'multiple') {
        if (respuestas[pregunta.id] === pregunta.respuestaCorrecta) {
          correctas++;
        }
      }
    });

    const notaFinal = Math.round((correctas / total) * 100);
    setCalificacion(notaFinal);
    setEvaluacionCompletada(true);

    const aprobado = notaFinal === 100;

    try {
      // Guardar evaluación en LocalStorage
      const evaluacionKey = `evaluacion_${datosUsuario?.documento}_${params.id}`;
      const evaluacionData = {
        nombre: datosUsuario?.nombre,
        documento: datosUsuario?.documento,
        cursoId: params.id,
        evaluacionId: 'evaluacion_final',
        respuestas: respuestas,
        calificacion: notaFinal,
        aprobado: aprobado,
        fecha: new Date().toISOString()
      };
      localStorage.setItem(evaluacionKey, JSON.stringify(evaluacionData));

      if (aprobado) {
        // Actualizar progreso a 100% en LocalStorage
        const inscripcionKey = `inscripcion_${datosUsuario?.documento}_${params.id}`;
        const inscripcionData = JSON.parse(localStorage.getItem(inscripcionKey) || '{}');
        inscripcionData.progreso = 100;
        inscripcionData.completado = true;
        inscripcionData.fechaCompletado = new Date().toISOString();
        localStorage.setItem(inscripcionKey, JSON.stringify(inscripcionData));
        setProgreso(100);
        
        // Mostrar modal de calificación después de aprobar
        setTimeout(() => setMostrarModalCalificacion(true), 1500);
      }
    } catch (error) {
      console.error('Error al guardar evaluación:', error);
    }
  };

  const enviarCalificacion = async () => {
    if (miCalificacion === 0) {
      alert('Por favor selecciona una calificación');
      return;
    }

    try {
      // Guardar calificación en LocalStorage
      const calificacionKey = `calificacion_${datosUsuario?.documento}_${params.id}`;
      const calificacionData = {
        nombre: datosUsuario?.nombre,
        documento: datosUsuario?.documento,
        cursoId: params.id,
        calificacion: miCalificacion,
        comentario: comentario,
        fecha: new Date().toISOString()
      };
      localStorage.setItem(calificacionKey, JSON.stringify(calificacionData));

      setMostrarModalCalificacion(false);
      alert('¡Gracias por tu calificación!');
      cargarCalificaciones();
    } catch (error) {
      console.error('Error al guardar calificación:', error);
      alert('Error al enviar la calificación');
    }
  };

  const cargarCalificaciones = async () => {
    try {
      // Cargar calificaciones desde LocalStorage
      const calificacionesLocal: any[] = [];
      
      // Buscar todas las calificaciones para este curso
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('calificacion_') && key.endsWith(`_${params.id}`)) {
          const data = localStorage.getItem(key);
          if (data) {
            calificacionesLocal.push(JSON.parse(data));
          }
        }
      }
      
      setCalificaciones(calificacionesLocal);

      // Verificar si el usuario ya calificó
      const miCal = calificacionesLocal.find(c => c.documento === datosUsuario?.documento);
      if (miCal) {
        setMiCalificacion(miCal.calificacion);
        setComentario(miCal.comentario || '');
      }
    } catch (error) {
      console.error('Error al cargar calificaciones:', error);
    }
  };

  const descargarCertificado = async () => {
    try {
      console.log('Generando certificado...');
      const pdfBlob = await generarCertificado(
        datosUsuario?.nombre || 'Estudiante',
        curso.titulo,
        curso.instructor,
        new Date().toISOString(),
        curso.certificadoTemplate || undefined,
        datosUsuario?.documento
      );
      
      // Crear URL del blob para descarga directa
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificado-${curso.titulo.replace(/\s+/g, '-')}-${datosUsuario?.documento}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('Certificado descargado exitosamente');
    } catch (error) {
      console.error('Error al generar certificado:', error);
      alert('Error al descargar el certificado. Por favor intenta nuevamente.');
    }
  };

  const handleVideoSeek = (time: number) => {
    // Enviar mensaje al iframe de YouTube para saltar al tiempo especificado
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'seekTo',
          args: [time, true]
        }),
        '*'
      );
    }
  };

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando curso...</p>
        </div>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Curso no encontrado</p>
        </div>
      </div>
    );
  }

  // Si no está inscrito Y NO es preview, mostrar formulario de inscripción
  if (!inscrito && !esPreview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{curso.titulo}</h1>
            <p className="text-gray-600 mb-6">{curso.descripcion}</p>
            
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary-600" />
                <span><strong>Instructor:</strong> {curso.instructor}</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary-600" />
                <span><strong>Duración:</strong> {curso.duracion}</span>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-xl font-bold mb-4">Inscríbete al Curso</h3>
              <p className="text-gray-600 mb-4">
                Para acceder a este curso, necesitas la clave de inscripción proporcionada por el instructor.
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={claveInput}
                  onChange={(e) => setClaveInput(e.target.value)}
                  placeholder="Ingresa la clave de inscripción"
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
                <button
                  onClick={verificarClaveYMostrarModal}
                  className="bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de captura de datos del usuario */}
        {mostrarModalDatos && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Completa tu registro</h2>
              <p className="text-gray-600 mb-6">
                Necesitamos algunos datos para generar tu certificado al finalizar el curso.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={nombreUsuario}
                    onChange={(e) => setNombreUsuario(e.target.value)}
                    placeholder="Ej: Juan Pérez García"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Número de Documento *
                  </label>
                  <input
                    type="text"
                    value={documentoUsuario}
                    onChange={(e) => setDocumentoUsuario(e.target.value)}
                    placeholder="Ej: 1234567890"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Cargo *
                  </label>
                  <input
                    type="text"
                    value={cargoUsuario}
                    onChange={(e) => setCargoUsuario(e.target.value)}
                    placeholder="Ej: Gerente de Operaciones"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nombre de la Empresa *
                  </label>
                  <input
                    type="text"
                    value={empresaUsuario}
                    onChange={(e) => setEmpresaUsuario(e.target.value)}
                    placeholder="Ej: Ladrillera Santafé"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  />
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => {
                    setMostrarModalDatos(false);
                    setNombreUsuario('');
                    setDocumentoUsuario('');
                    setCargoUsuario('');
                    setEmpresaUsuario('');
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={inscribirseCurso}
                  className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg"
                >
                  Inscribirme
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header del Curso */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{curso.titulo}</h1>
          <p className="text-gray-600 mb-6">{curso.descripcion}</p>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-primary-600" />
              <span><strong>Instructor:</strong> {curso.instructor}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-primary-600" />
              <span><strong>Duración:</strong> {curso.duracion}</span>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary-600" />
              <span><strong>Nivel:</strong> {curso.nivel}</span>
            </div>
          </div>

          {/* Barra de Progreso */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">Progreso del Curso</span>
              <span className="text-sm font-bold text-primary-600">{progreso}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progreso}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Layout con Sidebar */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Sidebar Izquierdo - Todo en un solo contenedor */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              {/* Calificación del Curso */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Calificación del Curso</h3>
                
                {curso.total_calificaciones > 0 ? (
                  <div className="mb-4">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <span className="text-4xl font-bold text-primary-600">
                        {curso.calificacion_promedio}
                      </span>
                      <div>
                        <CalificacionLadrillos 
                          calificacion={Math.round(curso.calificacion_promedio)} 
                          soloLectura 
                          tamaño="md"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          {curso.total_calificaciones} {curso.total_calificaciones === 1 ? 'calificación' : 'calificaciones'}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Aún no hay calificaciones</p>
                )}

                {progreso === 100 && (
                  <button
                    onClick={() => setMostrarModalCalificacion(true)}
                    className="w-full bg-orange-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="h-5 w-5" />
                    {miCalificacion > 0 ? 'Editar mi calificación' : 'Calificar curso'}
                  </button>
                )}

                {/* Lista de comentarios */}
                {calificaciones.length > 0 && (
                  <div className="mt-6 space-y-3 max-h-60 overflow-y-auto">
                    <h4 className="font-semibold text-gray-900">Comentarios</h4>
                    {calificaciones.map((cal) => (
                      <div key={cal.id} className="border-t pt-3">
                        <div className="flex items-start gap-2 mb-2">
                          <CalificacionLadrillos 
                            calificacion={cal.calificacion} 
                            soloLectura 
                            tamaño="sm"
                          />
                        </div>
                        {cal.comentario && (
                          <p className="text-sm text-gray-600 italic">"{cal.comentario}"</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(cal.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contenido del Curso - Desplegable */}
              {curso.contenido && (
                <div className="mb-6">
                  <button
                    onClick={() => {
                      const elem = document.getElementById('contenido-curso');
                      if (elem) {
                        elem.classList.toggle('hidden');
                        const icon = document.getElementById('contenido-icon');
                        if (icon) icon.classList.toggle('rotate-180');
                      }
                    }}
                    className="w-full flex items-center justify-between text-left py-3 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <h3 className="text-lg font-bold text-gray-900">Contenido del Curso</h3>
                    <ChevronDown id="contenido-icon" className="h-5 w-5 text-gray-600 transition-transform" />
                  </button>
                  <div id="contenido-curso" className="hidden space-y-2 mt-2">
                    {curso.contenido.split('\n').filter((item: string) => item.trim()).map((item: string, index: number) => (
                      <div key={index} className="flex items-start gap-3 py-2">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lecciones del Curso */}
              {curso.bloques && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-4">LECCIONES</h3>
                  <div className="space-y-2">
                    {JSON.parse(curso.bloques).sort((a: any, b: any) => a.orden - b.orden).map((bloque: any, index: number) => (
                      <button
                        key={bloque.id}
                        onClick={() => {
                          setLeccionActiva(bloque.id);
                        }}
                        className={`w-full text-left px-3 py-3 rounded-lg transition-all ${
                          leccionActiva === bloque.id ? 'bg-primary-600 text-white shadow-md' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {bloque.tipo === 'lectura' && (
                            <span className={`p-2 rounded ${leccionActiva === bloque.id ? 'bg-white/20' : 'bg-blue-500'} text-white`}>
                              <FileText className="h-4 w-4" />
                            </span>
                          )}
                          {bloque.tipo === 'video' && (
                            <span className={`p-2 rounded ${leccionActiva === bloque.id ? 'bg-white/20' : 'bg-red-500'} text-white`}>
                              <Video className="h-4 w-4" />
                            </span>
                          )}
                          {bloque.tipo === 'evaluacion' && (
                            <span className={`p-2 rounded ${leccionActiva === bloque.id ? 'bg-white/20' : 'bg-green-500'} text-white`}>
                              <ClipboardCheck className="h-4 w-4" />
                            </span>
                          )}
                          {bloque.tipo === 'documento' && (
                            <span className={`p-2 rounded ${leccionActiva === bloque.id ? 'bg-white/20' : 'bg-purple-500'} text-white`}>
                              <File className="h-4 w-4" />
                            </span>
                          )}
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${leccionActiva === bloque.id ? 'text-white' : 'text-gray-900'}`}>{bloque.titulo}</p>
                            {bloque.duracion && (
                              <p className={`text-xs ${leccionActiva === bloque.id ? 'text-white/80' : 'text-gray-500'}`}>{bloque.duracion} min</p>
                            )}
                          </div>
                          {/* Indicador de completado se mostrará desde VisorBloques */}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contenido Principal - Solo contenido de lecciones */}
          {curso.bloques && (() => {
            const bloquesData = JSON.parse(curso.bloques);
            const bloquesOrdenados = bloquesData.sort((a: any, b: any) => a.orden - b.orden);
            console.log('Bloques originales:', bloquesData.map((b: any) => ({ id: b.id, titulo: b.titulo, orden: b.orden })));
            console.log('Bloques ordenados:', bloquesOrdenados.map((b: any) => ({ id: b.id, titulo: b.titulo, orden: b.orden })));
            return (
            <div className="lg:col-span-4">
              <VisorBloques 
                bloques={bloquesOrdenados}
                leccionActiva={leccionActiva}
                onLeccionChange={setLeccionActiva}
                onProgresoActualizado={(nuevoProgreso) => {
                  setProgreso(nuevoProgreso);
                  // Actualizar progreso en LocalStorage si el usuario está inscrito
                  if (datosUsuario?.documento && inscrito && !esPreview) {
                    const inscripcionKey = `inscripcion_${datosUsuario.documento}_${params.id}`;
                    const inscripcionData = JSON.parse(localStorage.getItem(inscripcionKey) || '{}');
                    inscripcionData.progreso = nuevoProgreso;
                    inscripcionData.completado = nuevoProgreso === 100;
                    if (nuevoProgreso === 100) {
                      inscripcionData.fechaCompletado = new Date().toISOString();
                    }
                    localStorage.setItem(inscripcionKey, JSON.stringify(inscripcionData));
                    
                    if (nuevoProgreso === 100) {
                      // Mostrar modal de diploma
                      setTimeout(() => {
                        setMostrarModalDiploma(true);
                      }, 500);
                    }
                  } else if (esPreview && nuevoProgreso === 100) {
                    // En modo preview también mostrar el diploma
                    setTimeout(() => {
                      setMostrarModalDiploma(true);
                    }, 500);
                  }
                }}
              />
            </div>
            );
          })()}
        </div>

        {/* Evaluación Antigua (si existe y no hay bloques) */}
        {!curso.bloques && curso.evaluaciones && curso.evaluaciones.length > 0 && (
          <div className="mt-8">
            {curso.evaluaciones && curso.evaluaciones.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Evaluación del Curso</h2>
                
                {!mostrarEvaluacion ? (
                  <div className="text-center py-8">
                    <Award className="h-16 w-16 text-primary-600 mx-auto mb-4" />
                    <p className="text-gray-600 mb-6">
                      Completa la evaluación para obtener tu certificado
                    </p>
                    <button
                      onClick={iniciarEvaluacion}
                      className="bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all inline-flex items-center gap-2"
                    >
                      <PlayCircle className="h-5 w-5" />
                      Iniciar Evaluación
                    </button>
                  </div>
                ) : evaluacionCompletada ? (
                  <div className="text-center py-8">
                    {calificacion === 100 ? (
                      <>
                        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-green-700 mb-2">¡Felicitaciones!</h3>
                        <p className="text-gray-600 mb-4">
                          Has aprobado el curso con una calificación de <strong>{calificacion}%</strong>
                        </p>
                        <button
                          onClick={descargarCertificado}
                          className="bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all"
                        >
                          Descargar Certificado
                        </button>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-20 w-20 text-red-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-red-700 mb-2">Intenta de Nuevo</h3>
                        <p className="text-gray-600 mb-4">
                          Obtuviste <strong>{calificacion}%</strong>. Necesitas 100% para aprobar y obtener tu certificado.
                        </p>
                        
                        {/* Mostrar retroalimentación de respuestas incorrectas */}
                        {respuestasIncorrectas.length > 0 && (
                          <div className="mb-6 text-left bg-red-50 rounded-xl p-4 max-h-96 overflow-y-auto">
                            <h4 className="font-bold text-red-900 mb-3 text-center">📚 Revisa tus errores:</h4>
                            <div className="space-y-3">
                              {respuestasIncorrectas.map((item, idx) => (
                                <div key={idx} className="bg-white rounded-lg p-3 border-l-4 border-red-500">
                                  <p className="font-semibold text-gray-900 mb-2">{item.pregunta}</p>
                                  <p className="text-sm text-red-700 mb-1">
                                    <strong>Tu respuesta:</strong> {item.respuestaUsuario}
                                  </p>
                                  <p className="text-sm text-green-700 mb-2">
                                    <strong>Respuesta correcta:</strong> {item.respuestaCorrecta}
                                  </p>
                                  <p className="text-xs text-gray-700 bg-yellow-50 p-2 rounded">
                                    <strong>💡 Explicación:</strong> {item.retroalimentacion}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <button
                          onClick={iniciarEvaluacion}
                          className="bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all"
                        >
                          🔄 Reintentar (Preguntas Aleatorias)
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-700">
                          Pregunta {evaluacionActual + 1} de {preguntasAleatorias.length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full transition-all"
                          style={{ width: `${((evaluacionActual + 1) / preguntasAleatorias.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {preguntasAleatorias[evaluacionActual] && (
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                          {preguntasAleatorias[evaluacionActual].pregunta}
                        </h3>

                        {preguntasAleatorias[evaluacionActual].tipo === 'multiple' ? (
                          <div className="space-y-3">
                            {preguntasAleatorias[evaluacionActual].opciones.filter((op: string) => op.trim()).map((opcion: string, index: number) => {
                              const preguntaId = preguntasAleatorias[evaluacionActual].id;
                              const respuestaSeleccionada = respuestas[preguntaId] === index;
                              const yaRespondio = respuestas[preguntaId] !== undefined;
                              const esRespuestaCorrecta = index === preguntasAleatorias[evaluacionActual].respuestaCorrecta;
                              const mostrarFeedback = yaRespondio && !esRespuestaCorrecta && respuestaSeleccionada;
                              
                              return (
                                <div key={index}>
                                  <button
                                    onClick={() => responderPregunta(preguntaId, index)}
                                    className={`w-full text-left px-6 py-4 rounded-xl border-2 transition-all ${
                                      respuestaSeleccionada
                                        ? 'border-primary-600 bg-primary-50'
                                        : 'border-gray-200 hover:border-primary-300'
                                    }`}
                                  >
                                    <div className="flex items-center gap-4">
                                      <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold">
                                        {String.fromCharCode(65 + index)}
                                      </span>
                                      <span>{opcion}</span>
                                    </div>
                                  </button>
                                  
                                  {/* Mostrar retroalimentación inmediata si seleccionó opción incorrecta */}
                                  {mostrarFeedback && preguntasAleatorias[evaluacionActual].retroalimentacion && (
                                    <div className="mt-2 ml-12 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                                      <p className="text-red-800 font-semibold text-sm mb-1">❌ Respuesta incorrecta</p>
                                      <p className="text-red-700 text-sm mb-2">
                                        {preguntasAleatorias[evaluacionActual].retroalimentacion}
                                      </p>
                                      <p className="text-green-700 text-sm">
                                        <strong>💡 Respuesta correcta:</strong> {preguntasAleatorias[evaluacionActual].opciones[preguntasAleatorias[evaluacionActual].respuestaCorrecta]}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <textarea
                            value={respuestas[preguntasAleatorias[evaluacionActual].id] || ''}
                            onChange={(e) => responderPregunta(preguntasAleatorias[evaluacionActual].id, e.target.value)}
                            rows={6}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                            placeholder="Escribe tu respuesta aquí..."
                          />
                        )}

                        <button
                          onClick={siguientePregunta}
                          disabled={!respuestas[preguntasAleatorias[evaluacionActual].id]}
                          className="mt-6 w-full bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {evaluacionActual < preguntasAleatorias.length - 1 ? 'Siguiente' : 'Finalizar'}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Diploma al Completar 100% */}
      {mostrarModalDiploma && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-10 relative border-2 border-gray-200">
            {/* Botón cerrar */}
            <button
              onClick={() => {
                setMostrarModalDiploma(false);
                sessionStorage.setItem(`diploma_visto_${params.id}`, 'true');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>

            {/* Contenido */}
            <div className="text-center">
              {/* Icono de celebración */}
              <div className="mb-6">
                <Award className="h-24 w-24 text-orange-500 mx-auto animate-bounce" />
              </div>

              {/* Título */}
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                ¡Felicitaciones!
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Has completado exitosamente el curso
              </p>

              {/* Vista previa del diploma */}
              <div className="bg-white border-8 border-double border-blue-700 rounded-2xl p-8 mb-8 shadow-xl">
                <div className="border-4 border-orange-500 rounded-xl p-6">
                  <h3 className="text-2xl font-serif text-gray-800 mb-4">
                    Certificado de Finalización
                  </h3>
                  <p className="text-gray-600 mb-2">Se otorga a</p>
                  <h4 className="text-3xl font-bold text-primary-600 mb-4">
                    {datosUsuario?.nombre || 'Estudiante'}
                  </h4>
                  <p className="text-gray-600 mb-2">Por completar exitosamente el curso</p>
                  <h5 className="text-xl font-semibold text-gray-800 mb-4">
                    {curso.titulo}
                  </h5>
                  <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-300">
                    <div>
                      <p className="text-sm text-gray-500">Instructor</p>
                      <p className="font-semibold text-gray-800">{curso.instructor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Fecha</p>
                      <p className="font-semibold text-gray-800">
                        {new Date().toLocaleDateString('es-ES', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setMostrarModalDiploma(false);
                    sessionStorage.setItem(`diploma_visto_${params.id}`, 'true');
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-4 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  Cerrar
                </button>
                <button
                  onClick={async () => {
                    await descargarCertificado();
                    setMostrarModalDiploma(false);
                    sessionStorage.setItem(`diploma_visto_${params.id}`, 'true');
                  }}
                  className="flex-1 bg-orange-500 text-white px-6 py-4 rounded-xl font-semibold hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Award className="h-5 w-5" />
                  Descargar Diploma
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Calificación */}
      {mostrarModalCalificacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
              ¿Cómo calificas este curso?
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Tu opinión nos ayuda a mejorar la calidad de nuestros cursos
            </p>

            <div className="flex justify-center mb-6">
              <CalificacionLadrillos 
                calificacion={miCalificacion}
                onCalificar={setMiCalificacion}
                tamaño="lg"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Comentario (opcional)
              </label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                placeholder="Cuéntanos tu experiencia con este curso..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setMostrarModalCalificacion(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={enviarCalificacion}
                className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all"
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de PDF Certificado */}
      {mostrarModalPdf && pdfUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Award className="h-8 w-8 text-orange-500" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Tu Certificado</h3>
                  <p className="text-sm text-gray-600">{curso.titulo}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMostrarModalPdf(false);
                  if (pdfUrl) {
                    URL.revokeObjectURL(pdfUrl);
                    setPdfUrl(null);
                  }
                }}
                className="text-gray-400 hover:text-gray-600 text-3xl font-bold"
              >
                ×
              </button>
            </div>

            {/* PDF Viewer */}
            <div className="flex-1 overflow-hidden">
              <iframe
                src={pdfUrl}
                className="w-full h-full border-0"
                title="Certificado"
              />
            </div>

            {/* Footer con botones */}
            <div className="p-6 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = pdfUrl;
                  link.download = `Certificado_${curso.titulo.replace(/\s+/g, '_')}.pdf`;
                  link.click();
                }}
                className="flex-1 bg-orange-500 text-white px-6 py-4 rounded-xl font-semibold hover:bg-orange-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Award className="h-5 w-5" />
                Descargar PDF
              </button>
              <button
                onClick={() => {
                  setMostrarModalPdf(false);
                  if (pdfUrl) {
                    URL.revokeObjectURL(pdfUrl);
                    setPdfUrl(null);
                  }
                }}
                className="px-8 py-4 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
