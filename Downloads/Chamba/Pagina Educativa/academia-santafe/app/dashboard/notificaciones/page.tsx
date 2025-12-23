'use client';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Bell, 
  Award, 
  BookOpen, 
  MessageCircle, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Trash2,
  Check,
  X
} from 'lucide-react';
import Link from 'next/link';

interface Notificacion {
  id: string;
  tipo: 'curso_nuevo' | 'recordatorio' | 'certificado' | 'mensaje' | 'actualizacion' | 'sistema';
  titulo: string;
  descripcion: string;
  leida: boolean;
  fecha_creacion: string;
  curso_id?: string;
  url_accion?: string;
}

export default function NotificacionesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState<'todas' | 'no_leidas'>('todas');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.id) {
      cargarNotificaciones();
    }
  }, [session]);

  const cargarNotificaciones = async () => {
    if (!session?.user?.id) return;
    
    setCargando(true);
    
    // Cargar desde el archivo del servidor
    try {
      const response = await fetch(`/api/notificaciones?userId=${session.user.id}`);
      const { notificaciones: notifServidor } = await response.json();
      
      if (notifServidor && notifServidor.length > 0) {
        setNotificaciones(notifServidor);
        localStorage.setItem(`notificaciones_${session.user.id}`, JSON.stringify(notifServidor));
        setCargando(false);
        return;
      }
    } catch (error) {
      console.warn('Error al cargar notificaciones desde servidor:', error);
    }
    
    // Si no hay notificaciones en el servidor, crear una de bienvenida
    const notificacionesEjemplo: Notificacion[] = [
      {
        id: '1',
        tipo: 'sistema',
        titulo: '¡Bienvenido a Academia Santafé!',
        descripcion: 'Estamos emocionados de tenerte aquí. Explora nuestros cursos y comienza tu viaje de aprendizaje.',
        leida: false,
        fecha_creacion: new Date().toISOString(),
      },
      {
        id: '2',
        tipo: 'curso_nuevo',
        titulo: 'Nuevos cursos disponibles',
        descripcion: 'Se han agregado nuevos cursos a la plataforma. ¡Échales un vistazo!',
        leida: false,
        fecha_creacion: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        url_accion: '/cursos'
      },
      {
        id: '3',
        tipo: 'recordatorio',
        titulo: 'Continúa con tu aprendizaje',
        descripcion: 'Tienes cursos en progreso esperándote. ¡No pierdas el ritmo!',
        leida: true,
        fecha_creacion: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        url_accion: '/dashboard'
      }
    ];
    
    setNotificaciones(notificacionesEjemplo);
    localStorage.setItem(`notificaciones_${session.user.id}`, JSON.stringify(notificacionesEjemplo));
    setCargando(false);
  };

  const marcarComoLeida = async (id: string) => {
    // Actualizar estado local PRIMERO
    const notificacionesActualizadas = notificaciones.map(notif =>
      notif.id === id ? { ...notif, leida: true } : notif
    );
    setNotificaciones(notificacionesActualizadas);
    
    // Guardar en localStorage
    localStorage.setItem(`notificaciones_${session?.user?.id}`, JSON.stringify(notificacionesActualizadas));
    
    // Intentar actualizar en Supabase (opcional)
    try {
      await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('id', id);
    } catch (error) {
      console.warn('No se pudo actualizar en Supabase:', error);
    }
    
    // Notificar al navbar
    window.dispatchEvent(new Event('notificacionesActualizadas'));
  };

  const marcarTodasComoLeidas = async () => {
    // Actualizar estado local PRIMERO
    const notificacionesActualizadas = notificaciones.map(notif => ({ ...notif, leida: true }));
    setNotificaciones(notificacionesActualizadas);
    
    // Guardar en localStorage
    localStorage.setItem(`notificaciones_${session?.user?.id}`, JSON.stringify(notificacionesActualizadas));
    
    // Intentar actualizar en Supabase (opcional)
    try {
      await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('user_id', session?.user?.id);
    } catch (error) {
      console.warn('No se pudo actualizar en Supabase:', error);
    }
    
    // Notificar al navbar
    window.dispatchEvent(new Event('notificacionesActualizadas'));
  };

  const eliminarNotificacion = async (id: string) => {
    // Actualizar estado local PRIMERO
    const notificacionesActualizadas = notificaciones.filter(notif => notif.id !== id);
    setNotificaciones(notificacionesActualizadas);
    
    // Guardar en localStorage
    localStorage.setItem(`notificaciones_${session?.user?.id}`, JSON.stringify(notificacionesActualizadas));
    
    // Intentar eliminar en Supabase (opcional)
    try {
      await supabase
        .from('notificaciones')
        .delete()
        .eq('id', id);
    } catch (error) {
      console.warn('No se pudo eliminar en Supabase:', error);
    }
    
    // Notificar al navbar
    window.dispatchEvent(new Event('notificacionesActualizadas'));
  };

  const calcularTiempoTranscurrido = (fecha: string) => {
    const ahora = new Date();
    const fechaNotif = new Date(fecha);
    const diffMs = ahora.getTime() - fechaNotif.getTime();
    const diffMinutos = Math.floor(diffMs / (1000 * 60));
    const diffHoras = Math.floor(diffMinutos / 60);
    const diffDias = Math.floor(diffHoras / 24);
    
    if (diffDias > 0) return `Hace ${diffDias} día${diffDias > 1 ? 's' : ''}`;
    if (diffHoras > 0) return `Hace ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`;
    if (diffMinutos > 0) return `Hace ${diffMinutos} minuto${diffMinutos > 1 ? 's' : ''}`;
    return 'Justo ahora';
  };

  const getIconoNotificacion = (tipo: Notificacion['tipo']) => {
    switch (tipo) {
      case 'curso_nuevo': return <BookOpen className="h-6 w-6 text-blue-500" />;
      case 'recordatorio': return <AlertCircle className="h-6 w-6 text-orange-500" />;
      case 'certificado': return <Award className="h-6 w-6 text-secondary-500" />;
      case 'mensaje': return <MessageCircle className="h-6 w-6 text-green-500" />;
      case 'actualizacion': return <TrendingUp className="h-6 w-6 text-primary-500" />;
      case 'sistema': return <Bell className="h-6 w-6 text-primary-500" />;
      default: return <Bell className="h-6 w-6 text-gray-500" />;
    }
  };

  const getColorFondo = (tipo: Notificacion['tipo']) => {
    switch (tipo) {
      case 'curso_nuevo': return 'bg-blue-50';
      case 'recordatorio': return 'bg-orange-50';
      case 'certificado': return 'bg-secondary-50';
      case 'mensaje': return 'bg-green-50';
      case 'actualizacion': return 'bg-primary-50';
      case 'sistema': return 'bg-primary-50';
      default: return 'bg-gray-50';
    }
  };

  const notificacionesFiltradas = filtro === 'todas' 
    ? notificaciones 
    : notificaciones.filter(n => !n.leida);

  const cantidadNoLeidas = notificaciones.filter(n => !n.leida).length;

  if (status === 'loading' || cargando) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Cargando notificaciones...</p>
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
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Notificaciones</h1>
              <p className="text-gray-600">
                Tienes {cantidadNoLeidas} notificación{cantidadNoLeidas !== 1 ? 'es' : ''} sin leer
              </p>
            </div>
            {cantidadNoLeidas > 0 && (
              <button
                onClick={marcarTodasComoLeidas}
                className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-semibold transition-all"
              >
                <CheckCircle className="h-5 w-5" />
                Marcar todas como leídas
              </button>
            )}
          </div>

          {/* Filtros */}
          <div className="flex gap-3">
            <button
              onClick={() => setFiltro('todas')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filtro === 'todas'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Todas ({notificaciones.length})
            </button>
            <button
              onClick={() => setFiltro('no_leidas')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filtro === 'no_leidas'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              No leídas ({cantidadNoLeidas})
            </button>
          </div>
        </div>

        {/* Lista de Notificaciones */}
        {notificacionesFiltradas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {filtro === 'todas' ? 'No tienes notificaciones' : 'No tienes notificaciones sin leer'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filtro === 'todas' 
                ? 'Te notificaremos sobre nuevos cursos y actualizaciones' 
                : '¡Estás al día con todas tus notificaciones!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notificacionesFiltradas.map((notif) => (
              <div
                key={notif.id}
                className={`bg-white rounded-xl shadow-md border-2 transition-all hover:shadow-lg ${
                  notif.leida 
                    ? 'border-gray-200' 
                    : 'border-primary-300 bg-primary-50/30'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icono */}
                    <div className={`flex-shrink-0 p-3 rounded-lg ${getColorFondo(notif.tipo)}`}>
                      {getIconoNotificacion(notif.tipo)}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-lg font-bold text-gray-900">
                          {notif.titulo}
                          {!notif.leida && (
                            <span className="ml-2 inline-block w-2 h-2 bg-primary-500 rounded-full"></span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500 whitespace-nowrap">
                          {calcularTiempoTranscurrido(notif.fecha_creacion)}
                        </p>
                      </div>
                      
                      <p className="text-gray-600 mb-4">{notif.descripcion}</p>

                      {/* Acciones */}
                      <div className="flex items-center gap-3">
                        {notif.url_accion && (
                          <Link
                            href={notif.url_accion}
                            onClick={() => marcarComoLeida(notif.id)}
                            className="text-primary-500 hover:text-primary-600 font-semibold text-sm"
                          >
                            Ver más →
                          </Link>
                        )}
                        
                        {!notif.leida && (
                          <button
                            onClick={() => marcarComoLeida(notif.id)}
                            className="flex items-center gap-1 text-green-600 hover:text-green-700 font-semibold text-sm"
                          >
                            <Check className="h-4 w-4" />
                            Marcar como leída
                          </button>
                        )}

                        <button
                          onClick={() => eliminarNotificacion(notif.id)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 font-semibold text-sm ml-auto"
                        >
                          <Trash2 className="h-4 w-4" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
