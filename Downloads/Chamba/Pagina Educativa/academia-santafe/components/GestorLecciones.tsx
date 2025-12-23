'use client';

import { useState } from 'react';
import { Plus, X, Video, FileText, ClipboardCheck, GripVertical, ChevronUp, ChevronDown, Trash2, Edit } from 'lucide-react';

export interface Leccion {
  id?: number;
  orden: number;
  tipo: 'video' | 'texto' | 'evaluacion';
  titulo: string;
  descripcion?: string;
  // Para videos
  videoUrl?: string;
  duracion?: number;
  // Para textos
  contenido?: string;
  // Para evaluaciones
  preguntas?: any[];
  puntajeMinimo?: number;
  // Metadata
  obligatoria: boolean;
}

interface GestorLeccionesProps {
  lecciones: Leccion[];
  onLeccionesChange: (lecciones: Leccion[]) => void;
}

export default function GestorLecciones({ lecciones, onLeccionesChange }: GestorLeccionesProps) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoIndex, setEditandoIndex] = useState<number | null>(null);
  const [leccionActual, setLeccionActual] = useState<Leccion>({
    orden: lecciones.length + 1,
    tipo: 'video',
    titulo: '',
    descripcion: '',
    videoUrl: '',
    duracion: 0,
    contenido: '',
    preguntas: [],
    puntajeMinimo: 80,
    obligatoria: true
  });

  const tipos = [
    { value: 'video', label: 'Video', icon: Video, color: 'bg-red-500' },
    { value: 'texto', label: 'Lectura', icon: FileText, color: 'bg-blue-500' },
    { value: 'evaluacion', label: 'Evaluación', icon: ClipboardCheck, color: 'bg-green-500' }
  ];

  const agregarLeccion = () => {
    if (!leccionActual.titulo.trim()) {
      alert('El título es obligatorio');
      return;
    }

    if (leccionActual.tipo === 'video' && !leccionActual.videoUrl?.trim()) {
      alert('La URL del video es obligatoria');
      return;
    }

    if (leccionActual.tipo === 'texto' && !leccionActual.contenido?.trim()) {
      alert('El contenido es obligatorio para lecciones de texto');
      return;
    }

    if (editandoIndex !== null) {
      // Actualizar lección existente
      const nuevasLecciones = [...lecciones];
      nuevasLecciones[editandoIndex] = { ...leccionActual };
      onLeccionesChange(nuevasLecciones);
      setEditandoIndex(null);
    } else {
      // Agregar nueva lección
      onLeccionesChange([...lecciones, { ...leccionActual }]);
    }

    // Resetear formulario
    setLeccionActual({
      orden: lecciones.length + 2,
      tipo: 'video',
      titulo: '',
      descripcion: '',
      videoUrl: '',
      duracion: 0,
      contenido: '',
      preguntas: [],
      puntajeMinimo: 80,
      obligatoria: true
    });
    setMostrarFormulario(false);
  };

  const eliminarLeccion = (index: number) => {
    if (confirm('¿Estás seguro de eliminar esta lección?')) {
      const nuevasLecciones = lecciones.filter((_, i) => i !== index);
      // Reordenar
      nuevasLecciones.forEach((leccion, i) => {
        leccion.orden = i + 1;
      });
      onLeccionesChange(nuevasLecciones);
    }
  };

  const editarLeccion = (index: number) => {
    setLeccionActual({ ...lecciones[index] });
    setEditandoIndex(index);
    setMostrarFormulario(true);
  };

  const moverLeccion = (index: number, direccion: 'arriba' | 'abajo') => {
    if (
      (direccion === 'arriba' && index === 0) ||
      (direccion === 'abajo' && index === lecciones.length - 1)
    ) {
      return;
    }

    const nuevasLecciones = [...lecciones];
    const nuevoIndex = direccion === 'arriba' ? index - 1 : index + 1;

    // Intercambiar
    [nuevasLecciones[index], nuevasLecciones[nuevoIndex]] = 
    [nuevasLecciones[nuevoIndex], nuevasLecciones[index]];

    // Actualizar orden
    nuevasLecciones.forEach((leccion, i) => {
      leccion.orden = i + 1;
    });

    onLeccionesChange(nuevasLecciones);
  };

  const getTipoInfo = (tipo: string) => {
    return tipos.find(t => t.value === tipo) || tipos[0];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">
          Lecciones del Curso ({lecciones.length})
        </h3>
        <button
          type="button"
          onClick={() => {
            setEditandoIndex(null);
            setLeccionActual({
              orden: lecciones.length + 1,
              tipo: 'video',
              titulo: '',
              descripcion: '',
              videoUrl: '',
              duracion: 0,
              contenido: '',
              preguntas: [],
              puntajeMinimo: 80,
              obligatoria: true
            });
            setMostrarFormulario(true);
          }}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Agregar Lección
        </button>
      </div>

      {/* Lista de Lecciones */}
      {lecciones.length > 0 && (
        <div className="space-y-2 bg-gray-50 rounded-lg p-4">
          {lecciones.map((leccion, index) => {
            const tipoInfo = getTipoInfo(leccion.tipo);
            const IconoTipo = tipoInfo.icon;

            return (
              <div
                key={index}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex items-center gap-3"
              >
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => moverLeccion(index, 'arriba')}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <GripVertical className="h-4 w-4 text-gray-300" />
                  <button
                    type="button"
                    onClick={() => moverLeccion(index, 'abajo')}
                    disabled={index === lecciones.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                <div className={`w-10 h-10 ${tipoInfo.color} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                  <IconoTipo className="h-5 w-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-gray-500">
                      Lección {leccion.orden}
                    </span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                      {tipoInfo.label}
                    </span>
                    {!leccion.obligatoria && (
                      <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full">
                        Opcional
                      </span>
                    )}
                  </div>
                  <h4 className="font-semibold text-gray-900 truncate">
                    {leccion.titulo}
                  </h4>
                  {leccion.descripcion && (
                    <p className="text-sm text-gray-500 truncate">
                      {leccion.descripcion}
                    </p>
                  )}
                  {leccion.tipo === 'video' && leccion.duracion && (
                    <p className="text-xs text-gray-400 mt-1">
                      Duración: {leccion.duracion} min
                    </p>
                  )}
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => editarLeccion(index)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar lección"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => eliminarLeccion(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar lección"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {lecciones.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-1">No hay lecciones aún</p>
          <p className="text-sm text-gray-400">
            Agrega videos, textos o evaluaciones para estructurar tu curso
          </p>
        </div>
      )}

      {/* Modal de Formulario */}
      {mostrarFormulario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {editandoIndex !== null ? 'Editar Lección' : 'Nueva Lección'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setMostrarFormulario(false);
                    setEditandoIndex(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Tipo de Lección */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tipo de Lección *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {tipos.map((tipo) => {
                    const Icono = tipo.icon;
                    return (
                      <button
                        key={tipo.value}
                        type="button"
                        onClick={() => setLeccionActual({ ...leccionActual, tipo: tipo.value as any })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          leccionActual.tipo === tipo.value
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-10 h-10 ${tipo.color} rounded-lg flex items-center justify-center text-white mx-auto mb-2`}>
                          <Icono className="h-5 w-5" />
                        </div>
                        <p className={`text-sm font-semibold ${
                          leccionActual.tipo === tipo.value ? 'text-orange-700' : 'text-gray-700'
                        }`}>
                          {tipo.label}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Título */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Título de la Lección *
                </label>
                <input
                  type="text"
                  value={leccionActual.titulo}
                  onChange={(e) => setLeccionActual({ ...leccionActual, titulo: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                  placeholder="Ej: Introducción a la construcción de cimientos"
                />
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descripción (Opcional)
                </label>
                <textarea
                  value={leccionActual.descripcion}
                  onChange={(e) => setLeccionActual({ ...leccionActual, descripcion: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none"
                  placeholder="Breve descripción de lo que aprenderán..."
                />
              </div>

              {/* Campos específicos por tipo */}
              {leccionActual.tipo === 'video' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      URL del Video (YouTube) *
                    </label>
                    <input
                      type="url"
                      value={leccionActual.videoUrl}
                      onChange={(e) => setLeccionActual({ ...leccionActual, videoUrl: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Duración (minutos)
                    </label>
                    <input
                      type="number"
                      value={leccionActual.duracion}
                      onChange={(e) => setLeccionActual({ ...leccionActual, duracion: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      placeholder="15"
                      min="0"
                    />
                  </div>
                </>
              )}

              {leccionActual.tipo === 'texto' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Contenido de la Lección *
                  </label>
                  <textarea
                    value={leccionActual.contenido}
                    onChange={(e) => setLeccionActual({ ...leccionActual, contenido: e.target.value })}
                    rows={8}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all resize-none font-mono text-sm"
                    placeholder="Escribe el contenido de la lección aquí... (puedes usar Markdown)"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Tip: Usa Markdown para dar formato (negrita, listas, títulos, etc.)
                  </p>
                </div>
              )}

              {leccionActual.tipo === 'evaluacion' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <p className="text-sm text-blue-700 mb-2">
                    <strong>Nota:</strong> Las preguntas de evaluación se configurarán después de crear la lección.
                  </p>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Puntaje Mínimo para Aprobar (%)
                    </label>
                    <input
                      type="number"
                      value={leccionActual.puntajeMinimo}
                      onChange={(e) => setLeccionActual({ ...leccionActual, puntajeMinimo: parseInt(e.target.value) || 80 })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              )}

              {/* Lección Obligatoria */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
                <input
                  type="checkbox"
                  id="obligatoria"
                  checked={leccionActual.obligatoria}
                  onChange={(e) => setLeccionActual({ ...leccionActual, obligatoria: e.target.checked })}
                  className="w-5 h-5 text-orange-600 focus:ring-orange-500 rounded"
                />
                <label htmlFor="obligatoria" className="text-sm font-semibold text-gray-700 cursor-pointer">
                  Esta lección es obligatoria para completar el curso
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                type="button"
                onClick={agregarLeccion}
                className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-all"
              >
                {editandoIndex !== null ? 'Guardar Cambios' : 'Agregar Lección'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false);
                  setEditandoIndex(null);
                }}
                className="px-6 py-3 rounded-xl font-semibold bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
