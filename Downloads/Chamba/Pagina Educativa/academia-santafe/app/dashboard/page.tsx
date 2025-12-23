'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { BookOpen, Clock, Award, TrendingUp, Play, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

interface Curso {
  id: string;
  titulo: string;
  categoria: string;
  imagen?: string;
  instructor: string;
}

interface Inscripcion {
  id: string;
  progreso: number;
  completado: boolean;
  fecha_inscripcion: string;
  cursos: Curso;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cursosInscritos, setCursosInscritos] = useState<Inscripcion[]>([]);
  const [todosLosCursos, setTodosLosCursos] = useState<Curso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [stats, setStats] = useState({
    cursosActivos: 0,
    horasCompletadas: 0,
    certificados: 0,
    progresoPromedio: 0
  });

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
            imagen,
            instructor,
            duracion
          )
        `)
        .eq('user_id', session.user.id)
        .eq('activo', true)
        .order('fecha_inscripcion', { ascending: false });

      if (errorInscripciones) throw errorInscripciones;
      setCursosInscritos(inscripciones || []);

      // Cargar certificados
      const { data: certificados, error: errorCerts } = await supabase
        .from('certificados')
        .select('id')
        .eq('user_id', session.user.id);

      if (errorCerts) throw errorCerts;

      // Calcular estadísticas
      const cursosActivos = inscripciones?.filter(i => !i.completado).length || 0;
      const promedioProgreso = inscripciones && inscripciones.length > 0
        ? Math.round(inscripciones.reduce((sum, i) => sum + i.progreso, 0) / inscripciones.length)
        : 0;
      
      const horasEstimadas = inscripciones?.reduce((sum, i) => {
        const duracion = i.cursos?.duracion || '0';
        const horas = parseFloat(duracion.replace(/[^0-9.]/g, '')) || 0;
        return sum + (horas * (i.progreso / 100));
      }, 0) || 0;

      setStats({
        cursosActivos,
        horasCompletadas: Math.round(horasEstimadas * 10) / 10,
        certificados: certificados?.length || 0,
        progresoPromedio: promedioProgreso
      });

      // Cargar cursos recomendados (no inscritos)
      const idsInscritos = inscripciones?.map(i => i.curso_id) || [];
      const { data: cursos, error: errorCursos } = await supabase
        .from('cursos')
        .select('id, titulo, categoria, imagen, instructor')
        .not('id', 'in', `(${idsInscritos.join(',')})`)
        .limit(3);

      if (!errorCursos && cursos) {
        setTodosLosCursos(cursos);
      }

    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    } finally {
      setCargando(false);
    }
  };

  const calcularTiempoTranscurrido = (fecha: string) => {
    const ahora = new Date();
    const fechaInscripcion = new Date(fecha);
    const diffMs = ahora.getTime() - fechaInscripcion.getTime();
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDias = Math.floor(diffHoras / 24);
    
    if (diffDias > 0) return `Hace ${diffDias} día${diffDias > 1 ? 's' : ''}`;
    if (diffHoras > 0) return `Hace ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
    return 'Hace poco';
  };

  if (status === 'loading' || cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const statsArray = [
    { label: 'Cursos Activos', value: stats.cursosActivos.toString(), icon: BookOpen, color: 'bg-primary-500' },
    { label: 'Horas Completadas', value: stats.horasCompletadas.toString(), icon: Clock, color: 'bg-secondary-500' },
    { label: 'Certificados', value: stats.certificados.toString(), icon: Award, color: 'bg-primary-500' },
    { label: 'Progreso Promedio', value: `${stats.progresoPromedio}%`, icon: TrendingUp, color: 'bg-secondary-500' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            ¡Hola, {session.user?.name || 'Usuario'}! 👋
          </h1>
          <p className="text-gray-600">Continúa con tu aprendizaje</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statsArray.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-xl`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-gray-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Cursos en progreso */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Mis Cursos</h2>
            <Link href="/cursos" className="text-primary-500 hover:text-primary-600 font-semibold inline-flex items-center">
              Ver todos
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>

          {cursosInscritos.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No tienes cursos inscritos</h3>
              <p className="text-gray-600 mb-6">¡Explora nuestro catálogo y comienza a aprender!</p>
              <Link 
                href="/cursos"
                className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold transition-all"
              >
                Explorar Cursos
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cursosInscritos.map((inscripcion) => (
                <div key={inscripcion.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                  <div className={`h-48 ${inscripcion.cursos.imagen ? '' : 'bg-gradient-to-br from-primary-500 to-secondary-500'} flex items-center justify-center relative`}>
                    {inscripcion.cursos.imagen ? (
                      <img 
                        src={inscripcion.cursos.imagen} 
                        alt={inscripcion.cursos.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Play className="h-16 w-16 text-white opacity-50" />
                    )}
                    {inscripcion.completado && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Completado
                      </div>
                    )}
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-3">
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                        {inscripcion.cursos.categoria}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{inscripcion.cursos.titulo}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      <strong>Instructor:</strong> {inscripcion.cursos.instructor}
                    </p>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Progreso</span>
                        <span className="font-semibold">{inscripcion.progreso}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-primary-500 h-3 rounded-full transition-all"
                          style={{ width: `${inscripcion.progreso}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                      <span>{calcularTiempoTranscurrido(inscripcion.fecha_inscripcion)}</span>
                    </div>

                    <Link 
                      href={`/curso/${inscripcion.cursos.id}`}
                      className="block w-full text-center bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-xl transition-all"
                    >
                      {inscripcion.completado ? 'Ver Curso' : 'Continuar Curso'}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cursos recomendados */}
        {todosLosCursos.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Cursos Recomendados</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {todosLosCursos.map((curso) => (
                <div key={curso.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all group">
                  <div className={`h-32 ${curso.imagen ? '' : 'bg-gradient-to-br from-primary-500 to-secondary-500'} flex items-center justify-center`}>
                    {curso.imagen ? (
                      <img 
                        src={curso.imagen} 
                        alt={curso.titulo}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="h-12 w-12 text-white opacity-50" />
                    )}
                  </div>
                  
                  <div className="p-6">
                    <span className="text-xs font-semibold text-gray-500 uppercase">{curso.categoria}</span>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 mt-1">{curso.titulo}</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      <strong>Instructor:</strong> {curso.instructor}
                    </p>
                    
                    <Link
                      href={`/curso/${curso.id}`}
                      className="block w-full text-center border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white font-semibold py-2 rounded-xl transition-all"
                    >
                      Ver Detalles
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
