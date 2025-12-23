'use client';

import Link from 'next/link';
import { Shield, Factory, Award as AwardIcon, Users, Wrench, TrendingUp } from 'lucide-react';

export function Categories() {
  const categories = [
    {
      name: 'Seguridad Industrial',
      icon: Shield,
      count: 12,
      color: 'primary',
      slug: 'seguridad',
    },
    {
      name: 'Producción',
      icon: Factory,
      count: 8,
      color: 'secondary',
      slug: 'produccion',
    },
    {
      name: 'Calidad',
      icon: AwardIcon,
      count: 6,
      color: 'primary',
      slug: 'calidad',
    },
    {
      name: 'Liderazgo',
      icon: Users,
      count: 10,
      color: 'secondary',
      slug: 'liderazgo',
    },
    {
      name: 'Mantenimiento',
      icon: Wrench,
      count: 7,
      color: 'primary',
      slug: 'mantenimiento',
    },
    {
      name: 'Mejora Continua',
      icon: TrendingUp,
      count: 5,
      color: 'secondary',
      slug: 'mejora-continua',
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Explora por Categoría
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Encuentra cursos especializados en las áreas más importantes para tu desarrollo profesional
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <Link
              key={index}
              href={`/categorias/${category.slug}`}
              className="group card p-6 hover:border-primary transition-all duration-200 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start space-x-4">
                <div className={`w-14 h-14 bg-${category.color}-50 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-${category.color} transition-colors duration-200`}>
                  <category.icon className={`w-7 h-7 text-${category.color} group-hover:text-white transition-colors duration-200`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors duration-200">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {category.count} {category.count === 1 ? 'curso' : 'cursos'}
                  </p>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
