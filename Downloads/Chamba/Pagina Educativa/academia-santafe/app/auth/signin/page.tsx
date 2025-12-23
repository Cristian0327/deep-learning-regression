'use client';

import { getProviders } from "next-auth/react"
import Link from 'next/link';
import { ArrowLeft, GraduationCap, CheckCircle, BookOpen, Users, TrendingUp } from 'lucide-react';
import SignInButtons from "./SignInButtons";
import { useEffect, useState } from 'react';
import type { ClientSafeProvider } from 'next-auth/react';

export default function SignInPage() {
  const [providers, setProviders] = useState<Record<string, ClientSafeProvider> | null>(null);
  const [stats, setStats] = useState({
    cursos: 0,
    estudiantes: 0,
    satisfaccion: 0
  });

  useEffect(() => {
    // Cargar providers
    getProviders().then(setProviders);

    // Cargar estadísticas
    const cargarEstadisticas = async () => {
      try {
        // Contar estudiantes desde la API
        const responseUsuarios = await fetch('/api/user-profile/count');
        const { count: usuariosCount } = await responseUsuarios.json();

        // Intentar contar cursos desde Supabase
        const { count: cursosCount } = await supabase
          .from('cursos')
          .select('*', { count: 'exact', head: true });
        
        setStats({
          cursos: cursosCount || 0,
          estudiantes: usuariosCount || 0,
          satisfaccion: 0
        });
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      }
    };
    cargarEstadisticas();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="absolute top-4 left-4 md:top-8 md:left-8 z-20">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-orange-500 rounded-lg text-white hover:bg-orange-600 font-medium transition-colors shadow-md text-sm md:text-base"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Volver al inicio</span>
          <span className="sm:hidden">Volver</span>
        </Link>
      </div>

      <div className="min-h-screen flex items-center justify-center px-4 py-20 md:py-16">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          
          <div className="hidden lg:block space-y-8">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-3 rounded-xl shadow-lg">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-900">Academia Santafé</h1>
                <p className="text-gray-600 text-sm">Plataforma de Capacitación</p>
              </div>
            </div>

            <div className="space-y-4">
            <div className="bg-blue-900 rounded-xl p-5 shadow-md">
              <div className="flex items-start gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div className="text-white flex-1">
                  <h3 className="font-bold mb-1">Aprende a tu ritmo</h3>
                  <p className="text-sm text-blue-100">Accede desde cualquier dispositivo, en cualquier momento, 24/7</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-500 rounded-xl p-5 shadow-md">
              <div className="flex items-start gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div className="text-white flex-1">
                  <h3 className="font-bold mb-1">Certificación oficial</h3>
                  <p className="text-sm text-orange-50">Obtén certificados reconocidos al completar tus cursos</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-900 rounded-xl p-5 shadow-md">
              <div className="flex items-start gap-3">
                <div className="bg-white/20 p-2 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div className="text-white flex-1">
                  <h3 className="font-bold mb-1">Sin costo para colaboradores</h3>
                  <p className="text-sm text-blue-100">Capacitación continua para el personal de Ladrillera Santafé</p>
                </div>
              </div>
            </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-gray-200">
              <div className="text-center px-4">
                <BookOpen className="h-6 w-6 text-blue-900 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-900">{stats.cursos}+</div>
                <div className="text-sm text-gray-600 mt-1">Cursos</div>
              </div>
              <div className="text-center px-4">
                <Users className="h-6 w-6 text-blue-900 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-900">{stats.estudiantes}+</div>
                <div className="text-sm text-gray-600 mt-1">Estudiantes</div>
              </div>
              <div className="text-center px-4">
                <TrendingUp className="h-6 w-6 text-blue-900 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-900">{stats.satisfaccion}%</div>
                <div className="text-sm text-gray-600 mt-1">Satisfacción</div>
              </div>
            </div>
          </div>

          <div className="w-full lg:pt-16 max-w-md mx-auto lg:max-w-none">
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-gray-200">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  ¡Bienvenido!
                </h2>
                <p className="text-gray-600">
                  {providers && Object.keys(providers).length > 0
                    ? 'Inicia sesión con una de las siguientes opciones'
                    : 'Actualmente no hay métodos de inicio de sesión habilitados.'}
                </p>
              </div>

              <SignInButtons providers={providers} />

              <div className="lg:hidden space-y-3 mt-6">
                <div className="bg-blue-900 rounded-xl p-4 shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                      <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-white flex-1">
                      <h3 className="font-bold mb-1 text-sm">Aprende a tu ritmo</h3>
                      <p className="text-xs text-blue-100">Accede desde cualquier dispositivo, en cualquier momento, 24/7</p>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-500 rounded-xl p-4 shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-white flex-1">
                      <h3 className="font-bold mb-1 text-sm">Certificación oficial</h3>
                      <p className="text-xs text-orange-50">Obtén certificados reconocidos al completar tus cursos</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-900 rounded-xl p-4 shadow-md">
                  <div className="flex items-start gap-3">
                    <div className="bg-white/20 p-2 rounded-lg flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-white flex-1">
                      <h3 className="font-bold mb-1 text-sm">Sin costo para colaboradores</h3>
                      <p className="text-xs text-blue-100">Capacitación continua para el personal de Ladrillera Santafé</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-sm text-gray-500">
                    Acceso seguro con OAuth 2..0
                  </span>
                </div>
              </div>

              <div className="text-center space-y-2">
                <p className="text-xs text-gray-500">
                  Al continuar, aceptas nuestros términos de servicio y política de privacidad.
                </p>
                <p className="text-sm font-semibold text-gray-700">
                  Solo personal autorizado de Ladrillera Santafé puede acceder.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
