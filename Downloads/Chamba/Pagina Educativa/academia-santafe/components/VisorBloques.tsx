'use client';

import { useState, useEffect, useMemo } from 'react';
import { FileText, Video, ClipboardCheck, File, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface PreguntaQuiz {
  id: string;
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number | number[];
  multipleRespuestas?: boolean;
  retroalimentacionPositiva?: string;
  retroalimentacionNegativa?: string;
  tipo: 'multiple' | 'abierta';
}

interface BloqueContenido {
  id: string;
  tipo: 'lectura' | 'video' | 'evaluacion' | 'documento';
  orden: number;
  titulo: string;
  contenido?: string;
  videoUrl?: string;
  duracion?: number;
  preguntas?: PreguntaQuiz[];
  descripcion?: string;
  puntajeMinimo?: number;
}

interface VisorBloquesProps {
  bloques: BloqueContenido[];
  leccionActiva?: string | null;
  onLeccionChange?: (leccionId: string) => void;
  onProgresoActualizado?: (progreso: number) => void;
}

// Función para aleatorizar arrays
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function VisorBloques({ bloques, leccionActiva, onLeccionChange, onProgresoActualizado }: VisorBloquesProps) {
  const bloquesOrdenados = [...bloques].sort((a, b) => a.orden - b.orden);
  const [bloqueActivo, setBloqueActivo] = useState<string | null>(leccionActiva || bloquesOrdenados[0]?.id || null);

  // Sincronizar con la lección activa del padre
  useEffect(() => {
    if (leccionActiva) {
      setBloqueActivo(leccionActiva);
    } else if (bloquesOrdenados.length > 0 && onLeccionChange) {
      // Si no hay lección activa, establecer la primera ordenada
      const primeraLeccion = bloquesOrdenados[0].id;
      setBloqueActivo(primeraLeccion);
      onLeccionChange(primeraLeccion);
    }
  }, [leccionActiva, bloquesOrdenados, onLeccionChange]);
  const [respuestas, setRespuestas] = useState<{ [key: string]: any }>({});
  const [resultados, setResultados] = useState<{ [key: string]: boolean }>({});
  const [bloquesCompletados, setBloquesCompletados] = useState<Set<string>>(new Set());
  const [preguntasAleatorias, setPreguntasAleatorias] = useState<{ [key: string]: PreguntaQuiz[] }>({});
  const [evaluacionesAprobadas, setEvaluacionesAprobadas] = useState<Set<string>>(new Set());
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [mensajeAlerta, setMensajeAlerta] = useState('');
  const [evaluacionIniciada, setEvaluacionIniciada] = useState<{ [key: string]: boolean }>({});
  const [tiempoRestante, setTiempoRestante] = useState<{ [key: string]: number }>({});

  // Aleatorizar preguntas cuando se carga una evaluación por primera vez
  useEffect(() => {
    bloques.forEach(bloque => {
      if (bloque.tipo === 'evaluacion' && bloque.preguntas && !preguntasAleatorias[bloque.id]) {
        // Aleatorizar preguntas
        const preguntasShuffled = shuffleArray(bloque.preguntas).map(pregunta => {
          if (pregunta.tipo === 'multiple') {
            // Crear mapeo de índices para mantener la respuesta correcta
            const opcionesConIndice = pregunta.opciones.map((opcion, idx) => ({ opcion, idx }));
            const opcionesShuffled = shuffleArray(opcionesConIndice);
            
            // Encontrar los nuevos índices de las respuestas correctas
            let nuevaRespuestaCorrecta: number | number[];
            if (Array.isArray(pregunta.respuestaCorrecta)) {
              // Múltiples respuestas correctas
              nuevaRespuestaCorrecta = pregunta.respuestaCorrecta.map(idxCorrecta => 
                opcionesShuffled.findIndex(item => item.idx === idxCorrecta)
              );
            } else {
              // Una sola respuesta correcta
              nuevaRespuestaCorrecta = opcionesShuffled.findIndex(
                item => item.idx === pregunta.respuestaCorrecta
              );
            }
            
            return {
              ...pregunta,
              opciones: opcionesShuffled.map(item => item.opcion),
              respuestaCorrecta: nuevaRespuestaCorrecta
            };
          }
          return pregunta;
        });
        
        setPreguntasAleatorias(prev => ({
          ...prev,
          [bloque.id]: preguntasShuffled
        }));
      }
    });
  }, [bloques]);

  // Actualizar progreso cuando cambian los bloques completados
  useEffect(() => {
    if (onProgresoActualizado && bloques.length > 0) {
      const progreso = Math.round((bloquesCompletados.size / bloques.length) * 100);
      onProgresoActualizado(progreso);
    }
  }, [bloquesCompletados, bloques.length, onProgresoActualizado]);

  // Temporizador para evaluaciones con duración
  useEffect(() => {
    const intervalos: { [key: string]: NodeJS.Timeout } = {};

    Object.keys(evaluacionIniciada).forEach(bloqueId => {
      if (evaluacionIniciada[bloqueId] && tiempoRestante[bloqueId] > 0) {
        intervalos[bloqueId] = setInterval(() => {
          setTiempoRestante(prev => {
            const nuevoTiempo = (prev[bloqueId] || 0) - 1;
            if (nuevoTiempo <= 0) {
              // Tiempo agotado, enviar evaluación automáticamente
              const bloque = bloques.find(b => b.id === bloqueId);
              if (bloque) {
                enviarEvaluacion(bloque);
              }
              return { ...prev, [bloqueId]: 0 };
            }
            return { ...prev, [bloqueId]: nuevoTiempo };
          });
        }, 1000);
      }
    });

    return () => {
      Object.values(intervalos).forEach(intervalo => clearInterval(intervalo));
    };
  }, [evaluacionIniciada, tiempoRestante]);

  const iniciarEvaluacion = (bloque: BloqueContenido) => {
    setEvaluacionIniciada(prev => ({ ...prev, [bloque.id]: true }));
    if (bloque.duracion) {
      setTiempoRestante(prev => ({ ...prev, [bloque.id]: bloque.duracion! * 60 }));
    }
  };

  const formatearTiempo = (segundos: number): string => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs.toString().padStart(2, '0')}`;
  };

  const enviarEvaluacion = (bloque: BloqueContenido) => {
    const preguntasParaMostrar = preguntasAleatorias[bloque.id] || bloque.preguntas || [];
    const nuevosResultados = { ...resultados };
    
    preguntasParaMostrar.forEach(pregunta => {
      const respuestaKey = `${bloque.id}-${pregunta.id}`;
      const respuestaUsuario = respuestas[respuestaKey];
      
      if (respuestaUsuario !== undefined) {
        if (pregunta.tipo === 'multiple') {
          if (Array.isArray(pregunta.respuestaCorrecta)) {
            if (Array.isArray(respuestaUsuario)) {
              const correctas = pregunta.respuestaCorrecta as number[];
              nuevosResultados[respuestaKey] = respuestaUsuario.length === correctas.length &&
                                              respuestaUsuario.every((r: number) => correctas.includes(r));
            } else {
              nuevosResultados[respuestaKey] = false;
            }
          } else {
            nuevosResultados[respuestaKey] = respuestaUsuario === pregunta.respuestaCorrecta;
          }
        }
      }
    });

    setResultados(nuevosResultados);

    // Calcular si aprobó
    const puntajeMinimoRequerido = bloque.puntajeMinimo || 100;
    const totalPreguntas = preguntasParaMostrar.length;
    const correctas = Object.keys(nuevosResultados)
      .filter(k => k.startsWith(bloque.id) && nuevosResultados[k])
      .length;
    const porcentaje = Math.round((correctas / totalPreguntas) * 100);

    if (porcentaje >= puntajeMinimoRequerido) {
      setEvaluacionesAprobadas(prev => new Set(prev).add(bloque.id));
    }

    // Detener temporizador
    setEvaluacionIniciada(prev => ({ ...prev, [bloque.id]: false }));
  };

  if (!bloques || bloques.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
        <File className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Este curso aún no tiene lecciones</h3>
        <p className="text-gray-500">El instructor está preparando el contenido</p>
      </div>
    );
  }

  const obtenerIcono = (tipo: string) => {
    switch (tipo) {
      case 'lectura':
        return <FileText className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'evaluacion':
        return <ClipboardCheck className="h-5 w-5" />;
      case 'documento':
        return <File className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const obtenerColor = (tipo: string) => {
    switch (tipo) {
      case 'lectura':
        return 'bg-blue-500';
      case 'video':
        return 'bg-red-500';
      case 'evaluacion':
        return 'bg-green-500';
      case 'documento':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const verificarRespuesta = (bloqueId: string, preguntaId: string, respuestaCorrecta: number | number[]) => {
    const respuestaUsuario = respuestas[`${bloqueId}-${preguntaId}`];
    let correcto = false;
    
    if (Array.isArray(respuestaCorrecta)) {
      // Múltiples respuestas correctas
      if (Array.isArray(respuestaUsuario)) {
        // Verificar que todas las respuestas del usuario estén en las correctas
        // y que no falte ninguna respuesta correcta
        correcto = respuestaUsuario.length === respuestaCorrecta.length &&
                   respuestaUsuario.every((r: number) => respuestaCorrecta.includes(r));
      }
    } else {
      // Una sola respuesta correcta
      correcto = respuestaUsuario === respuestaCorrecta;
    }
    
    setResultados({
      ...resultados,
      [`${bloqueId}-${preguntaId}`]: correcto
    });
  };

  const bloqueSeleccionado = bloquesOrdenados.find(b => b.id === bloqueActivo);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl p-8">
          {bloqueSeleccionado && (
            <div>
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`p-2 rounded ${obtenerColor(bloqueSeleccionado.tipo)} text-white`}>
                    {obtenerIcono(bloqueSeleccionado.tipo)}
                  </span>
                  <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    {bloqueSeleccionado.tipo}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{bloqueSeleccionado.titulo}</h2>
              </div>

              {/* Contenido según tipo */}
              {bloqueSeleccionado.tipo === 'lectura' && (
                <div className="prose prose-lg max-w-none bg-gray-50 rounded-xl p-8 shadow-inner" style={{ minHeight: '500px' }}>
                  <ReactMarkdown
                    components={{
                      a: ({node, href, children, ...props}) => {
                        // Detectar si es un link a PDF
                        if (href && href.toLowerCase().endsWith('.pdf')) {
                          return (
                            <div className="not-prose my-6">
                              <div className="bg-white border-2 border-gray-300 rounded-xl overflow-hidden shadow-lg">
                                <div className="bg-gray-100 px-4 py-3 border-b border-gray-300 flex items-center justify-between">
                                  <span className="font-semibold text-gray-700 flex items-center gap-2">
                                    <File className="h-5 w-5" />
                                    Documento PDF
                                  </span>
                                  <a 
                                    href={href} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
                                  >
                                    Abrir en nueva pestaña →
                                  </a>
                                </div>
                                <iframe
                                  src={href}
                                  className="w-full"
                                  style={{ height: '600px' }}
                                  title="Visor de PDF"
                                />
                              </div>
                            </div>
                          );
                        }
                        return <a href={href} {...props}>{children}</a>;
                      },
                      img: ({node, src, alt, ...props}) => {
                        return (
                          <img 
                            src={src} 
                            alt={alt || 'Imagen'} 
                            className="rounded-lg shadow-md max-w-full h-auto my-4"
                            {...props}
                          />
                        );
                      }
                    }}
                  >
                    {bloqueSeleccionado.contenido || ''}
                  </ReactMarkdown>
                </div>
              )}

              {bloqueSeleccionado.tipo === 'video' && bloqueSeleccionado.videoUrl && (() => {
                // Extraer ID de YouTube de diferentes formatos de URL
                let videoId = '';
                const url = bloqueSeleccionado.videoUrl;
                if (url.includes('youtu.be/')) {
                  videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
                } else if (url.includes('v=')) {
                  videoId = url.split('v=')[1]?.split('&')[0] || '';
                } else if (url.includes('embed/')) {
                  videoId = url.split('embed/')[1]?.split('?')[0] || '';
                }
                return (
                <div className="space-y-4">
                  <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-2xl" style={{ minHeight: '500px' }}>
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    ></iframe>
                  </div>
                  {bloqueSeleccionado.contenido && (
                    <div className="prose max-w-none bg-gray-50 p-4 rounded-lg">
                      <ReactMarkdown>{bloqueSeleccionado.contenido}</ReactMarkdown>
                    </div>
                  )}
                </div>
                );
              })()}

              {bloqueSeleccionado.tipo === 'evaluacion' && bloqueSeleccionado.preguntas && (() => {
                const preguntasParaMostrar = preguntasAleatorias[bloqueSeleccionado.id] || bloqueSeleccionado.preguntas;
                const evaluacionEnCurso = evaluacionIniciada[bloqueSeleccionado.id];
                const tieneTemporizado = bloqueSeleccionado.duracion && bloqueSeleccionado.duracion > 0;
                
                return (
                <div className="space-y-6">
                  {/* Descripción de la Evaluación */}
                  {bloqueSeleccionado.descripcion && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                      <p className="text-blue-800 whitespace-pre-wrap">{bloqueSeleccionado.descripcion}</p>
                    </div>
                  )}

                  {/* Botón de Iniciar Evaluación (si tiene duración) */}
                  {tieneTemporizado && !evaluacionEnCurso && (
                    <div className="bg-white border-2 border-primary-500 rounded-xl p-8 text-center">
                      <ClipboardCheck className="h-16 w-16 text-primary-500 mx-auto mb-4" />
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Evaluación Cronometrada</h3>
                      <p className="text-gray-600 mb-1">Duración: {bloqueSeleccionado.duracion} minutos</p>
                      <p className="text-sm text-gray-500 mb-6">Una vez iniciada, el temporizador no se puede pausar</p>
                      <button
                        onClick={() => iniciarEvaluacion(bloqueSeleccionado)}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
                      >
                        Iniciar Evaluación
                      </button>
                    </div>
                  )}

                  {/* Temporizador */}
                  {tieneTemporizado && evaluacionEnCurso && (
                    <div className={`border-2 rounded-xl p-4 text-center ${
                      (tiempoRestante[bloqueSeleccionado.id] || 0) < 60 
                        ? 'bg-red-50 border-red-500' 
                        : 'bg-green-50 border-green-500'
                    }`}>
                      <p className={`text-sm font-semibold mb-1 ${
                        (tiempoRestante[bloqueSeleccionado.id] || 0) < 60 
                          ? 'text-red-800' 
                          : 'text-green-800'
                      }`}>
                        Tiempo Restante
                      </p>
                      <p className={`text-3xl font-bold ${
                        (tiempoRestante[bloqueSeleccionado.id] || 0) < 60 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {formatearTiempo(tiempoRestante[bloqueSeleccionado.id] || 0)}
                      </p>
                    </div>
                  )}

                  {/* Contenido de la evaluación (solo si no tiene duración o ya está iniciada) */}
                  {(!tieneTemporizado || evaluacionEnCurso) && (
                  <>

                  <div className="bg-gray-100 border border-gray-300 p-4 rounded">
                    <p className="text-gray-800 font-semibold">
                      {preguntasParaMostrar.length} {preguntasParaMostrar.length === 1 ? 'pregunta' : 'preguntas'}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      Responde todas las preguntas y envía para validar tus respuestas.
                    </p>
                  </div>

                  {preguntasParaMostrar.map((pregunta, pIndex) => (
                    <div key={pregunta.id} className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">
                        Pregunta {pIndex + 1}: {pregunta.pregunta}
                      </h3>
                      
                      {pregunta.tipo === 'multiple' ? (
                        <div className="space-y-3">
                          {pregunta.multipleRespuestas && (
                            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 mb-3 rounded">
                              <p className="text-yellow-800 text-sm font-semibold">
                                Selecciona todas las opciones correctas
                              </p>
                            </div>
                          )}
                          {pregunta.opciones.map((opcion, oIndex) => {
                            const respuestaKey = `${bloqueSeleccionado.id}-${pregunta.id}`;
                            const respuestaUsuario = respuestas[respuestaKey];
                            const estaSeleccionada = pregunta.multipleRespuestas 
                              ? Array.isArray(respuestaUsuario) && respuestaUsuario.includes(oIndex)
                              : respuestaUsuario === oIndex;
                            const tieneResultado = resultados[respuestaKey] !== undefined;
                            const esCorrecta = tieneResultado && resultados[respuestaKey];
                            
                            let esLaCorrecta = false;
                            let esIncorrecta = false;
                            
                            if (tieneResultado && !resultados[respuestaKey]) {
                              if (Array.isArray(pregunta.respuestaCorrecta)) {
                                esLaCorrecta = pregunta.respuestaCorrecta.includes(oIndex);
                                esIncorrecta = estaSeleccionada && !pregunta.respuestaCorrecta.includes(oIndex);
                              } else {
                                esLaCorrecta = oIndex === pregunta.respuestaCorrecta;
                                esIncorrecta = estaSeleccionada;
                              }
                            }
                            
                            return (
                              <button
                                key={oIndex}
                                onClick={() => {
                                  if (!tieneResultado) {
                                    if (pregunta.multipleRespuestas) {
                                      // Manejo de múltiples respuestas con checkboxes
                                      const respuestasActuales = Array.isArray(respuestaUsuario) ? [...respuestaUsuario] : [];
                                      if (respuestasActuales.includes(oIndex)) {
                                        // Quitar selección
                                        setRespuestas({
                                          ...respuestas,
                                          [respuestaKey]: respuestasActuales.filter(r => r !== oIndex)
                                        });
                                      } else {
                                        // Agregar selección
                                        setRespuestas({
                                          ...respuestas,
                                          [respuestaKey]: [...respuestasActuales, oIndex]
                                        });
                                      }
                                    } else {
                                      // Manejo de respuesta única con radio
                                      setRespuestas({
                                        ...respuestas,
                                        [respuestaKey]: oIndex
                                      });
                                    }
                                  }
                                }}
                                disabled={tieneResultado}
                                className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all ${
                                  esCorrecta
                                    ? 'border-green-500 bg-green-50'
                                    : esIncorrecta
                                    ? 'border-red-500 bg-red-50'
                                    : esLaCorrecta
                                    ? 'border-green-500 bg-green-50'
                                    : estaSeleccionada
                                    ? 'border-primary-600 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                } ${tieneResultado ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                <div className="flex items-center gap-4">
                                  <span className={`w-10 h-10 flex items-center justify-center font-bold text-sm ${
                                    pregunta.multipleRespuestas ? 'rounded-lg' : 'rounded-full'
                                  } ${
                                    esCorrecta || esLaCorrecta
                                      ? 'bg-green-500 text-white'
                                      : esIncorrecta
                                      ? 'bg-red-500 text-white'
                                      : estaSeleccionada
                                      ? 'bg-primary-600 text-white'
                                      : 'bg-gray-200 text-gray-700'
                                  }`}>
                                    {esCorrecta || esLaCorrecta ? '✓' : esIncorrecta ? '✗' : String.fromCharCode(65 + oIndex)}
                                  </span>
                                  <span className="flex-1">{opcion}</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <textarea
                          value={respuestas[`${bloqueSeleccionado.id}-${pregunta.id}`] || ''}
                          onChange={(e) => setRespuestas({
                            ...respuestas,
                            [`${bloqueSeleccionado.id}-${pregunta.id}`]: e.target.value
                          })}
                          rows={6}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                          placeholder="Escribe tu respuesta aquí..."
                        />
                      )}

                      {/* Retroalimentación después de responder */}
                      {pregunta.retroalimentacion && resultados[`${bloqueSeleccionado.id}-${pregunta.id}`] !== undefined && (
                        <div className={`mt-4 p-4 rounded-lg border-l-4 ${
                          resultados[`${bloqueSeleccionado.id}-${pregunta.id}`]
                            ? 'bg-green-50 border-green-500'
                            : 'bg-blue-50 border-blue-500'
                        }`}>
                          <p className={`text-sm font-semibold ${
                            resultados[`${bloqueSeleccionado.id}-${pregunta.id}`]
                              ? 'text-green-800'
                              : 'text-blue-800'
                          }`}>
                            {resultados[`${bloqueSeleccionado.id}-${pregunta.id}`] ? '✓ Correcto' : 'ℹ️ Retroalimentación'}
                          </p>
                          <p className={`text-sm mt-1 ${
                            resultados[`${bloqueSeleccionado.id}-${pregunta.id}`]
                              ? 'text-green-700'
                              : 'text-blue-700'
                          }`}>
                            {pregunta.retroalimentacion}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Botones de acción para toda la evaluación */}
                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    {Object.keys(resultados).filter(k => k.startsWith(bloqueSeleccionado.id)).length > 0 ? (
                      <>
                        <button
                          onClick={() => {
                            // Limpiar respuestas y resultados para reintentar
                            const nuevasRespuestas = { ...respuestas };
                            const nuevosResultados = { ...resultados };
                            const preguntasParaMostrar = preguntasAleatorias[bloqueSeleccionado.id] || bloqueSeleccionado.preguntas || [];
                            preguntasParaMostrar.forEach(p => {
                              delete nuevasRespuestas[`${bloqueSeleccionado.id}-${p.id}`];
                              delete nuevosResultados[`${bloqueSeleccionado.id}-${p.id}`];
                            });
                            setRespuestas(nuevasRespuestas);
                            setResultados(nuevosResultados);
                            // Remover estado de aprobación para permitir nuevo intento
                            setEvaluacionesAprobadas(prev => {
                              const newSet = new Set(prev);
                              newSet.delete(bloqueSeleccionado.id);
                              return newSet;
                            });
                            // Generar nuevas preguntas aleatorizadas
                            if (bloqueSeleccionado.preguntas) {
                              const preguntasShuffled = shuffleArray(bloqueSeleccionado.preguntas).map(pregunta => {
                                if (pregunta.tipo === 'multiple') {
                                  const opcionesConIndice = pregunta.opciones.map((opcion, idx) => ({ opcion, idx }));
                                  const opcionesShuffled = shuffleArray(opcionesConIndice);
                                  
                                  let nuevaRespuestaCorrecta: number | number[];
                                  if (Array.isArray(pregunta.respuestaCorrecta)) {
                                    nuevaRespuestaCorrecta = pregunta.respuestaCorrecta.map(idxCorrecta => 
                                      opcionesShuffled.findIndex(item => item.idx === idxCorrecta)
                                    );
                                  } else {
                                    nuevaRespuestaCorrecta = opcionesShuffled.findIndex(
                                      item => item.idx === pregunta.respuestaCorrecta
                                    );
                                  }
                                  
                                  return {
                                    ...pregunta,
                                    opciones: opcionesShuffled.map(item => item.opcion),
                                    respuestaCorrecta: nuevaRespuestaCorrecta
                                  };
                                }
                                return pregunta;
                              });
                              setPreguntasAleatorias(prev => ({
                                ...prev,
                                [bloqueSeleccionado.id]: preguntasShuffled
                              }));
                            }
                          }}
                          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl"
                        >
                          Reintentar Evaluación
                        </button>
                        <div className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center shadow-lg">
                          {(() => {
                            const preguntasParaMostrar = preguntasAleatorias[bloqueSeleccionado.id] || bloqueSeleccionado.preguntas || [];
                            const totalPreguntas = preguntasParaMostrar.length;
                            const correctas = Object.keys(resultados)
                              .filter(k => k.startsWith(bloqueSeleccionado.id) && resultados[k])
                              .length;
                            const porcentaje = Math.round((correctas / totalPreguntas) * 100);
                            const puntajeMinimoRequerido = bloqueSeleccionado.puntajeMinimo || 100;
                            const aprobo = porcentaje >= puntajeMinimoRequerido;
                            return (
                              <div className="text-center">
                                <div>Calificación: {correctas}/{totalPreguntas} ({porcentaje}%)</div>
                                <div className={`text-sm mt-1 ${aprobo ? 'text-green-200' : 'text-red-200'}`}>
                                  {aprobo ? `✓ APROBADO (mínimo: ${puntajeMinimoRequerido}%)` : `✗ REPROBADO (necesitas ${puntajeMinimoRequerido}%)`}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          // Validar todas las respuestas
                          const preguntasParaMostrar = preguntasAleatorias[bloqueSeleccionado.id] || bloqueSeleccionado.preguntas || [];
                          const nuevosResultados = { ...resultados };
                          preguntasParaMostrar.forEach(pregunta => {
                            const respuestaKey = `${bloqueSeleccionado.id}-${pregunta.id}`;
                            const respuestaUsuario = respuestas[respuestaKey];
                            if (respuestaUsuario !== undefined) {
                              if (pregunta.tipo === 'multiple') {
                                if (Array.isArray(pregunta.respuestaCorrecta)) {
                                  // Múltiples respuestas correctas
                                  if (Array.isArray(respuestaUsuario)) {
                                    const correctas = pregunta.respuestaCorrecta as number[];
                                    nuevosResultados[respuestaKey] = respuestaUsuario.length === correctas.length &&
                                                                      respuestaUsuario.every((r: number) => correctas.includes(r));
                                  } else {
                                    nuevosResultados[respuestaKey] = false;
                                  }
                                } else {
                                  // Una sola respuesta correcta
                                  nuevosResultados[respuestaKey] = respuestaUsuario === pregunta.respuestaCorrecta;
                                }
                              } else if (pregunta.tipo === 'abierta') {
                                // Las respuestas abiertas siempre son correctas si hay texto
                                nuevosResultados[respuestaKey] = respuestaUsuario.trim().length > 0;
                              }
                            }
                          });
                          setResultados(nuevosResultados);
                          
                          // Calcular si aprobó usando el porcentaje mínimo configurado (por defecto 100%)
                          const puntajeMinimoRequerido = bloqueSeleccionado.puntajeMinimo || 100;
                          const totalPreguntas = preguntasParaMostrar.length;
                          const correctas = Object.keys(nuevosResultados)
                            .filter(k => k.startsWith(bloqueSeleccionado.id) && nuevosResultados[k])
                            .length;
                          const porcentaje = Math.round((correctas / totalPreguntas) * 100);
                          
                          if (porcentaje >= puntajeMinimoRequerido) {
                            setEvaluacionesAprobadas(prev => new Set(prev).add(bloqueSeleccionado.id));
                          }
                        }}
                        disabled={(() => {
                          const preguntasParaMostrar = preguntasAleatorias[bloqueSeleccionado.id] || bloqueSeleccionado.preguntas || [];
                          return preguntasParaMostrar.some(p => 
                            respuestas[`${bloqueSeleccionado.id}-${p.id}`] === undefined || 
                            (p.tipo === 'abierta' && respuestas[`${bloqueSeleccionado.id}-${p.id}`]?.trim().length === 0)
                          );
                        })()}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Enviar Evaluación
                      </button>
                    )}  
                  </div>
                  </>
                  )}
                </div>
                );
              })()}              {bloqueSeleccionado.tipo === 'documento' && (
                <div className="space-y-6" style={{ minHeight: '500px' }}>
                  {bloqueSeleccionado.videoUrl && (
                    <div className="bg-white border-2 border-gray-300 rounded-xl overflow-hidden shadow-lg">
                      <div className="bg-gray-100 px-4 py-3 border-b border-gray-300 flex items-center justify-between">
                        <span className="font-semibold text-gray-700 flex items-center gap-2">
                          <File className="h-5 w-5" />
                          Documento PDF
                        </span>
                        <a 
                          href={bloqueSeleccionado.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary-600 hover:text-primary-700 text-sm font-semibold"
                        >
                          Abrir en nueva pestaña
                        </a>
                      </div>
                      <iframe
                        src={bloqueSeleccionado.videoUrl}
                        className="w-full border-0"
                        style={{ height: '600px' }}
                        title="Documento PDF"
                      />
                    </div>
                  )}
                  {bloqueSeleccionado.contenido && (
                    <div className="prose max-w-none bg-gray-50 rounded-xl p-6">
                      <ReactMarkdown>{bloqueSeleccionado.contenido}</ReactMarkdown>
                    </div>
                  )}
                </div>
              )}

              {/* Botón de completar */}
              <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
                {bloquesCompletados.has(bloqueActivo!) ? (
                  <div className="flex items-center gap-2 px-6 py-3 bg-green-100 text-green-700 font-semibold rounded-xl">
                    <CheckCircle className="h-5 w-5" />
                    Completado
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      const bloqueActualCompleto = bloquesOrdenados.find(b => b.id === bloqueActivo);
                      
                      // Validar si se puede completar según el tipo
                      if (bloqueActualCompleto?.tipo === 'evaluacion') {
                        // Para evaluaciones, verificar que esté aprobada
                        if (!evaluacionesAprobadas.has(bloqueActivo!)) {
                          setMensajeAlerta('Debes aprobar la evaluación antes de completarla. Envía tus respuestas y obtén una calificación aprobatoria.');
                          setMostrarAlerta(true);
                          return;
                        }
                      }
                      
                      // Marcar como completado
                      if (bloqueActivo) {
                        const nuevosCompletados = new Set(bloquesCompletados).add(bloqueActivo);
                        setBloquesCompletados(nuevosCompletados);
                      }
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Marcar como Completado
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

      {/* Modal de Alerta Integrado */}
      {mostrarAlerta && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-bounce-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
                <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Atención
              </h3>
              <p className="text-gray-600 mb-6">
                {mensajeAlerta}
              </p>
              <button
                onClick={() => setMostrarAlerta(false)}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
