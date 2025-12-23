'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Award, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { obtenerInscripcionesPorEmail, obtenerEstadisticasUsuario } from '@/lib/inscripciones-storage';

export default function PanelPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCursos: 0,
    cursosCompletados: 0,
    certificados: 0,
    horasEstudio: 0
  });
  const [cargando, setCargando] = useState(true);

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
    if (!session?.user?.email) return;
    
    setCargando(true);
    try {
      // Obtener inscripciones desde localStorage
      const inscripciones = obtenerInscripcionesPorEmail(session.user.email);
      const stats = obtenerEstadisticasUsuario(session.user.email);
      
      // Las estadísticas vienen del helper
      setStats({
        totalCursos: stats.totalCursos,
        cursosCompletados: stats.cursosCompletados,
        certificados: stats.cursosCompletados, // Por ahora igual a cursos completados
        horasEstudio: 0 // No tenemos esta info aún
      });

    } catch (error) {
      console.error('Error al cargar datos del usuario:', error);
    } finally {
      setCargando(false);
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
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Mi Panel</h1>
          <p className="text-lg text-gray-600 mb-8">Aquí tienes un resumen de tu actividad en la plataforma.</p>
          
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
          <div className="mt-8 text-center">
            <a 
              href="/perfil"
              className="inline-block bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold transition-all"
            >
              Ir a mi Perfil
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
