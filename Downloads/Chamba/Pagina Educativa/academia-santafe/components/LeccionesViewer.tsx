'use client';

import { useState, useEffect } from 'react';
import { Video, FileText, ClipboardCheck, CheckCircle, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import TranscripcionVideo from './TranscripcionVideo';
import ReactMarkdown from 'react-markdown';

interface Leccion {
  id: string;
  curso_id: string;
  orden: number;
  tipo: 'video' | 'texto' | 'evaluacion';
  titulo: string;
  descripcion?: string;
  video_url?: string;
  duracion?: number;
  contenido?: string;
  preguntas?: any[];
  puntaje_minimo?: number;
  obligatoria: boolean;
}

interface LeccionesViewerProps {
  cursoId: string;
  usuarioId?: string;
  onLeccionCompletada?: (leccionId: string) => void;
}

export default function LeccionesViewer({ cursoId, usuarioId, onLeccionCompletada }: LeccionesViewerProps) {
  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [leccionActual, setLeccionActual] = useState(0);
  const [leccionesCompletadas, setLeccionesCompletadas] = useState<string[]>([]);
  const [cargando, setCargando] = useState(true);
  const [videoId, setVideoId] = useState('');

  // Cargar lecciones desde Supabase
  useEffect(() => {
    cargarLecciones();
    if (usuarioId) {
      cargarProgreso();
    }
  }, [cursoId, usuarioId]);

  useEffect(() => {
    if (lecciones[leccionActual]?.tipo === 'video' && lecciones[leccionActual]?.video_url) {
      const url = lecciones[leccionActual].video_url || '';
      const extractedId = url.split('v=')[1]?.split('&')[0] || '';
      setVideoId(extractedId);
    }
  }, [leccionActual, lecciones]);

  const cargarLecciones = async () => {
    setCargando(true);
    try {
      const { data, error } = await supabase
        .from('lecciones_curso')
        .select('*')
        .eq('curso_id', cursoId)
        .order('orden', { ascending: true });

      if (error) throw error;
      setLecciones(data || []);
    } catch (error) {
      console.error('Error al cargar lecciones:', error);
      setLecciones([]);
    } finally {
      setCargando(false);
    }
  };

  const cargarProgreso = async () => {
    if (!usuarioId) return;
    
    try {
      const { data, error } = await supabase
        .from('progreso_lecciones')
        .select('leccion_id')
        .eq('user_id', usuarioId)
        .eq('curso_id', cursoId)
        .eq('completada', true);

      if (error) throw error;
      
      const leccionesIds = data?.map(p => p.leccion_id) || [];
      setLeccionesCompletadas(leccionesIds);
    } catch (error) {
      console.error('Error al cargar progreso:', error);
    }
  };

  const marcarCompletada = async (leccionId: string) => {
    if (!usuarioId) {
      alert('Debes iniciar sesión para guardar tu progreso');
      return;
    }

    if (leccionesCompletadas.includes(leccionId)) {
      return; // Ya está completada
    }

    try {
      // Guardar en base de datos
      const { error } = await supabase
        .from('progreso_lecciones')
        .upsert({
          user_id: usuarioId,
          leccion_id: leccionId,
          curso_id: cursoId,
          completada: true,
          fecha_completado: new Date().toISOString()
        }, {
          onConflict: 'user_id,leccion_id'
        });

      if (error) throw error;

      // Actualizar estado local
      setLeccionesCompletadas([...leccionesCompletadas, leccionId]);
      
      // Callback opcional
      onLeccionCompletada?.(leccionId);

      // Mostrar mensaje de éxito
      alert('✅ ¡Lección completada!');
    } catch (error) {
      console.error('Error al marcar lección:', error);
      alert('❌ Error al guardar progreso');
    }
  };

  const siguienteLeccion = () => {
    if (leccionActual < lecciones.length - 1) {
      setLeccionActual(leccionActual + 1);
    }
  };

  const anteriorLeccion = () => {
    if (leccionActual > 0) {
      setLeccionActual(leccionActual - 1);
    }
  };

  const handleVideoSeek = (time: number) => {
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
      <div className="animate-pulse space-y-4">
        <div className="h-96 bg-gray-200 rounded-xl"></div>
        <div className="h-20 bg-gray-200 rounded-xl"></div>
      </div>
    );
  }

  if (lecciones.length === 0) {
    return (
      <div className="bg-gray-50 rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
        <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Este curso aún no tiene lecciones</p>
        <p className="text-gray-400 text-sm mt-2">El instructor está preparando el contenido</p>
      </div>
    );
  }

  const leccion = lecciones[leccionActual];
  const estaCompletada = leccionesCompletadas.includes(leccion.id);

  return (
    <div className="space-y-6">
      {/* Barra de progreso de lecciones */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Progreso del Curso
          </h3>
          <span className="text-sm text-gray-500">
            {leccionesCompletadas.length} / {lecciones.length} lecciones
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(leccionesCompletadas.length / lecciones.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Lista de lecciones (sidebar colapsable) */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4">
          <h2 className="text-lg font-bold">Contenido del Curso</h2>
        </div>
        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {lecciones.map((l, index) => {
            const completada = leccionesCompletadas.includes(l.id);
            const activa = index === leccionActual;
            const bloqueada = l.obligatoria && index > 0 && !leccionesCompletadas.includes(lecciones[index - 1].id);

            const iconos = {
              video: Video,
              texto: FileText,
              evaluacion: ClipboardCheck
            };

            const colores = {
              video: 'text-red-500',
              texto: 'text-blue-500',
              evaluacion: 'text-green-500'
            };

            const Icono = iconos[l.tipo];

            return (
              <button
                key={l.id}
                onClick={() => !bloqueada && setLeccionActual(index)}
                disabled={bloqueada}
                className={`w-full p-4 text-left transition-all hover:bg-gray-50 ${
                  activa ? 'bg-orange-50 border-l-4 border-orange-500' : ''
                } ${bloqueada ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`flex-shrink-0 ${colores[l.tipo]}`}>
                    {bloqueada ? (
                      <Lock className="h-5 w-5" />
                    ) : completada ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Icono className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-gray-500">
                        Lección {l.orden}
                      </span>
                      {l.duracion && (
                        <span className="text-xs text-gray-400">
                          {l.duracion} min
                        </span>
                      )}
                    </div>
                    <p className={`font-semibold truncate ${activa ? 'text-orange-700' : 'text-gray-900'}`}>
                      {l.titulo}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido de la lección actual */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span className="px-2 py-1 bg-gray-100 rounded-full">
              Lección {leccion.orden} de {lecciones.length}
            </span>
            {leccion.tipo === 'video' && <Video className="h-4 w-4 text-red-500" />}
            {leccion.tipo === 'texto' && <FileText className="h-4 w-4 text-blue-500" />}
            {leccion.tipo === 'evaluacion' && <ClipboardCheck className="h-4 w-4 text-green-500" />}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{leccion.titulo}</h1>
          {leccion.descripcion && (
            <p className="text-gray-600 mt-2">{leccion.descripcion}</p>
          )}
        </div>

        {/* Renderizar según tipo */}
        {leccion.tipo === 'video' && leccion.video_url && (
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-xl overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1`}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
            
            {videoId && (
              <TranscripcionVideo
                videoId={videoId}
                onSeek={handleVideoSeek}
              />
            )}

            {!estaCompletada && (
              <button
                onClick={() => marcarCompletada(leccion.id)}
                className="w-full bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                Marcar como Completada
              </button>
            )}
          </div>
        )}

        {leccion.tipo === 'texto' && leccion.contenido && (
          <div className="space-y-4">
            <div className="prose max-w-none bg-gray-50 rounded-xl p-6">
              <ReactMarkdown>{leccion.contenido}</ReactMarkdown>
            </div>

            {!estaCompletada && (
              <button
                onClick={() => marcarCompletada(leccion.id)}
                className="w-full bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                Marcar como Completada
              </button>
            )}
          </div>
        )}

        {leccion.tipo === 'evaluacion' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <p className="text-blue-700 text-center">
              <strong>Evaluación:</strong> Esta funcionalidad se integrará con el sistema de evaluaciones existente.
            </p>
            <p className="text-sm text-blue-600 text-center mt-2">
              Puntaje mínimo para aprobar: {leccion.puntaje_minimo}%
            </p>
          </div>
        )}

        {/* Navegación */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={anteriorLeccion}
            disabled={leccionActual === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
            Anterior
          </button>

          <button
            onClick={siguienteLeccion}
            disabled={leccionActual === lecciones.length - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
