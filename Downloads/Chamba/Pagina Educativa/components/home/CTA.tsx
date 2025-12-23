'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-20 bg-primary">
      <div className="container-custom">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            ¿Listo para comenzar tu aprendizaje?
          </h2>
          <p className="text-xl text-primary-100">
            Únete a cientos de colaboradores que ya están desarrollando sus habilidades profesionales
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/auth/signin" className="bg-white text-primary hover:bg-gray-50 font-medium px-8 py-4 rounded-lg transition-all duration-200 hover:shadow-lg active:scale-95 inline-flex items-center justify-center space-x-2 group">
              <span>Comenzar Ahora</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <Link href="/cursos" className="border-2 border-white text-white hover:bg-white hover:text-primary font-medium px-8 py-4 rounded-lg transition-all duration-200 inline-flex items-center justify-center">
              Explorar Cursos
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
