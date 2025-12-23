'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Bell, Check, Eye } from 'lucide-react';

interface Notificacion {
  id: string;
  mensaje: string;
  url: string | null;
  leido: boolean;
  created_at: string;
}

export default function NotificacionesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);

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
    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotificaciones(data || []);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setCargando(false);
    }
  };

  const marcarComoLeida = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notificaciones')
        .update({ leido: true })
        .eq('id', id);
      if (error) throw error;
      setNotificaciones(notificaciones.map(n => n.id === id ? { ...n, leido: true } : n));
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const marcarTodasComoLeidas = async () => {
    try {
      const { error } = await supabase
        .from('notificaciones')
        .update({ leido: true })
        .eq('user_id', session?.user?.id)
        .eq('leido', false);
      if (error) throw error;
      setNotificaciones(notificaciones.map(n => ({ ...n, leido: true })));
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <Bell className="h-10 w-10 text-primary-600" />
            <h1 className="text-4xl font-bold text-gray-900">Notificaciones</h1>
          </div>
          {notificaciones.some(n => !n.leido) && (
            <button
              onClick={marcarTodasComoLeidas}
              className="bg-primary-500 hover:bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center gap-2"
            >
              <Check className="h-5 w-5" />
              Marcar todas como leídas
            </button>
          )}
        </div>

        {cargando ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-semibold">Cargando notificaciones...</p>
          </div>
        ) : notificaciones.length === 0 ? (
          <div className="text-center bg-white rounded-xl p-12 shadow-md border">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-700">No tienes notificaciones nuevas.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notificaciones.map((n) => (
              <div
                key={n.id}
                className={`p-6 rounded-xl border-2 transition-all ${
                  n.leido ? 'bg-white border-gray-200' : 'bg-primary-50 border-primary-300 shadow-lg'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <p className={`text-gray-800 ${!n.leido && 'font-semibold'}`}>{n.mensaje}</p>
                    <p className="text-sm text-gray-500 mt-2">{formatearFecha(n.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {n.url && (
                      <a href={n.url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-100 rounded-md">
                        <Eye className="h-5 w-5" />
                      </a>
                    )}
                    {!n.leido && (
                      <button
                        onClick={() => marcarComoLeida(n.id)}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-100 rounded-md"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                    )}
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
