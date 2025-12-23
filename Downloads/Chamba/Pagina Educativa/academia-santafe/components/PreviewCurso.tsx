'use client';

import { X, User, Clock, BookOpen, Award } from 'lucide-react';
import { BloqueContenido } from './ConstructorCurso';
import CourseraLessonViewer from './CourseraLessonViewer';

interface PreviewCursoProps {
  curso: {
    titulo: string;
    descripcion: string;
    instructor: string;
    duracion: string;
    nivel: string;
    categoria: string;
    imagen?: string;
    contenido?: string;
    bloques: BloqueContenido[];
  };
  onCerrar: () => void;
}

export default function PreviewCurso({ curso, onCerrar }: PreviewCursoProps) {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 z-50 overflow-y-auto">
      <div className="min-h-screen py-8 px-4">
        {/* Header del preview */}
        <div className="bg-blue-600 text-white py-3 px-6 rounded-t-xl max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="h-5 w-5" />
            <span className="font-semibold">Modo Preview - Vista previa del curso</span>
          </div>
          <button
            onClick={onCerrar}
            className="p-1 hover:bg-blue-700 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Contenido del curso */}
        <div className="max-w-7xl mx-auto bg-white rounded-b-xl shadow-2xl">
          {/* Hero del curso */}
          <div className="relative">
            {curso.imagen ? (
              <div className="h-64 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
                <img 
                  src={curso.imagen} 
                  alt={curso.titulo}
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <div className="max-w-5xl mx-auto">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-3">
                      {curso.categoria}
                    </span>
                    <h1 className="text-4xl font-bold mb-2">{curso.titulo}</h1>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 bg-gradient-to-r from-blue-600 to-purple-600 flex items-end">
                <div className="p-8 text-white w-full">
                  <div className="max-w-5xl mx-auto">
                    <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-3">
                      {curso.categoria}
                    </span>
                    <h1 className="text-4xl font-bold mb-2">{curso.titulo}</h1>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Información del curso */}
          <div className="p-8">
            <div className="max-w-5xl mx-auto">
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <User className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Instructor</p>
                    <p className="font-semibold text-gray-900">{curso.instructor}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Duración</p>
                    <p className="font-semibold text-gray-900">{curso.duracion}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Nivel</p>
                    <p className="font-semibold text-gray-900">{curso.nivel}</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Acerca de este curso</h2>
                <p className="text-gray-700 leading-relaxed">{curso.descripcion}</p>
              </div>

              {curso.contenido && (
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Lo que aprenderás</h2>
                  <div className="grid md:grid-cols-2 gap-3">
                    {curso.contenido.split('\n').filter(item => item.trim()).map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Módulos del curso */}
              <div>
                <div className="mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Contenido del curso</h2>
                  <p className="text-gray-600">
                    {curso.bloques.length} {curso.bloques.length === 1 ? 'elemento' : 'elementos'}
                  </p>
                </div>

                <CourseraLessonViewer
                  bloques={curso.bloques}
                  cursoTitulo={curso.titulo}
                  leccionesCompletadas={[]} // En preview, ninguna está completada
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer del preview */}
        <div className="max-w-7xl mx-auto mt-4 text-center">
          <button
            onClick={onCerrar}
            className="bg-gray-800 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-900 transition-colors"
          >
            Cerrar Preview
          </button>
        </div>
      </div>
    </div>
  );
}
