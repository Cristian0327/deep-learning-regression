'use client';

import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative bg-white pt-16 pb-24 overflow-hidden">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-block">
              <span className="bg-secondary-50 text-secondary px-4 py-2 rounded-full text-sm font-medium">
                Plataforma de Capacitación Corporativa
              </span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Desarrolla tus
              <span className="text-primary"> habilidades </span>
              profesionales
            </h1>
            
            <p className="text-xl text-gray-600 leading-relaxed">
              Accede a cursos especializados en seguridad industrial, producción y liderazgo. 
              Aprende a tu ritmo y obtén certificaciones oficiales.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/cursos" className="btn-primary inline-flex items-center justify-center space-x-2 group">
                <span>Explorar Cursos</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              
              <Link href="#como-funciona" className="btn-outline inline-flex items-center justify-center space-x-2">
                <Play className="w-5 h-5" />
                <span>Ver Cómo Funciona</span>
              </Link>
            </div>
          </div>

          {/* Right content - Image placeholder */}
          <div className="relative animate-slide-up">
            <div className="aspect-square bg-primary-50 rounded-2xl relative">
              {/* Decorative elements */}
              <div className="absolute top-10 right-10 w-32 h-32 bg-primary rounded-lg opacity-20"></div>
              <div className="absolute bottom-10 left-10 w-24 h-24 bg-secondary rounded-lg opacity-20"></div>
              
              {/* Floating cards */}
              <div className="absolute top-20 -left-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100 animate-scale-in">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">850+ Estudiantes</p>
                    <p className="text-xs text-gray-500">Activos este mes</p>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-20 -right-6 bg-white p-4 rounded-xl shadow-lg border border-gray-100 animate-scale-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-secondary rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">45+ Cursos</p>
                    <p className="text-xs text-gray-500">Disponibles</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-50 opacity-5 -z-10"></div>
    </section>
  );
}
