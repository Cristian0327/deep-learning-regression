'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  BookOpen, 
  Award, 
  TrendingUp, 
  Clock, 
  Calendar,
  Target,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface ActividadReciente {
  id: string;
  tipo: 'inscripcion' | 'progreso' | 'completado' | 'certificado';
  descripcion: string;
  fecha: string;
  curso_titulo?: string;
  curso_id?: string;
}

export default function PanelPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [actividadesRecientes, setActividadesRecientes] = useState<ActividadReciente[]>([]);
  const [metasSemana, setMetasSemana] = useState({
    cursosCompletados: 0,
    leccionesVistas: 0,
    horasEstudio: 0,
    metaCursosCompletados: 2,
    metaLeccionesVistas: 10,
    metaHorasEstudio: 5
  });

  // Consejos del día rotativos
  const consejosDelDia = [
    'La constancia es clave en el aprendizaje. Dedica al menos 30 minutos diarios a estudiar y verás resultados sorprendentes.',
    'Toma descansos regulares mientras estudias. Tu cerebro necesita tiempo para procesar la información.',
    'Practica lo que aprendes. La mejor manera de dominar un tema es aplicándolo en proyectos reales.',
    'No tengas miedo de hacer preguntas. La curiosidad es el motor del aprendizaje.',
    'Establece metas claras y alcanzables. Celebra cada pequeño logro en tu camino.',
    'Aprende de tus errores. Cada error es una oportunidad para crecer y mejorar.',
    'Comparte lo que aprendes con otros. Enseñar es una excelente forma de reforzar conocimientos.'
  ];

  // Obtener el consejo del día basado en la fecha
  const getConsejoDelDia = () => {
    const hoy = new Date();
    const indiceDia = hoy.getDate() % consejosDelDia.length;
    return consejosDelDia[indiceDia];
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      cargarDatosPanel();
    }
  }, [session]);

  const cargarDatosPanel = async () => {
    if (!session?.user?.id) return;
    
    setCargando(true);
    try {
      // Cargar inscripciones recientes
      const { data: inscripciones, error: errorInscripciones } = await supabase
        .from('inscripciones')
        .select(`
          *,
          cursos (titulo)
        `)
        .eq('user_id', session.user.id)
        .order('fecha_inscripcion', { ascending: false })
        .limit(5);

      if (errorInscripciones) throw errorInscripciones;

      // Construir actividades recientes
      const actividades: ActividadReciente[] = [];
      
      inscripciones?.forEach(ins => {
        // Inscripción
        actividades.push({
          id: `inscripcion-${ins.id}`,
          tipo: 'inscripcion',
          descripcion: `Te inscribiste en ${ins.cursos?.titulo || 'un curso'}`,
          fecha: ins.fecha_inscripcion,
          curso_titulo: ins.cursos?.titulo,
          curso_id: ins.curso_id
        });

        // Completado
        if (ins.completado && ins.fecha_completado) {
          actividades.push({
            id: `completado-${ins.id}`,
            tipo: 'completado',
            descripcion: `Completaste ${ins.cursos?.titulo || 'un curso'}`,
            fecha: ins.fecha_completado,
            curso_titulo: ins.cursos?.titulo,
            curso_id: ins.curso_id
          });
        }
      });

      // Cargar certificados recientes
      const { data: certificados, error: errorCerts } = await supabase
        .from('certificados')
        .select('*')
        .eq('user_id', session.user.id)
        .order('fecha_emision', { ascending: false })
        .limit(3);

      if (!errorCerts && certificados) {
        certificados.forEach(cert => {
          actividades.push({
            id: `certificado-${cert.id}`,
            tipo: 'certificado',
            descripcion: `Obtuviste un certificado para ${cert.curso_titulo}`,
            fecha: cert.fecha_emision,
            curso_titulo: cert.curso_titulo
          });
        });
      }

      // Ordenar por fecha y limitar
      actividades.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      setActividadesRecientes(actividades.slice(0, 8));

      // Calcular metas de la semana
      const inicioSemana = new Date();
      inicioSemana.setDate(inicioSemana.getDate() - 7);
      
      const cursosCompletadosSemana = inscripciones?.filter(i => 
        i.completado && 
        i.fecha_completado && 
        new Date(i.fecha_completado) >= inicioSemana
      ).length || 0;

      setMetasSemana(prev => ({
        ...prev,
        cursosCompletados: cursosCompletadosSemana,
        leccionesVistas: Math.floor(Math.random() * 15), // Placeholder
        horasEstudio: Math.floor(Math.random() * 8) // Placeholder
      }));

    } catch (error) {
      console.error('Error al cargar datos del panel:', error);
    } finally {
      setCargando(false);
    }
  };

  const calcularTiempoTranscurrido = (fecha: string) => {
    const ahora = new Date();
    const fechaActividad = new Date(fecha);
    const diffMs = ahora.getTime() - fechaActividad.getTime();
    const diffMinutos = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMinutos / 60);
    const diffDias = Math.floor(diffHoras / 24);
    
    if (diffDias > 0) return `Hace ${diffDias} día${diffDias > 1 ? 's' : ''}`;
    if (diffHoras > 0) return `Hace ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
    if (diffMinutos > 0) return `Hace ${diffMinutos} minuto${diffMinutos > 1 ? 's' : ''}`;
    return 'Justo ahora';
  };

  const getIconoActividad = (tipo: ActividadReciente['tipo']) => {
    switch (tipo) {
      case 'inscripcion': return <BookOpen className="h-5 w-5 text-blue-500" />;
      case 'progreso': return <TrendingUp className="h-5 w-5 text-primary-500" />;
      case 'completado': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'certificado': return <Award className="h-5 w-5 text-secondary-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  if (status === 'loading' || cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Cargando panel...</p>
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mi Panel de Control</h1>
          <p className="text-gray-600">Gestiona tu actividad y progreso de aprendizaje</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna Principal - Actividades */}
          <div className="lg:col-span-2 space-y-8">
            {/* Actividad Reciente */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary-500 p-2 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Actividad Reciente</h2>
              </div>

              {actividadesRecientes.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">No hay actividades recientes</p>
                  <Link 
                    href="/cursos"
                    className="inline-block mt-4 text-primary-500 hover:text-primary-600 font-semibold"
                  >
                    Explorar Cursos
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {actividadesRecientes.map((actividad) => (
                    <div 
                      key={actividad.id}
                      className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0 mt-1">
                        {getIconoActividad(actividad.tipo)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 font-medium">
                          {actividad.descripcion}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {calcularTiempoTranscurrido(actividad.fecha)}
                        </p>
                      </div>
                      {actividad.curso_id && (
                        <Link
                          href={`/curso/${actividad.curso_id}`}
                          className="text-primary-500 hover:text-primary-600 text-sm font-semibold whitespace-nowrap"
                        >
                          Ver curso →
                        </Link>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Accesos Rápidos */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Accesos Rápidos</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <Link
                  href="/dashboard"
                  className="bg-orange-500 hover:bg-orange-600 rounded-xl p-6 text-white transition-all shadow-md hover:shadow-lg group"
                >
                  <div className="bg-orange-400 bg-opacity-50 p-3 rounded-lg inline-block mb-4">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Mis Cursos</h3>
                  <p className="text-sm text-orange-50">Ver cursos activos</p>
                </Link>

                <Link
                  href="/perfil"
                  className="bg-primary-500 hover:bg-primary-600 rounded-xl p-6 text-white transition-all shadow-md hover:shadow-lg group"
                >
                  <div className="bg-primary-400 bg-opacity-50 p-3 rounded-lg inline-block mb-4">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Certificados</h3>
                  <p className="text-sm text-primary-50">Ver certificados</p>
                </Link>

                <Link
                  href="/cursos"
                  className="bg-primary-500 hover:bg-primary-600 rounded-xl p-6 text-white transition-all shadow-md hover:shadow-lg group"
                >
                  <div className="bg-primary-400 bg-opacity-50 p-3 rounded-lg inline-block mb-4">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Explorar</h3>
                  <p className="text-sm text-primary-50">Nuevos cursos</p>
                </Link>

                <Link
                  href="/dashboard/notificaciones"
                  className="bg-orange-500 hover:bg-orange-600 rounded-xl p-6 text-white transition-all shadow-md hover:shadow-lg group"
                >
                  <div className="bg-orange-400 bg-opacity-50 p-3 rounded-lg inline-block mb-4">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">Notificaciones</h3>
                  <p className="text-sm text-orange-50">Ver novedades</p>
                </Link>
              </div>
            </div>
          </div>

          {/* Columna Lateral - Metas */}
          <div className="space-y-8">
            {/* Metas de la Semana */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-secondary-500 p-2 rounded-lg">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Metas de la Semana</h2>
              </div>

              <div className="space-y-6">
                {/* Cursos Completados */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Cursos Completados</span>
                    <span className="text-sm font-bold text-gray-900">
                      {metasSemana.cursosCompletados}/{metasSemana.metaCursosCompletados}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min((metasSemana.cursosCompletados / metasSemana.metaCursosCompletados) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Lecciones Vistas */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Lecciones Vistas</span>
                    <span className="text-sm font-bold text-gray-900">
                      {metasSemana.leccionesVistas}/{metasSemana.metaLeccionesVistas}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min((metasSemana.leccionesVistas / metasSemana.metaLeccionesVistas) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Horas de Estudio */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Horas de Estudio</span>
                    <span className="text-sm font-bold text-gray-900">
                      {metasSemana.horasEstudio}/{metasSemana.metaHorasEstudio}h
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all"
                      style={{ 
                        width: `${Math.min((metasSemana.horasEstudio / metasSemana.metaHorasEstudio) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-secondary-500 rounded-xl">
                <p className="text-sm text-white text-center">
                  ¡Sigue así! Estás haciendo un gran progreso esta semana 🎉
                </p>
              </div>
            </div>

            {/* Consejo del día */}
            <div className="bg-primary-500 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-3">💡 Consejo del Día</h3>
              <p className="text-sm leading-relaxed">
                {getConsejoDelDia()}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
