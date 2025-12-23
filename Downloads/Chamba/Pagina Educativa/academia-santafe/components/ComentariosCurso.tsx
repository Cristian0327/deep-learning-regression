'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { MessageSquare, Send, Edit2, Trash2, Reply } from 'lucide-react';

interface ComentariosCursoProps {
  cursoId: string | string[];
}

export default function ComentariosCurso({ cursoId }: ComentariosCursoProps) {
  const { data: session } = useSession();
  const [comentarios, setComentarios] = useState<any[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [cargando, setCargando] = useState(false);
  const [responderA, setResponderA] = useState<number | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [textoEditado, setTextoEditado] = useState('');

  useEffect(() => {
    cargarComentarios();
  }, [cursoId]);

  const cargarComentarios = async () => {
    try {
      const { data, error } = await supabase
        .from('comentarios_cursos')
        .select('*')
        .eq('curso_id', cursoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComentarios(data || []);
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
    }
  };

  const enviarComentario = async () => {
    if (!nuevoComentario.trim()) {
      alert('Escribe un comentario');
      return;
    }

    if (!session?.user?.email) {
      alert('Debes iniciar sesión para comentar');
      return;
    }

    setCargando(true);

    try {
      const { error } = await supabase
        .from('comentarios_cursos')
        .insert([{
          usuario_id: session.user.email,
          usuario_nombre: session.user.name || session.user.email,
          curso_id: cursoId,
          comentario: nuevoComentario,
          respuesta_a: responderA
        }]);

      if (error) throw error;

      setNuevoComentario('');
      setResponderA(null);
      cargarComentarios();
    } catch (error) {
      console.error('Error al enviar comentario:', error);
      alert('Error al enviar el comentario');
    } finally {
      setCargando(false);
    }
  };

  const eliminarComentario = async (id: number) => {
    if (!confirm('¿Eliminar este comentario?')) return;

    try {
      const { error } = await supabase
        .from('comentarios_cursos')
        .delete()
        .eq('id', id)
        .eq('usuario_id', session?.user?.email);

      if (error) throw error;
      cargarComentarios();
    } catch (error) {
      console.error('Error al eliminar comentario:', error);
      alert('Error al eliminar el comentario');
    }
  };

  const iniciarEdicion = (comentario: any) => {
    setEditandoId(comentario.id);
    setTextoEditado(comentario.comentario);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setTextoEditado('');
  };

  const guardarEdicion = async (id: number) => {
    if (!textoEditado.trim()) {
      alert('El comentario no puede estar vacío');
      return;
    }

    try {
      const { error } = await supabase
        .from('comentarios_cursos')
        .update({
          comentario: textoEditado,
          editado: true,
          fecha_edicion: new Date().toISOString()
        })
        .eq('id', id)
        .eq('usuario_id', session?.user?.email);

      if (error) throw error;
      
      setEditandoId(null);
      setTextoEditado('');
      cargarComentarios();
    } catch (error) {
      console.error('Error al editar comentario:', error);
      alert('Error al editar el comentario');
    }
  };

  const comentariosPrincipales = comentarios.filter(c => !c.respuesta_a);

  const obtenerRespuestas = (comentarioId: number) => {
    return comentarios.filter(c => c.respuesta_a === comentarioId);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare className="h-6 w-6 text-primary-600" />
        <h3 className="text-xl font-bold text-gray-900">
          Comentarios ({comentarios.length})
        </h3>
      </div>

      {/* Formulario de nuevo comentario */}
      {session ? (
        <div className="mb-8">
          {responderA && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 flex items-center justify-between">
              <span className="text-sm text-blue-700">
                Respondiendo a comentario...
              </span>
              <button
                onClick={() => setResponderA(null)}
                className="text-blue-700 hover:text-blue-900"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="flex gap-3">
            <textarea
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              placeholder="Escribe tu comentario o pregunta..."
              rows={3}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
            />
            <button
              onClick={enviarComentario}
              disabled={cargando}
              className="bg-primary-600 text-white px-6 rounded-xl font-semibold hover:bg-primary-700 transition-all disabled:opacity-50 self-end"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 text-center mb-8">
          <p className="text-gray-600">Inicia sesión para comentar</p>
        </div>
      )}

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {comentariosPrincipales.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aún no hay comentarios. ¡Sé el primero en comentar!
          </p>
        ) : (
          comentariosPrincipales.map((comentario) => (
            <div key={comentario.id} className="border-b border-gray-200 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 font-bold text-sm">
                    {comentario.usuario_nombre.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">
                      {comentario.usuario_nombre}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comentario.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {comentario.editado && (
                      <span className="text-xs text-gray-400 italic">
                        (editado)
                      </span>
                    )}
                  </div>
                  
                  {editandoId === comentario.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={textoEditado}
                        onChange={(e) => setTextoEditado(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border-2 border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => guardarEdicion(comentario.id)}
                          className="bg-primary-600 text-white px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-primary-700"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={cancelarEdicion}
                          className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-300"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-700 mb-2">{comentario.comentario}</p>
                  )}
                  
                  <div className="flex items-center gap-3 text-sm">
                    <button
                      onClick={() => setResponderA(comentario.id)}
                      className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      <Reply className="h-4 w-4" />
                      Responder
                    </button>
                    {session?.user?.email === comentario.usuario_id && (
                      <>
                        <button
                          onClick={() => iniciarEdicion(comentario)}
                          className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                          <Edit2 className="h-4 w-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => eliminarComentario(comentario.id)}
                          className="text-red-500 hover:text-red-700 flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </button>
                      </>
                    )}
                  </div>

                  {/* Respuestas */}
                  {obtenerRespuestas(comentario.id).length > 0 && (
                    <div className="mt-4 ml-6 space-y-3">
                      {obtenerRespuestas(comentario.id).map((respuesta) => (
                        <div key={respuesta.id} className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-gray-600 font-bold text-xs">
                              {respuesta.usuario_nombre.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900 text-sm">
                                {respuesta.usuario_nombre}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(respuesta.created_at).toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              {respuesta.editado && (
                                <span className="text-xs text-gray-400 italic">
                                  (editado)
                                </span>
                              )}
                            </div>
                            
                            {editandoId === respuesta.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={textoEditado}
                                  onChange={(e) => setTextoEditado(e.target.value)}
                                  rows={2}
                                  className="w-full px-3 py-2 border-2 border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none text-sm"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => guardarEdicion(respuesta.id)}
                                    className="bg-primary-600 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-primary-700"
                                  >
                                    Guardar
                                  </button>
                                  <button
                                    onClick={cancelarEdicion}
                                    className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-gray-300"
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-700 text-sm">{respuesta.comentario}</p>
                            )}
                            
                            {session?.user?.email === respuesta.usuario_id && (
                              <div className="flex items-center gap-2 mt-2 text-xs">
                                <button
                                  onClick={() => iniciarEdicion(respuesta)}
                                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                >
                                  <Edit2 className="h-3 w-3" />
                                  Editar
                                </button>
                                <button
                                  onClick={() => eliminarComentario(respuesta.id)}
                                  className="text-red-500 hover:text-red-700 flex items-center gap-1"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  Eliminar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
