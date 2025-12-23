'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, FileText, Video, CheckSquare, Book, AlertCircle } from 'lucide-react';

export type TipoBloque = 'lectura' | 'video' | 'evaluacion' | 'documento';

export interface BloqueContenido {
  id: string;
  tipo: TipoBloque;
  orden: number;
  titulo: string;
  contenido?: string; // Para lecturas y documentos
  videoUrl?: string; // Para videos
  duracion?: number; // En minutos
  preguntas?: PreguntaQuiz[]; // Para evaluaciones
  descripcion?: string; // Para evaluaciones
  puntajeMinimo?: number; // Porcentaje mínimo para aprobar (solo evaluaciones)
}

export interface PreguntaQuiz {
  id: string;
  pregunta: string;
  tipo: 'multiple' | 'abierta';
  opciones?: string[];
  respuestaCorrecta?: number | number[]; // Soporta múltiples respuestas
  multipleRespuestas?: boolean; // Indica si permite más de una respuesta correcta
  retroalimentacionPositiva?: string;
  retroalimentacionNegativa?: string;
}

interface Props {
  bloques: BloqueContenido[];
  onBloquesChange: (bloques: BloqueContenido[]) => void;
}

export default function ConstructorCurso({ bloques, onBloquesChange }: Props) {
  const [bloqueSeleccionado, setBloqueSeleccionado] = useState<BloqueContenido | null>(null);
  const [modoCreacionPreguntas, setModoCreacionPreguntas] = useState<'ia' | 'manual'>('manual');
  
  // Estados para generación de preguntas con IA
  const [preguntasIA, setPreguntasIA] = useState({
    opcion2: 0,  // V/F or 2 options
    opcion3: 0,  // A, B, C
    opcion4: 5,  // A, B, C, D (default)
    opcion5: 0   // A, B, C, D, E
  });
  const [preguntasGeneradas, setPreguntasGeneradas] = useState<any[]>([]);
  const [generandoPreguntasIA, setGenerandoPreguntasIA] = useState(false);
  const [preguntaEditando, setPreguntaEditando] = useState<any>(null);

  // Crear nuevo bloque
  const agregarBloque = (tipo: TipoBloque) => {
    const nuevoBloque: BloqueContenido = {
      id: Date.now().toString(),
      tipo,
      orden: bloques.length,
      titulo: '',
      contenido: '',
      duracion: tipo === 'video' ? 10 : tipo === 'lectura' ? 15 : 20,
      preguntas: tipo === 'evaluacion' ? [] : undefined
    };
    
    onBloquesChange([...bloques, nuevoBloque]);
    setBloqueSeleccionado(nuevoBloque);
  };

  // Eliminar bloque
  const eliminarBloque = (id: string) => {
    const nuevosBloques = bloques.filter(b => b.id !== id);
    onBloquesChange(nuevosBloques);
    if (bloqueSeleccionado?.id === id) {
      setBloqueSeleccionado(null);
    }
  };

  // Mover bloque arriba
  const moverArriba = (index: number) => {
    if (index === 0) return;
    const nuevosBloques = [...bloques];
    [nuevosBloques[index], nuevosBloques[index - 1]] = [nuevosBloques[index - 1], nuevosBloques[index]];
    onBloquesChange(nuevosBloques);
  };

  // Mover bloque abajo
  const moverAbajo = (index: number) => {
    if (index === bloques.length - 1) return;
    const nuevosBloques = [...bloques];
    [nuevosBloques[index], nuevosBloques[index + 1]] = [nuevosBloques[index + 1], nuevosBloques[index]];
    onBloquesChange(nuevosBloques);
  };

  // Editar bloque
  const editarBloque = (bloque: BloqueContenido) => {
    setBloqueSeleccionado(bloque);
  };

  // Actualizar bloque
  const actualizarBloque = (bloqueActualizado: BloqueContenido) => {
    const nuevosBloques = bloques.map(b => 
      b.id === bloqueActualizado.id ? bloqueActualizado : b
    );
    onBloquesChange(nuevosBloques);
    setBloqueSeleccionado(bloqueActualizado);
  };

  // Agregar pregunta a evaluacion
  const agregarPreguntaQuiz = () => {
    if (!bloqueSeleccionado || bloqueSeleccionado.tipo !== 'evaluacion') return;
    
    const nuevaPregunta: PreguntaQuiz = {
      id: Date.now().toString(),
      pregunta: '',
      tipo: 'multiple',
      opciones: ['', ''],
      respuestaCorrecta: 0,
      multipleRespuestas: false,
      retroalimentacionPositiva: '',
      retroalimentacionNegativa: ''
    };

    const bloqueActualizado = {
      ...bloqueSeleccionado,
      preguntas: [...(bloqueSeleccionado.preguntas || []), nuevaPregunta]
    };

    actualizarBloque(bloqueActualizado);
  };

  // Actualizar pregunta
  const actualizarPregunta = (preguntaId: string, campo: string, valor: any) => {
    if (!bloqueSeleccionado || !bloqueSeleccionado.preguntas) return;

    const preguntasActualizadas = bloqueSeleccionado.preguntas.map(p =>
      p.id === preguntaId ? { ...p, [campo]: valor } : p
    );

    actualizarBloque({
      ...bloqueSeleccionado,
      preguntas: preguntasActualizadas
    });
  };

  // Eliminar pregunta
  const eliminarPregunta = (preguntaId: string) => {
    if (!bloqueSeleccionado || !bloqueSeleccionado.preguntas) return;

    actualizarBloque({
      ...bloqueSeleccionado,
      preguntas: bloqueSeleccionado.preguntas.filter(p => p.id !== preguntaId)
    });
  };

  // ========== FUNCIONES DE IA ==========
  
  // Generar preguntas con IA para el bloque actual
  const generarPreguntasConIA = async () => {
    if (!bloqueSeleccionado) return;

    const totalPreguntas = preguntasIA.opcion2 + preguntasIA.opcion3 + preguntasIA.opcion4 + preguntasIA.opcion5;
    
    if (totalPreguntas === 0) {
      alert('❌ Debes especificar al menos una pregunta para generar');
      return;
    }

    const contenidoCurso = bloqueSeleccionado.contenido || bloqueSeleccionado.descripcion || '';
    if (!contenidoCurso.trim()) {
      alert('❌ Debes agregar contenido o descripción al bloque primero');
      return;
    }

    setGenerandoPreguntasIA(true);

    try {
      const API_URL = typeof window !== 'undefined' && window.location.hostname.includes('netlify')
        ? '/.netlify/functions/generar-preguntas'
        : '/api/generar-preguntas';

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contenidoCurso,
          tiposPreguntas: preguntasIA
        })
      });

      if (!response.ok) throw new Error('Error en la API');

      const data = await response.json();
      setPreguntasGeneradas(data.preguntas || []);
      alert(`✨ ¡${data.preguntas.length} preguntas generadas con IA!\nRevísalas y edita las que necesites.`);
    } catch (error) {
      console.error('Error al generar preguntas:', error);
      alert('❌ Error al generar preguntas con IA. Verifica tu API key de OpenAI.');
    } finally {
      setGenerandoPreguntasIA(false);
    }
  };

  // Agregar una pregunta generada al bloque
  const agregarPreguntaIA = (pregunta: any) => {
    if (!bloqueSeleccionado) return;

    actualizarBloque({
      ...bloqueSeleccionado,
      preguntas: [...(bloqueSeleccionado.preguntas || []), pregunta]
    });
    alert('✅ Pregunta agregada al bloque');
  };

  // Agregar todas las preguntas generadas
  const agregarTodasPreguntasIA = () => {
    if (!bloqueSeleccionado) return;

    actualizarBloque({
      ...bloqueSeleccionado,
      preguntas: [...(bloqueSeleccionado.preguntas || []), ...preguntasGeneradas]
    });
    setPreguntasGeneradas([]);
    alert(`✅ ${preguntasGeneradas.length} preguntas agregadas al bloque`);
  };

  // Editar una pregunta generada
  const editarPreguntaIA = (index: number) => {
    setPreguntaEditando({ ...preguntasGeneradas[index], index });
  };

  // Guardar pregunta editada
  const guardarPreguntaEditada = () => {
    if (!preguntaEditando) return;

    const nuevasPreguntas = [...preguntasGeneradas];
    nuevasPreguntas[preguntaEditando.index] = {
      id: preguntaEditando.id,
      tipo: preguntaEditando.tipo,
      pregunta: preguntaEditando.pregunta,
      opciones: preguntaEditando.opciones,
      respuestaCorrecta: preguntaEditando.respuestaCorrecta,
      retroalimentacionPositiva: preguntaEditando.retroalimentacionPositiva,
      retroalimentacionNegativa: preguntaEditando.retroalimentacionNegativa
    };
    setPreguntasGeneradas(nuevasPreguntas);
    setPreguntaEditando(null);
    alert('✅ Pregunta actualizada');
  };

  // Eliminar una pregunta generada
  const eliminarPreguntaIA = (index: number) => {
    const nuevasPreguntas = preguntasGeneradas.filter((_, i) => i !== index);
    setPreguntasGeneradas(nuevasPreguntas);
  };


  // Iconos por tipo
  const obtenerIcono = (tipo: TipoBloque) => {
    switch (tipo) {
      case 'lectura': return <FileText className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'evaluacion': return <CheckSquare className="h-5 w-5" />;
      case 'documento': return <Book className="h-5 w-5" />;
    }
  };

  // Color por tipo
  const obtenerColor = (tipo: TipoBloque) => {
    switch (tipo) {
      case 'lectura': return 'bg-amber-100 text-amber-700 border-amber-300';
      case 'video': return 'bg-primary-100 text-primary-700 border-primary-300';
      case 'evaluacion': return 'bg-green-100 text-green-700 border-green-300';
      case 'documento': return 'bg-secondary-100 text-secondary-700 border-secondary-300';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">Maquetación del Curso</h3>
        <p className="text-sm text-gray-600 mb-4">
          Construye tu curso agregando bloques en el orden que desees.
        </p>

        {/* Botones para agregar bloques */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm font-semibold text-gray-700">Añadir:</span>
          <button
            type="button"
            onClick={() => agregarBloque('lectura')}
            className="px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-all text-sm"
          >
            Lectura
          </button>
          <button
            type="button"
            onClick={() => agregarBloque('video')}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all text-sm"
          >
            Video
          </button>
          <button
            type="button"
            onClick={() => agregarBloque('evaluacion')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all text-sm"
          >
            Evaluación
          </button>
          <button
            type="button"
            onClick={() => agregarBloque('documento')}
            className="px-4 py-2 bg-secondary-500 text-white rounded-lg font-semibold hover:bg-secondary-600 transition-all text-sm"
          >
            Documento
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Lista de bloques */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Estructura ({bloques.length} bloques)</h4>
          
          {bloques.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-semibold">No hay bloques aún</p>
              <p className="text-gray-500 text-sm">Agrega bloques usando los botones de arriba</p>
            </div>
          ) : (
            <div className="space-y-2">
              {bloques.map((bloque, index) => (
                <div
                  key={bloque.id}
                  className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                    bloqueSeleccionado?.id === bloque.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                  onClick={() => editarBloque(bloque)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${obtenerColor(bloque.tipo)}`}>
                        {obtenerIcono(bloque.tipo)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${obtenerColor(bloque.tipo)}`}>
                            {bloque.tipo.toUpperCase()}
                          </span>
                        </div>
                        <p className="font-semibold text-gray-900">
                          {bloque.titulo || '(Sin título)'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {bloque.duracion} min
                          {bloque.tipo === 'evaluacion' && bloque.preguntas && 
                            ` • ${bloque.preguntas.length} preguntas`
                          }
                        </p>
                      </div>
                    </div>
                    
                    {/* Controles */}
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); moverArriba(index); }}
                        disabled={index === 0}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); moverAbajo(index); }}
                        disabled={index === bloques.length - 1}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); eliminarBloque(bloque.id); }}
                        className="p-1 hover:bg-red-100 text-red-600 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Editor de bloque */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Editor</h4>
          
          {!bloqueSeleccionado ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-semibold">Selecciona un bloque para editarlo</p>
              <p className="text-gray-500 text-sm">O agrega uno nuevo usando los botones de arriba</p>
            </div>
          ) : (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
              <div className={`flex items-center gap-3 p-3 rounded-lg ${obtenerColor(bloqueSeleccionado.tipo)}`}>
                {obtenerIcono(bloqueSeleccionado.tipo)}
                <span className="font-bold text-sm uppercase">
                  Editando: {bloqueSeleccionado.tipo}
                </span>
              </div>

              {/* Campos comunes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Título del Bloque *
                </label>
                <input
                  type="text"
                  value={bloqueSeleccionado.titulo}
                  onChange={(e) => actualizarBloque({ ...bloqueSeleccionado, titulo: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  placeholder={`Título de ${bloqueSeleccionado.tipo}`}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Duración (minutos) *
                </label>
                <input
                  type="number"
                  value={bloqueSeleccionado.duracion}
                  onChange={(e) => actualizarBloque({ ...bloqueSeleccionado, duracion: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                  min="1"
                />
              </div>

              {/* Campos específicos por tipo */}
              {bloqueSeleccionado.tipo === 'lectura' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Contenido de la Lectura *
                    </label>
                    <textarea
                      value={bloqueSeleccionado.contenido || ''}
                      onChange={(e) => actualizarBloque({ ...bloqueSeleccionado, contenido: e.target.value })}
                      rows={8}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                      placeholder="Escribe el contenido de la lectura aquí..."
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Tip: Puedes usar Markdown para formatear el texto. Para agregar imágenes usa: ![texto](url-de-imagen)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Agregar Imagen o PDF
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                      <input
                        type="url"
                        placeholder="URL de la imagen o PDF (ej: https://ejemplo.com/imagen.jpg)"
                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none mb-2"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const url = (e.target as HTMLInputElement).value;
                            if (url) {
                              const isPdf = url.toLowerCase().endsWith('.pdf');
                              const markdown = isPdf 
                                ? `\n\n[📄 Ver PDF](${url})\n\n`
                                : `\n\n![Imagen](${url})\n\n`;
                              actualizarBloque({ 
                                ...bloqueSeleccionado, 
                                contenido: (bloqueSeleccionado.contenido || '') + markdown
                              });
                              (e.target as HTMLInputElement).value = '';
                            }
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500">
                        📎 Pega la URL de tu imagen o PDF y presiona Enter para agregarla al contenido
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {bloqueSeleccionado.tipo === 'video' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    URL del Video (YouTube) *
                  </label>
                  <input
                    type="text"
                    value={bloqueSeleccionado.videoUrl || ''}
                    onChange={(e) => actualizarBloque({ ...bloqueSeleccionado, videoUrl: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
              )}

              {bloqueSeleccionado.tipo === 'documento' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Subir Documento PDF *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-500 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.type !== 'application/pdf') {
                              alert('Por favor selecciona un archivo PDF');
                              return;
                            }
                            if (file.size > 10 * 1024 * 1024) {
                              alert('El archivo es muy grande. Máximo 10MB');
                              return;
                            }
                            
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              actualizarBloque({ 
                                ...bloqueSeleccionado, 
                                videoUrl: reader.result as string 
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                        id={`pdf-upload-${bloqueSeleccionado.id}`}
                      />
                      <label 
                        htmlFor={`pdf-upload-${bloqueSeleccionado.id}`}
                        className="cursor-pointer"
                      >
                        <Book className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm font-semibold text-gray-700">
                          {bloqueSeleccionado.videoUrl ? '✓ PDF cargado' : 'Click para seleccionar PDF'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Máximo 10MB
                        </p>
                      </label>
                    </div>
                    {bloqueSeleccionado.videoUrl && (
                      <button
                        type="button"
                        onClick={() => actualizarBloque({ ...bloqueSeleccionado, videoUrl: '' })}
                        className="text-sm text-red-600 hover:text-red-700 font-semibold"
                      >
                        Eliminar PDF
                      </button>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Descripción del Documento (opcional)
                    </label>
                    <textarea
                      value={bloqueSeleccionado.contenido || ''}
                      onChange={(e) => actualizarBloque({ ...bloqueSeleccionado, contenido: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                      placeholder="Información adicional sobre el documento..."
                    />
                  </div>
                </div>
              )}

              {bloqueSeleccionado.tipo === 'evaluacion' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Descripción de la Evaluación *
                    </label>
                    <textarea
                      value={bloqueSeleccionado.descripcion || ''}
                      onChange={(e) => actualizarBloque({ ...bloqueSeleccionado, descripcion: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
                      placeholder="Describe de qué trata esta evaluación..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Porcentaje Mínimo para Aprobar (%) *
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={bloqueSeleccionado.puntajeMinimo || 100}
                        onChange={(e) => {
                          const valor = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                          actualizarBloque({ ...bloqueSeleccionado, puntajeMinimo: valor });
                        }}
                        className="w-32 px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-center font-bold text-lg"
                      />
                      <span className="text-gray-600 font-semibold">% de respuestas correctas</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      El estudiante debe obtener al menos este porcentaje para aprobar la evaluación.
                    </p>
                  </div>

                  {/* Selector de modo: IA o Manual */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      ¿Cómo quieres crear las preguntas?
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setModoCreacionPreguntas('ia')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                          modoCreacionPreguntas === 'ia'
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        <span className="text-xl">🤖</span>
                        <span>Generar con IA</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setModoCreacionPreguntas('manual')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                          modoCreacionPreguntas === 'manual'
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                        }`}
                      >
                        <span className="text-xl">✍️</span>
                        <span>Crear Manualmente</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-gray-700">
                      Preguntas de la Evaluación ({bloqueSeleccionado.preguntas?.length || 0})
                    </label>
                    {modoCreacionPreguntas === 'manual' && (
                      <button
                        type="button"
                        onClick={agregarPreguntaQuiz}
                        className="flex items-center gap-1 px-4 py-2 bg-primary-600 text-white text-sm rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Agregar Pregunta
                      </button>
                    )}
                  </div>

                  {/* Panel de IA */}
                  {modoCreacionPreguntas === 'ia' && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🤖</span>
                        <h4 className="font-bold text-gray-900 text-lg">Generador de Preguntas con IA</h4>
                      </div>

                      {/* Instrucciones */}
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                        <p className="font-semibold mb-1">💡 Cómo funciona:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                          <li>La IA lee el contenido y descripción de este bloque</li>
                          <li>Genera preguntas con retroalimentación educativa</li>
                          <li>Puedes revisar y editar antes de agregar</li>
                          <li>Las preguntas se mezclan en dificultad automáticamente</li>
                        </ul>
                      </div>

                      {/* Configuración de tipos de preguntas */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {/* 2 opciones */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            📝 2 opciones (V/F)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={preguntasIA.opcion2}
                            onChange={(e) => setPreguntasIA({ ...preguntasIA, opcion2: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-center font-semibold"
                          />
                        </div>

                        {/* 3 opciones */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            📋 3 opciones (ABC)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={preguntasIA.opcion3}
                            onChange={(e) => setPreguntasIA({ ...preguntasIA, opcion3: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-center font-semibold"
                          />
                        </div>

                        {/* 4 opciones */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            ✅ 4 opciones (ABCD)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={preguntasIA.opcion4}
                            onChange={(e) => setPreguntasIA({ ...preguntasIA, opcion4: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-center font-semibold"
                          />
                        </div>

                        {/* 5 opciones */}
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            📚 5 opciones (ABCDE)
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={preguntasIA.opcion5}
                            onChange={(e) => setPreguntasIA({ ...preguntasIA, opcion5: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-center font-semibold"
                          />
                        </div>
                      </div>

                      {/* Total */}
                      <div className="bg-gray-100 rounded-lg p-3 text-center border border-gray-200">
                        <p className="text-gray-900 font-semibold">
                          Total de preguntas: {preguntasIA.opcion2 + preguntasIA.opcion3 + preguntasIA.opcion4 + preguntasIA.opcion5}
                        </p>
                      </div>

                      {/* Botón generar */}
                      <button
                        type="button"
                        onClick={generarPreguntasConIA}
                        disabled={generandoPreguntasIA}
                        className="w-full bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
                      >
                        {generandoPreguntasIA ? (
                          <>
                            <span className="animate-spin">⚙️</span>
                            Generando preguntas...
                          </>
                        ) : (
                          <>
                            <span>✨</span>
                            Generar Preguntas con IA
                          </>
                        )}
                      </button>

                      {/* Preguntas generadas */}
                      {preguntasGeneradas.length > 0 && (
                        <div className="bg-gray-50 rounded-xl p-4 mt-4 border border-gray-300">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-lg text-gray-900">
                              Preguntas Generadas ({preguntasGeneradas.length})
                            </h4>
                            <button
                              type="button"
                              onClick={agregarTodasPreguntasIA}
                              className="bg-primary-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                            >
                              Agregar Todas
                            </button>
                          </div>

                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {preguntasGeneradas.map((pregunta, index) => (
                              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <p className="font-semibold text-gray-900 mb-2">
                                      {index + 1}. {pregunta.pregunta}
                                    </p>
                                    <div className="space-y-1 text-sm">
                                      {pregunta.opciones.map((opcion: string, idx: number) => (
                                        <div 
                                          key={idx}
                                          className={`px-3 py-1 rounded ${
                                            idx === pregunta.respuestaCorrecta
                                              ? 'bg-primary-100 text-primary-900 font-semibold'
                                              : 'bg-gray-50 text-gray-700 border border-gray-200'
                                          }`}
                                        >
                                          {String.fromCharCode(65 + idx)}. {opcion}
                                        </div>
                                      ))}
                                    </div>
                                    {(pregunta.retroalimentacionPositiva || pregunta.retroalimentacionNegativa) && (
                                      <div className="mt-2 space-y-1">
                                        {pregunta.retroalimentacionPositiva && (
                                          <div className="text-xs text-gray-700 bg-green-50 p-2 rounded border border-green-200">
                                            <strong>✅ Correcta:</strong> {pregunta.retroalimentacionPositiva}
                                          </div>
                                        )}
                                        {pregunta.retroalimentacionNegativa && (
                                          <div className="text-xs text-gray-700 bg-red-50 p-2 rounded border border-red-200">
                                            <strong>❌ Incorrecta:</strong> {pregunta.retroalimentacionNegativa}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Botones de acción */}
                                  <div className="flex flex-col gap-2">
                                    <button
                                      type="button"
                                      onClick={() => editarPreguntaIA(index)}
                                      className="bg-gray-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-gray-700 transition-colors whitespace-nowrap"
                                    >
                                      ✏️ Editar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => agregarPreguntaIA(pregunta)}
                                      className="bg-primary-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-primary-700 transition-colors whitespace-nowrap"
                                    >
                                      + Agregar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => eliminarPreguntaIA(index)}
                                      className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-red-700 transition-all whitespace-nowrap"
                                    >
                                      🗑️ Eliminar
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {(!bloqueSeleccionado.preguntas || bloqueSeleccionado.preguntas.length === 0) ? (
                    <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-500">
                      No hay preguntas. Agrega una usando el botón de arriba.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {bloqueSeleccionado.preguntas.map((pregunta, idx) => (
                        <div key={`${pregunta.id}-${pregunta.multipleRespuestas}`} className="bg-gray-50 rounded-lg p-4 space-y-3">
                          <div className="flex items-start justify-between">
                            <span className="text-xs font-bold text-gray-500">Pregunta {idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => eliminarPregunta(pregunta.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          
                          <input
                            type="text"
                            value={pregunta.pregunta}
                            onChange={(e) => actualizarPregunta(pregunta.id, 'pregunta', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            placeholder="Escribe la pregunta..."
                          />

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => actualizarPregunta(pregunta.id, 'tipo', 'multiple')}
                              className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold ${
                                pregunta.tipo === 'multiple'
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              Múltiple
                            </button>
                            <button
                              type="button"
                              onClick={() => actualizarPregunta(pregunta.id, 'tipo', 'abierta')}
                              className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold ${
                                pregunta.tipo === 'abierta'
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              Abierta
                            </button>
                          </div>

                          {pregunta.tipo === 'multiple' && (
                            <div className="space-y-3">
                              <div className="flex items-center gap-2 bg-blue-50 rounded-lg p-3">
                                <input
                                  type="checkbox"
                                  id={`multiple-${pregunta.id}`}
                                  checked={pregunta.multipleRespuestas || false}
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    console.log('Cambio a múltiple respuestas:', checked);
                                    console.log('Pregunta antes:', pregunta);
                                    
                                    // Actualizar ambos campos a la vez
                                    const preguntasActualizadas = bloqueSeleccionado!.preguntas!.map(p =>
                                      p.id === pregunta.id 
                                        ? { 
                                            ...p, 
                                            multipleRespuestas: checked,
                                            respuestaCorrecta: checked ? [] : 0
                                          } 
                                        : p
                                    );

                                    actualizarBloque({
                                      ...bloqueSeleccionado!,
                                      preguntas: preguntasActualizadas
                                    });
                                    
                                    console.log('Pregunta después:', preguntasActualizadas.find(p => p.id === pregunta.id));
                                  }}
                                  className="w-4 h-4 cursor-pointer"
                                />
                                <label htmlFor={`multiple-${pregunta.id}`} className="text-sm font-semibold text-blue-700 cursor-pointer flex-1">
                                  Permitir múltiples respuestas correctas {pregunta.multipleRespuestas ? '✓' : ''}
                                </label>
                              </div>

                              <div className="space-y-2">
                                <p className="text-xs text-gray-600 font-semibold">
                                  {pregunta.multipleRespuestas ? '☑️ Marca todas las opciones correctas:' : '⭕ Selecciona la opción correcta:'}
                                </p>
                                {(pregunta.opciones || []).map((opcion, opIdx) => (
                                  <div key={opIdx} className="flex items-center gap-2">
                                    {pregunta.multipleRespuestas ? (
                                      <input
                                        type="checkbox"
                                        checked={Array.isArray(pregunta.respuestaCorrecta) && pregunta.respuestaCorrecta.includes(opIdx)}
                                        onChange={(e) => {
                                          e.stopPropagation();
                                          const respuestas = Array.isArray(pregunta.respuestaCorrecta) 
                                            ? [...pregunta.respuestaCorrecta] 
                                            : [];
                                          if (e.target.checked) {
                                            if (!respuestas.includes(opIdx)) {
                                              respuestas.push(opIdx);
                                            }
                                          } else {
                                            const index = respuestas.indexOf(opIdx);
                                            if (index > -1) {
                                              respuestas.splice(index, 1);
                                            }
                                          }
                                          console.log('Actualizando respuestas correctas:', respuestas);
                                          actualizarPregunta(pregunta.id, 'respuestaCorrecta', respuestas);
                                        }}
                                        className="w-4 h-4 cursor-pointer"
                                      />
                                    ) : (
                                      <input
                                        type="radio"
                                        name={`respuesta-${pregunta.id}`}
                                        checked={pregunta.respuestaCorrecta === opIdx}
                                        onChange={() => actualizarPregunta(pregunta.id, 'respuestaCorrecta', opIdx)}
                                        className="w-4 h-4"
                                      />
                                    )}
                                    <input
                                      type="text"
                                      value={opcion}
                                      onChange={(e) => {
                                        const nuevasOpciones = [...(pregunta.opciones || [])];
                                        nuevasOpciones[opIdx] = e.target.value;
                                        actualizarPregunta(pregunta.id, 'opciones', nuevasOpciones);
                                      }}
                                      className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                                      placeholder={`Opción ${String.fromCharCode(65 + opIdx)}`}
                                    />
                                    {(pregunta.opciones?.length || 0) > 2 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const nuevasOpciones = [...(pregunta.opciones || [])];
                                          nuevasOpciones.splice(opIdx, 1);
                                          actualizarPregunta(pregunta.id, 'opciones', nuevasOpciones);
                                        }}
                                        className="text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const nuevasOpciones = [...(pregunta.opciones || []), ''];
                                  actualizarPregunta(pregunta.id, 'opciones', nuevasOpciones);
                                }}
                                className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm font-semibold text-gray-600 hover:border-gray-400 hover:text-gray-700"
                              >
                                + Agregar Opción
                              </button>
                            </div>
                          )}

                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                              Retroalimentación Positiva
                            </label>
                            <textarea
                              value={pregunta.retroalimentacionPositiva || ''}
                              onChange={(e) => actualizarPregunta(pregunta.id, 'retroalimentacionPositiva', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                              placeholder="Mensaje cuando responde correctamente..."
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1">
                              Retroalimentación Negativa
                            </label>
                            <textarea
                              value={pregunta.retroalimentacionNegativa || ''}
                              onChange={(e) => actualizarPregunta(pregunta.id, 'retroalimentacionNegativa', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                              placeholder="Mensaje cuando responde incorrectamente..."
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Modal de Edición de Pregunta IA */}
      {preguntaEditando && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">✏️ Editar Pregunta</h3>
              <button
                type="button"
                onClick={() => setPreguntaEditando(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Pregunta */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pregunta
                </label>
                <input
                  type="text"
                  value={preguntaEditando.pregunta}
                  onChange={(e) => setPreguntaEditando({
                    ...preguntaEditando,
                    pregunta: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Escribe la pregunta..."
                />
              </div>

              {/* Opciones */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Opciones de Respuesta
                </label>
                <div className="space-y-2">
                  {preguntaEditando.opciones.map((opcion: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="font-bold text-gray-600 w-8">
                        {String.fromCharCode(65 + idx)}.
                      </span>
                      <input
                        type="text"
                        value={opcion}
                        onChange={(e) => {
                          const nuevasOpciones = [...preguntaEditando.opciones];
                          nuevasOpciones[idx] = e.target.value;
                          setPreguntaEditando({
                            ...preguntaEditando,
                            opciones: nuevasOpciones
                          });
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder={`Opción ${String.fromCharCode(65 + idx)}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Respuesta Correcta */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Respuesta Correcta
                </label>
                <select
                  value={preguntaEditando.respuestaCorrecta}
                  onChange={(e) => setPreguntaEditando({
                    ...preguntaEditando,
                    respuestaCorrecta: parseInt(e.target.value)
                  })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {preguntaEditando.opciones.map((_: string, idx: number) => (
                    <option key={idx} value={idx}>
                      {String.fromCharCode(65 + idx)}. {preguntaEditando.opciones[idx]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Retroalimentación Positiva */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Retroalimentación Positiva
                </label>
                <textarea
                  value={preguntaEditando.retroalimentacionPositiva || ''}
                  onChange={(e) => setPreguntaEditando({
                    ...preguntaEditando,
                    retroalimentacionPositiva: e.target.value
                  })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Mensaje cuando responde correctamente..."
                />
              </div>

              {/* Retroalimentación Negativa */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Retroalimentación Negativa
                </label>
                <textarea
                  value={preguntaEditando.retroalimentacionNegativa || ''}
                  onChange={(e) => setPreguntaEditando({
                    ...preguntaEditando,
                    retroalimentacionNegativa: e.target.value
                  })}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Mensaje cuando responde incorrectamente..."
                />
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={guardarPreguntaEditada}
                  className="flex-1 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  💾 Guardar Cambios
                </button>
                <button
                  type="button"
                  onClick={() => setPreguntaEditando(null)}
                  className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-400 transition-all"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
