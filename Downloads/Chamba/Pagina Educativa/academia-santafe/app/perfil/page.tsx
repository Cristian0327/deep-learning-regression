'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { User, Mail, Award, BookOpen, Download, Calendar, Star, CheckCircle, Clock } from 'lucide-react';

interface Certificado {
  id: string;
  curso_titulo: string;
  instructor: string;
  codigo_verificacion: string;
  fecha_emision: string;
  calificacion: number;
  url_certificado?: string;
}

interface CursoCompletado {
  id: string;
  titulo: string;
  categoria: string;
  progreso: number;
  completado: boolean;
  fecha_inscripcion: string;
  fecha_completado?: string;
  calificacion?: number;
}

export default function PerfilPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [certificados, setCertificados] = useState<Certificado[]>([]);
  const [cursosCompletados, setCursosCompletados] = useState<CursoCompletado[]>([]);
  const [cursosEnProgreso, setCursosEnProgreso] = useState<CursoCompletado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [stats, setStats] = useState({
    totalCursos: 0,
    cursosCompletados: 0,
    certificados: 0,
    horasEstudio: 0
  });
  // Edición de perfil
  const [editName, setEditName] = useState(session?.user?.name || '');
  const [editImage, setEditImage] = useState(session?.user?.image || '');
  const [editFile, setEditFile] = useState<File | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      cargarDatosUsuario();
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      setEditName(session.user?.name || '');
      setEditImage(session.user?.image || '');
    }
  }, [session]);

  const cargarDatosUsuario = async () => {
    if (!session?.user?.id) return;
    
    setCargando(true);
    try {
      // Cargar inscripciones del usuario
      const { data: inscripciones, error: errorInscripciones } = await supabase
        .from('inscripciones')
        .select(`
          *,
          cursos (
            id,
            titulo,
            categoria,
            duracion,
            instructor
          )
        `)
        .eq('user_id', session.user.id)
        .order('fecha_inscripcion', { ascending: false });

      if (errorInscripciones) throw errorInscripciones;

      // Separar cursos completados y en progreso
      const completados = inscripciones?.filter(i => i.completado) || [];
      const enProgreso = inscripciones?.filter(i => !i.completado) || [];

      setCursosCompletados(completados.map(i => ({
        id: i.curso_id,
        titulo: i.cursos?.titulo || 'Sin título',
        categoria: i.cursos?.categoria || 'General',
        progreso: i.progreso,
        completado: i.completado,
        fecha_inscripcion: i.fecha_inscripcion,
        fecha_completado: i.fecha_completado,
        calificacion: i.calificacion
      })));

      setCursosEnProgreso(enProgreso.map(i => ({
        id: i.curso_id,
        titulo: i.cursos?.titulo || 'Sin título',
        categoria: i.cursos?.categoria || 'General',
        progreso: i.progreso,
        completado: i.completado,
        fecha_inscripcion: i.fecha_inscripcion
      })));

      // Cargar certificados
      const { data: certs, error: errorCerts } = await supabase
        .from('certificados')
        .select('*')
        .eq('user_id', session.user.id)
        .order('fecha_emision', { ascending: false });

      if (errorCerts) throw errorCerts;
      setCertificados(certs || []);

      // Calcular estadísticas
      const totalHoras = inscripciones?.reduce((sum, i) => {
        const duracion = i.cursos?.duracion || '0';
        const horas = parseFloat(duracion.replace(/[^0-9.]/g, '')) || 0;
        return sum + (horas * (i.progreso / 100));
      }, 0) || 0;

      setStats({
        totalCursos: inscripciones?.length || 0,
        cursosCompletados: completados.length,
        certificados: certs?.length || 0,
        horasEstudio: Math.round(totalHoras * 10) / 10
      });

    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    } finally {
      setCargando(false);
    }
  };

  const descargarCertificado = async (certificado: Certificado) => {
    if (certificado.url_certificado) {
      window.open(certificado.url_certificado, '_blank');
    } else {
      alert('Certificado no disponible para descarga');
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (status === 'loading' || cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header del Perfil */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              {editImage ? (
                <img 
                  src={editImage} 
                  alt={editName || ''} 
                  className="h-32 w-32 rounded-full ring-4 ring-primary-500 ring-offset-4 object-cover"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-primary-500 flex items-center justify-center ring-4 ring-primary-500 ring-offset-4">
                  <User className="h-16 w-16 text-white" />
                </div>
              )}
              <div className="absolute bottom-0 right-0 h-10 w-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>

            {/* Información del Usuario y edición */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {editName || 'Usuario'}
              </h1>
              <div className="flex flex-col md:flex-row items-center md:items-start gap-3 text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary-500" />
                  <span>{session.user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary-500" />
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                    {session.user?.role === 'admin' ? 'Administrador' : 
                     session.user?.role === 'instructor' ? 'Instructor' : 'Estudiante'}
                  </span>
                </div>
              </div>
              {/* Formulario de edición */}
              <form
                className="mt-4 space-y-3"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setEditLoading(true);
                  setEditError('');
                  setEditSuccess('');
                  let imageUrl = session?.user?.image || '';

                  try {
                    // 1. Subir nueva imagen si existe
                    if (editFile) {
                      const fileExt = editFile.name.split('.').pop();
                      const fileName = `${session.user.id}_${Date.now()}.${fileExt}`;
                      
                      const { error: uploadError } = await supabase.storage
                        .from('avatars')
                        .upload(fileName, editFile, {
                          cacheControl: '3600',
                          upsert: true,
                        });

                      if (uploadError) {
                        // Si el bucket no existe, mantener la imagen actual
                        console.warn('Error al subir imagen:', uploadError);
                        imageUrl = editImage;
                      } else {
                        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(fileName);
                        imageUrl = urlData.publicUrl;
                      }
                    }

                    // 2. Guardar en servidor mediante API
                    const perfilActualizado = {
                      nombre: editName,
                      imagen: imageUrl
                    };
                    
                    // Guardar en localStorage como cache
                    localStorage.setItem('user_profile', JSON.stringify({
                      id: session.user.id,
                      ...perfilActualizado,
                      email: session.user.email,
                      rol: session.user.role || 'student',
                      ultima_actualizacion: new Date().toISOString()
                    }));

                    // 3. Guardar en servidor (archivo JSON)
                    try {
                      const response = await fetch('/api/user-profile', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(perfilActualizado)
                      });

                      if (!response.ok) {
                        throw new Error('Error guardando en servidor');
                      }
                      
                      console.log('✅ Guardado en servidor correctamente');
                    } catch (apiError: any) {
                      console.error('❌ Error guardando en servidor:', apiError);
                    }

                    // 4. Intentar guardar en Supabase (opcional)
                    try {
                      await supabase
                        .from('usuarios')
                        .upsert({
                          id: session.user.id,
                          nombre: editName,
                          email: session.user.email,
                          imagen: imageUrl,
                          rol: session.user.role || 'student',
                          ultima_actualizacion: new Date().toISOString()
                        }, {
                          onConflict: 'id'
                        });
                    } catch (supabaseError: any) {
                      console.warn('Supabase no disponible:', supabaseError);
                    }

                    // 5. Actualizar la sesión de NextAuth
                    await update({
                      trigger: 'update',
                      user: {
                        name: editName,
                        image: imageUrl,
                      },
                    });

                    setEditSuccess('¡Perfil actualizado con éxito!');
                    setEditName(editName);
                    setEditImage(imageUrl);
                    setEditFile(null);
                    
                    // Recargar la página después de 1.5 segundos para ver los cambios
                    setTimeout(() => {
                      window.location.reload();
                    }, 1500);

                  } catch (err: any) {
                    setEditError(err.message || 'Ocurrió un error inesperado. Por favor, intenta de nuevo.');
                    console.error('Error al actualizar perfil:', err);
                  } finally {
                    setEditLoading(false);
                  }
                }}
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cambiar foto de perfil</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setEditFile(file);
                        // Previsualización de la imagen
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setEditImage(event.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                </div>
                {editError && (
                  <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                    {editError}
                  </div>
                )}
                {editSuccess && (
                  <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
                    {editSuccess}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={editLoading}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-xl font-semibold transition-all mt-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {editLoading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </form>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-200">
            <div className="text-center">
              <div className="bg-primary-100 p-3 rounded-xl inline-block mb-2">
                <BookOpen className="h-8 w-8 text-primary-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCursos}</p>
              <p className="text-sm text-gray-600">Cursos Inscritos</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 p-3 rounded-xl inline-block mb-2">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.cursosCompletados}</p>
              <p className="text-sm text-gray-600">Completados</p>
            </div>
            <div className="text-center">
              <div className="bg-secondary-100 p-3 rounded-xl inline-block mb-2">
                <Award className="h-8 w-8 text-secondary-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.certificados}</p>
              <p className="text-sm text-gray-600">Certificados</p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 p-3 rounded-xl inline-block mb-2">
                <Clock className="h-8 w-8 text-primary-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.horasEstudio}h</p>
              <p className="text-sm text-gray-600">Horas de Estudio</p>
            </div>
          </div>
        </div>

        {/* Certificados */}
        {certificados.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-secondary-100 p-3 rounded-xl">
                <Award className="h-8 w-8 text-secondary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Mis Certificados</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {certificados.map((cert) => (
                <div key={cert.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-secondary-400 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{cert.curso_titulo}</h3>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Instructor:</strong> {cert.instructor}
                      </p>
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatearFecha(cert.fecha_emision)}
                      </p>
                      {cert.calificacion && (
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          Calificación: <strong>{cert.calificacion}%</strong>
                        </p>
                      )}
                    </div>
                    <Award className="h-12 w-12 text-secondary-500" />
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-500 mb-1">Código de Verificación</p>
                    <p className="font-mono text-sm font-bold text-gray-900">{cert.codigo_verificacion}</p>
                  </div>

                  <button
                    onClick={() => descargarCertificado(cert)}
                    className="w-full bg-secondary-500 hover:bg-secondary-600 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    Descargar Certificado
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cursos en Progreso */}
        {cursosEnProgreso.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary-100 p-3 rounded-xl">
                <BookOpen className="h-8 w-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Cursos en Progreso</h2>
            </div>

            <div className="space-y-4">
              {cursosEnProgreso.map((curso) => (
                <div key={curso.id} className="border-2 border-gray-200 rounded-xl p-6 hover:border-primary-400 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{curso.titulo}</h3>
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                        {curso.categoria}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-primary-600">{curso.progreso}%</p>
                      <p className="text-sm text-gray-600">Completado</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-primary-500 h-3 rounded-full transition-all"
                        style={{ width: `${curso.progreso}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Inscrito el {formatearFecha(curso.fecha_inscripcion)}
                    </p>
                    <a 
                      href={`/curso/${curso.id}`}
                      className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold transition-all"
                    >
                      Continuar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cursos Completados */}
        {cursosCompletados.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-green-100 p-3 rounded-xl">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Cursos Completados</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cursosCompletados.map((curso) => (
                <div key={curso.id} className="border-2 border-green-200 rounded-xl p-6 bg-green-50 hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 flex-1">{curso.titulo}</h3>
                    <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  </div>
                  <span className="inline-block px-3 py-1 bg-green-200 text-green-800 rounded-full text-xs font-semibold mb-3">
                    {curso.categoria}
                  </span>
                  {curso.calificacion && (
                    <p className="text-sm text-gray-700 mb-2 flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <strong>Calificación:</strong> {curso.calificacion}%
                    </p>
                  )}
                  <p className="text-xs text-gray-600">
                    Completado el {curso.fecha_completado ? formatearFecha(curso.fecha_completado) : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensaje si no hay cursos */}
        {cursosEnProgreso.length === 0 && cursosCompletados.length === 0 && !cargando && (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No tienes cursos inscritos</h3>
            <p className="text-gray-600 mb-6">¡Explora nuestro catálogo y comienza a aprender!</p>
            <a 
              href="/cursos"
              className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold transition-all"
            >
              Ver Cursos Disponibles
            </a>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
